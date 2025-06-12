// Validation functions for MonoSchema
import type { MonoSchemaProperty, Plugin, ValidationError, MonoSchemaInstance } from "./types";
import { getValueTypeName, isCustomType, validateConstraints, getTypeName } from "./validation-utils";
import { resolveEffectiveSchema, hasConditionalValidation } from "./conditional-validation";

// Plugin validation
export async function validateCustomType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[],
  monoSchemaInstance?: MonoSchemaInstance
): Promise<{ errors: ValidationError[]; data: unknown }> {
  // Find plugin type
  const pluginType = plugins
    .flatMap((p) => p.types)
    .find((t) => {
      if (t === schema.$type) return true;
      if (typeof t === "function" && typeof schema.$type === "function") {
        return t.name === schema.$type.name;
      }
      return false;
    });

  // If $type is a function (factory), call it; if it's an object with validate, use it directly
  let pluginInstance: { validate: (value: unknown, monoSchemaInstance?: MonoSchemaInstance) => unknown | Promise<unknown> } | null = null;
  
  if (
    typeof schema.$type === "function" &&
    schema.$type !== String &&
    schema.$type !== Number &&
    schema.$type !== Boolean &&
    schema.$type !== Date &&
    schema.$type !== Object &&
    schema.$type !== Array
  ) {
    try {
      pluginInstance = (schema.$type as (...args: unknown[]) => { validate: (value: unknown, monoSchemaInstance?: MonoSchemaInstance) => unknown | Promise<unknown> })();
    } catch {
      pluginInstance = null;
    }
  } else if (
    typeof schema.$type === "object" && 
    schema.$type !== null && 
    typeof (schema.$type as unknown as Record<string, unknown>).validate === "function"
  ) {
    pluginInstance = schema.$type as unknown as { validate: (value: unknown, monoSchemaInstance?: MonoSchemaInstance) => unknown | Promise<unknown> };
  }

  if (pluginInstance && typeof pluginInstance.validate === "function") {
    const result = await pluginInstance.validate(value, monoSchemaInstance);
    if (result && typeof result === "object" && result !== null) {
      const validationResult = result as { valid?: boolean; errors?: unknown[] };
      if (validationResult.valid === false && Array.isArray(validationResult.errors)) {
        // Patch error path
        const errors = validationResult.errors.map((err: unknown) => {
          const error = err as Record<string, unknown>;
          return {
            path,
            message: String(error.message || "Validation failed"),
            expected: String(error.expected || "Valid value"),
            received: getValueTypeName(value),
            value,
          };
        });
        return { errors, data: value };
      }
    }
    // If result is valid or no errors, return []
    return { errors: [], data: value };
  }

  // If pluginType is registered but no validate, treat as valid
  if (pluginType) {
    return { errors: [], data: value };
  }

  return { errors: [], data: value };
}

// Built-in type validation
export async function validateBuiltinType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  monoSchemaInstance?: MonoSchemaInstance,
  stripUnknownProperties?: boolean,
  errorUnknownProperties?: boolean,
  fullObject?: unknown
): Promise<{ errors: ValidationError[]; data: unknown }> {
  const createError = (expected: string): ValidationError => ({
    path,
    message: `Expected type ${expected}, but received ${getValueTypeName(value)}`,
    expected,
    received: getValueTypeName(value),
    value,
  });

  if (schema.$type === String) {
    if (typeof value !== "string") {
      return { errors: [createError("String")], data: value };
    }
    const constraintErrors = await validateConstraints(value, schema.$constraints, path, "String");
    return { errors: constraintErrors, data: value };
  }

  if (schema.$type === Number) {
    if (typeof value !== "number") {
      return { errors: [createError("Number")], data: value };
    }
    const constraintErrors = await validateConstraints(value, schema.$constraints, path, "Number");
    return { errors: constraintErrors, data: value };
  }

  if (schema.$type === Boolean) {
    if (typeof value !== "boolean") {
      return { errors: [createError("Boolean")], data: value };
    }
    const constraintErrors = await validateConstraints(value, schema.$constraints, path, "Boolean");
    return { errors: constraintErrors, data: value };
  }

  if (schema.$type === Date) {
    if (!(value instanceof Date)) {
      return { errors: [createError("Date")], data: value };
    }
    const constraintErrors = await validateConstraints(value, schema.$constraints, path, "Date");
    return { errors: constraintErrors, data: value };
  }

  if (schema.$type === Object) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return { errors: [createError("Object")], data: value };
    }

    // Validate constraints first
    const constraintErrors = await validateConstraints(value, schema.$constraints, path, "Object");
    if (constraintErrors.length > 0) return { errors: constraintErrors, data: value };

    // Create a copy of the value to potentially modify
    const processedData = { ...value as Record<string, unknown> };
    let errors: ValidationError[] = [];

    // Validate properties
    if (schema.$properties) {
      for (const key in schema.$properties) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;

        const propValue = (value as Record<string, unknown>)[key];
        const propPath = path ? `${path}.${key}` : key;

        // Resolve conditional validation for this property
        let effectivePropSchema = propSchema;
        if (hasConditionalValidation(propSchema)) {
          // For nested discriminated unions, pass the property value, not the full object
          const contextValue = propSchema.$discriminant ? propValue : (fullObject || value);
          const resolveResult = await resolveEffectiveSchema(propSchema, contextValue, propPath);
          if (resolveResult.errors.length > 0) {
            errors = errors.concat(resolveResult.errors);
            continue;
          }
          effectivePropSchema = resolveResult.schema;
        }

        if (propValue === undefined || propValue === null) {
          if (!effectivePropSchema.$optional) {
            errors.push({
              path: propPath,
              message: `Missing required property`,
              expected: getTypeName(effectivePropSchema.$type),
              received: "undefined",
              value: undefined,
            });
          }
        } else {
          const propResult = await validateValue(effectivePropSchema, propValue, propPath, [], monoSchemaInstance, stripUnknownProperties, errorUnknownProperties, fullObject || value);
          errors = errors.concat(propResult.errors);
          // Update the processed data with the validated/processed property value
          processedData[key] = propResult.data;
        }
      }

      // Handle unknown properties
      if (stripUnknownProperties || errorUnknownProperties) {
        const schemaKeys = new Set(Object.keys(schema.$properties));
        const valueKeys = Object.keys(value as Record<string, unknown>);
        
        for (const key of valueKeys) {
          if (!schemaKeys.has(key)) {
            if (errorUnknownProperties) {
              const propPath = path ? `${path}.${key}` : key;
              errors.push({
                path: propPath,
                message: `Unexpected property found: ${key}`,
                expected: "undefined",
                received: getValueTypeName((value as Record<string, unknown>)[key]),
                value: (value as Record<string, unknown>)[key],
              });
            }
            if (stripUnknownProperties) {
              delete processedData[key];
            }
          }
        }
      }
    }
    
    return { errors, data: processedData };
  }

  return { errors: [], data: value };
}

