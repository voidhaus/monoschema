// Validation functions for MonoSchema
import type { MonoSchemaProperty, Plugin, ValidationError } from "./types";
import { getValueTypeName, isCustomType, validateConstraints, getTypeName } from "./validation-utils";

// Plugin validation
export function validateCustomType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[]
): ValidationError[] {
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
  let pluginInstance: { validate: (value: unknown) => unknown } | null = null;
  
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
      pluginInstance = (schema.$type as (...args: unknown[]) => { validate: (value: unknown) => unknown })();
    } catch {
      pluginInstance = null;
    }
  } else if (
    typeof schema.$type === "object" && 
    schema.$type !== null && 
    typeof (schema.$type as unknown as Record<string, unknown>).validate === "function"
  ) {
    pluginInstance = schema.$type as unknown as { validate: (value: unknown) => unknown };
  }

  if (pluginInstance && typeof pluginInstance.validate === "function") {
    const result = pluginInstance.validate(value);
    if (result && typeof result === "object" && result !== null) {
      const validationResult = result as { valid?: boolean; errors?: unknown[] };
      if (validationResult.valid === false && Array.isArray(validationResult.errors)) {
        // Patch error path
        return validationResult.errors.map((err: unknown) => {
          const error = err as Record<string, unknown>;
          return {
            path,
            message: String(error.message || "Validation failed"),
            expected: String(error.expected || "Valid value"),
            received: getValueTypeName(value),
            value,
          };
        });
      }
    }
    // If result is valid or no errors, return []
    return [];
  }

  // If pluginType is registered but no validate, treat as valid
  if (pluginType) {
    return [];
  }

  return [];
}

// Built-in type validation
export function validateBuiltinType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string
): ValidationError[] {
  const createError = (expected: string): ValidationError => ({
    path,
    message: `Expected type ${expected}, but received ${getValueTypeName(value)}`,
    expected,
    received: getValueTypeName(value),
    value,
  });

  if (schema.$type === String) {
    if (typeof value !== "string") {
      return [createError("String")];
    }
    return validateConstraints(value, schema.$constraints, path, "String");
  }

  if (schema.$type === Number) {
    if (typeof value !== "number") {
      return [createError("Number")];
    }
    return validateConstraints(value, schema.$constraints, path, "Number");
  }

  if (schema.$type === Boolean) {
    if (typeof value !== "boolean") {
      return [createError("Boolean")];
    }
    return validateConstraints(value, schema.$constraints, path, "Boolean");
  }

  if (schema.$type === Date) {
    if (!(value instanceof Date)) {
      return [createError("Date")];
    }
    return validateConstraints(value, schema.$constraints, path, "Date");
  }

  if (schema.$type === Object) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return [createError("Object")];
    }

    // Validate constraints first
    const constraintErrors = validateConstraints(value, schema.$constraints, path, "Object");
    if (constraintErrors.length > 0) return constraintErrors;

    // Validate properties
    if (schema.$properties) {
      let errors: ValidationError[] = [];
      for (const key in schema.$properties) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;

        const propValue = (value as Record<string, unknown>)[key];
        const propPath = path ? `${path}.${key}` : key;

        if (propValue === undefined || propValue === null) {
          if (!propSchema.$optional) {
            errors.push({
              path: propPath,
              message: `Missing required property`,
              expected: getTypeName(propSchema.$type),
              received: "undefined",
              value: undefined,
            });
          }
        } else {
          errors = errors.concat(validateValue(propSchema, propValue, propPath, []));
        }
      }
      return errors;
    }
    return [];
  }

  return [];
}

// Array validation
export function validateArrayType(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[]
): ValidationError[] {
  if (!Array.isArray(schema.$type)) return [];

  if (!Array.isArray(value)) {
    return [{
      path,
      message: `Expected type Array, but received ${getValueTypeName(value)}`,
      expected: "Array",
      received: getValueTypeName(value),
      value,
    }];
  }

  const itemType = schema.$type[0];
  if (itemType === undefined) {
    return [{
      path,
      message: `Array schema missing item type`,
      expected: "Array",
      received: getValueTypeName(value),
      value,
    }];
  }

  return value
    .map((item, idx) =>
      validateValue(
        { $type: itemType, $constraints: schema.$constraints },
        item,
        path ? `${path}.${idx}` : `${idx}`,
        plugins
      )
    )
    .flat();
}

// Main validation function
export function validateValue(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[] = []
): ValidationError[] {
  // Handle array types
  if (Array.isArray(schema.$type)) {
    return validateArrayType(schema, value, path, plugins);
  }

  // Handle custom plugin types
  if (
    isCustomType(schema.$type) || 
    (typeof schema.$type === "object" && 
     schema.$type !== null && 
     typeof (schema.$type as unknown as Record<string, unknown>).validate === "function")
  ) {
    return validateCustomType(schema, value, path, plugins);
  }

  // Handle built-in types
  return validateBuiltinType(schema, value, path);
}

// Prevalidation processing
export function runPrevalidation(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[]
): unknown {
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
    return result.map((item, idx) =>
      runPrevalidation(
        { $type: itemType, $constraints: schema.$constraints },
        item,
        path ? `${path}.${idx}` : `${idx}`,
        plugins
      )
    );
  }

  if (schema.$type === Object && schema.$properties && typeof result === 'object' && result !== null && !Array.isArray(result)) {
    const out: Record<string, unknown> = { ...result };
    for (const key in schema.$properties) {
      if (Object.prototype.hasOwnProperty.call(schema.$properties, key)) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;
        out[key] = runPrevalidation(
          propSchema,
          (result as Record<string, unknown>)[key],
          path ? `${path}.${key}` : key,
          plugins
        );
      }
    }
    return out;
  }
  
  return result;
}
