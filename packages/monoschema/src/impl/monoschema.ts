// --- TypeScript type inference from MonoSchema ---
// Recursively infer the TypeScript type from a MonoSchema definition
export type InferTypeFromMonoSchema<T> =
  T extends { $type: infer U }
    ? U extends { tsType: infer X }
      ? X
      : U extends readonly [infer ArrType]
        ? ArrType extends { tsType: infer X }
          ? X[]
          : InferTypeFromMonoSchema<{ $type: ArrType }> []
        : U extends typeof String
          ? string
        : U extends typeof Number
          ? number
        : U extends typeof Boolean
          ? boolean
        : U extends typeof Object
          ? T extends { $properties: infer P }
            ? { [K in keyof P]: P[K] extends { $optional: true }
                  ? InferTypeFromMonoSchema<P[K]> | undefined
                  : InferTypeFromMonoSchema<P[K]> }
            : unknown
          : unknown
    : unknown;
type MonoSchemaType =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | ObjectConstructor
  | ArrayConstructor
  | ((...args: any[]) => { validate: (value: unknown) => any });

type MonoSchemaProperty =
  | {
      $type: MonoSchemaType | readonly MonoSchemaType[];
      $optional?: boolean;
      $properties?: Record<string, MonoSchemaProperty>;
    }
  | MonoSchema;

type MonoSchema = {
  $type: MonoSchemaType | readonly MonoSchemaType[];
  $optional?: boolean;
  $properties?: Record<string, MonoSchemaProperty>;
};

type Plugin = {
  name: string;
  description?: string;
  version?: string;
  types: Array<MonoSchemaType>;
};

type ConfigureMonoSchemaOptions = {
  plugins?: Plugin[];
};

type ValidationError = {
  path: string;
  message: string;
  expected: string;
  received: string;
  value: unknown;
};

type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

function getTypeName(type: any): string {
  if (
    type === String ||
    type === Number ||
    type === Boolean ||
    type === Object ||
    type === Array
  ) {
    return type.name;
  }
  if (typeof type === "function") {
    return "CustomValidator";
  }
  if (Array.isArray(type)) return "Array";
  if (typeof type === "object" && type !== null && type.constructor && type.constructor.name)
    return type.constructor.name;
  return typeof type;
}

function getValueTypeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array";
  if (typeof value === "object" && value && (value as any).constructor && (value as any).constructor.name)
    return (value as any).constructor.name;
  return typeof value === "string"
    ? "String"
    : typeof value === "number"
    ? "Number"
    : typeof value === "boolean"
    ? "Boolean"
    : typeof value;
}

function isCustomType(type: any): boolean {
  return typeof type === "function" && ![String, Number, Boolean, Object, Array].includes(type);
}

function validateValue(
  schema: MonoSchemaProperty,
  value: unknown,
  path: string,
  plugins: Plugin[] = []
): ValidationError[] {
  // Handle array of types (for arrays)
  if (Array.isArray(schema.$type)) {
    if (!Array.isArray(value)) {
      return [
        {
          path,
          message: `Expected type Array, but received ${getValueTypeName(value)}`,
          expected: "Array",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Validate each item in the array
    const itemType = schema.$type[0];
    if (itemType === undefined) {
      return [
        {
          path,
          message: `Array schema missing item type`,
          expected: "Array",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    return value
      .map((item, idx) =>
        validateValue(
          { $type: itemType },
          item,
          path ? `${path}.${idx}` : `${idx}`,
          plugins
        )
      )
      .flat();
  }

  // Handle custom plugin types
  if (isCustomType(schema.$type) || (typeof schema.$type === "object" && schema.$type !== null && typeof (schema.$type as any).validate === "function")) {
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
    let pluginInstance: any = null;
    if (
      typeof schema.$type === "function" &&
      schema.$type !== String &&
      schema.$type !== Number &&
      schema.$type !== Boolean &&
      schema.$type !== Object &&
      schema.$type !== Array
    ) {
      try {
        pluginInstance = (schema.$type as (...args: any[]) => { validate: (value: unknown) => any })();
      } catch (e) {
        pluginInstance = null;
      }
    } else if (typeof schema.$type === "object" && schema.$type !== null && typeof (schema.$type as any).validate === "function") {
      pluginInstance = schema.$type;
    }
    if (pluginInstance && typeof (pluginInstance as { validate: (value: unknown) => any }).validate === "function") {
      const result = (pluginInstance as { validate: (value: unknown) => any }).validate(value);
      if (result && result.valid === false && Array.isArray(result.errors)) {
        // Patch error path
        return result.errors.map((err: any) => ({
          path,
          message: err.message,
          expected: err.expected,
          received: getValueTypeName(value),
          value,
        }));
      }
      // If result is valid or no errors, return []
      return [];
    }
    // If pluginType is registered but no validate, treat as valid
    if (pluginType) {
      return [];
    }
  }

  // Handle built-in types
  if (schema.$type === String) {
    if (typeof value !== "string") {
      return [
        {
          path,
          message: `Expected type String, but received ${getValueTypeName(value)}`,
          expected: "String",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    return [];
  }
  if (schema.$type === Number) {
    if (typeof value !== "number") {
      return [
        {
          path,
          message: `Expected type Number, but received ${getValueTypeName(value)}`,
          expected: "Number",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    return [];
  }
  if (schema.$type === Boolean) {
    if (typeof value !== "boolean") {
      return [
        {
          path,
          message: `Expected type Boolean, but received ${getValueTypeName(value)}`,
          expected: "Boolean",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    return [];
  }
  if (schema.$type === Object) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return [
        {
          path,
          message: `Expected type Object, but received ${getValueTypeName(value)}`,
          expected: "Object",
          received: getValueTypeName(value),
          value,
        },
      ];
    }
    // Validate properties
    if (schema.$properties) {
      let errors: ValidationError[] = [];
      for (const key in schema.$properties) {
        const propSchema = schema.$properties[key];
        if (!propSchema) continue;
        if (
          (value as any)[key] === undefined ||
          (value as any)[key] === null
        ) {
          if (!propSchema.$optional) {
            errors.push({
              path: path ? `${path}.${key}` : key,
              message: `Missing required property`,
              expected: getTypeName((propSchema as any).$type),
              received: "undefined",
              value: undefined,
            });
          }
        } else {
          errors = errors.concat(
            validateValue(
              propSchema,
              (value as any)[key],
              path ? `${path}.${key}` : key,
              plugins
            )
          );
        }
      }
      return errors;
    }
    return [];
  }
  return [];
}

function configureMonoSchema(options: ConfigureMonoSchemaOptions = {}) {
  const plugins = options.plugins || [];
  return {
    validate: (schema: MonoSchema) => (value: unknown): ValidationResult => {
      const errors = validateValue(schema, value, "", plugins);
      return {
        valid: errors.length === 0,
        errors,
      };
    },
  };
}

// --- Type inference for property paths ---

// Helper: Join property keys for nested paths
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

// Recursively get all property paths from a schema
type MonogSchemaPropertPathHelper<T> = T extends { $properties: infer P }
  ? {
      [K in keyof P]: P[K] extends { $properties: any }
        ? K extends string
          ? K | Join<K, MonogSchemaPropertPathHelper<P[K]>>
          : never
        : K;
    }[keyof P]
  : never;

// Exported type for property path inference
export type MonogSchemaPropertPath<T> = MonogSchemaPropertPathHelper<T> extends string
  ? MonogSchemaPropertPathHelper<T>
  : never;

export { configureMonoSchema };