// Array validation
export async function validateArrayType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[],
  monoSchemaInstance?: MonoSchemaInstance,
  stripUnknownProperties?: boolean,
  errorUnknownProperties?: boolean,
  fullObject?: unknown
): Promise<{ errors: ValidationError[]; data: unknown }> {
  if (!Array.isArray(schema.$type)) return { errors: [], data: value };

  if (!Array.isArray(value)) {
    return {
      errors: [{
        path,
        message: `Expected type Array, but received ${getValueTypeName(value)}`,
        expected: "Array",
        received: getValueTypeName(value),
        value,
      }],
      data: value
    };
  }

  const itemType = schema.$type[0];
  if (itemType === undefined) {
    return {
      errors: [{
        path,
        message: `Array schema missing item type`,
        expected: "Array",
        received: getValueTypeName(value),
        value,
      }],
      data: value
    };
  }

  const errors: ValidationError[] = [];
  const processedData: unknown[] = [];

  for (let idx = 0; idx < value.length; idx++) {
    const item = value[idx];
    const itemResult = await validateValue(
      { $type: itemType, $constraints: schema.$constraints },
      item,
      path ? `${path}.${idx}` : `${idx}`,
      plugins,
      monoSchemaInstance,
      stripUnknownProperties,
      errorUnknownProperties,
      fullObject
    );
    errors.push(...itemResult.errors);
    processedData[idx] = itemResult.data;
  }

  return { errors, data: processedData };
}

// Main validation function
export async function validateValue(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[] = [],
  monoSchemaInstance?: MonoSchemaInstance,
  stripUnknownProperties?: boolean,
  errorUnknownProperties?: boolean,
  fullObject?: unknown // Add context for conditional validation
): Promise<{ errors: ValidationError[]; data: unknown }> {
  // Handle conditional validation first
  if (hasConditionalValidation(schema)) {
    const resolveResult = await resolveEffectiveSchema(schema, fullObject || value, path);
    if (resolveResult.errors.length > 0) {
      return { errors: resolveResult.errors, data: value };
    }
    // Use the resolved schema for validation
    schema = resolveResult.schema;
  }

  // Handle array types
  if (Array.isArray(schema.$type)) {
    return await validateArrayType(schema, value, path, plugins, monoSchemaInstance, stripUnknownProperties, errorUnknownProperties, fullObject);
  }

  // Handle custom plugin types
  if (
    isCustomType(schema.$type) || 
    (typeof schema.$type === "object" && 
     schema.$type !== null && 
     typeof (schema.$type as unknown as Record<string, unknown>).validate === "function")
  ) {
    return await validateCustomType(schema, value, path, plugins, monoSchemaInstance);
  }

  // Handle built-in types
  return await validateBuiltinType(schema, value, path, monoSchemaInstance, stripUnknownProperties, errorUnknownProperties, fullObject);
}

// Prevalidation processing
export async function runPrevalidation(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[],
  monoSchemaInstance?: MonoSchemaInstance
): Promise<unknown> {
  let result = value;
  
  // Run all plugin prevalidate functions for this property
  for (const plugin of plugins) {
    if (plugin.prevalidate) {
      for (const fn of plugin.prevalidate) {
        result = fn(result, schema, path);
      }
    }
  }

  // Recurse for arrays and objects
  if (Array.isArray(schema.$type) && Array.isArray(result)) {
    const itemType = schema.$type[0];
    return await Promise.all(result.map((item, idx) =>
      runPrevalidation(
        { $type: itemType, $constraints: schema.$constraints },
        item,
        path ? `${path}.${idx}` : `${idx}`,
        plugins,
        monoSchemaInstance
      )
    ));
  }

  if (schema.$type === Object && schema.$properties && typeof result === 'object' && result !== null && !Array.isArray(result)) {
    const out: Record<string, unknown> = { ...result };
    for (const key in schema.$properties) {
      if (Object.prototype.hasOwnProperty.call(schema.$properties, key)) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;
        out[key] = await runPrevalidation(
          propSchema,
          (result as Record<string, unknown>)[key],
          path ? `${path}.${key}` : key,
          plugins,
          monoSchemaInstance
        );
      }
    }
    return out;
  }
  
  return result;
}
