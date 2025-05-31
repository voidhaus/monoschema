// Validation utility functions for MonoSchema
import type { Constraint } from "./constraints";
import type { ValidationError } from "./types";

// Type validation utilities
export function getTypeName(type: unknown): string {
  if (
    type === String ||
    type === Number ||
    type === Boolean ||
    type === Date ||
    type === Object ||
    type === Array
  ) {
    return (type as { name: string }).name;
  }
  if (typeof type === "function") {
    return "CustomValidator";
  }
  if (Array.isArray(type)) return "Array";
  if (typeof type === "object" && type !== null && (type as { constructor?: { name?: string } }).constructor?.name)
    return (type as { constructor: { name: string } }).constructor.name;
  return typeof type;
}

export function getValueTypeName(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "Array";
  if (typeof value === "object" && value && (value as Record<string, unknown>).constructor && (value as Record<string, unknown>).constructor.name)
    return (value as Record<string, unknown>).constructor.name;
  return typeof value === "string"
    ? "String"
    : typeof value === "number"
    ? "Number"
    : typeof value === "boolean"
    ? "Boolean"
    : typeof value;
}

export function isCustomType(type: unknown): boolean {
  return typeof type === "function" && ![String, Number, Boolean, Date, Object, Array].includes(type as never);
}

// Validation constraint checking
export function validateConstraints(
  value: unknown,
  constraints: readonly Constraint[] | undefined,
  path: string,
  expectedType: string
): ValidationError[] {
  if (!Array.isArray(constraints)) return [];
  
  const errors: ValidationError[] = [];
  for (const constraint of constraints) {
    if (typeof constraint.validate === "function") {
      const valid = constraint.validate(value);
      if (!valid) {
        errors.push({
          path,
          message: typeof constraint.message === "function" ? constraint.message(value) : "Constraint failed",
          expected: expectedType,
          received: getValueTypeName(value),
          value,
        });
      }
    }
  }
  return errors;
}

// Helper function to get value at a property path
export function getValueAtPropertyPath(obj: unknown, path: string): unknown {
  if (!path || typeof obj !== 'object' || obj === null) {
    return obj;
  }
  
  const keys = path.split('.');
  let current: unknown = obj;
  
  for (const key of keys) {
    if (typeof current !== 'object' || current === null || Array.isArray(current)) {
      return undefined;
    }
    current = (current as Record<string, unknown>)[key];
  }
  
  return current;
}

// Helper function to get schema at a property path
export function getSchemaAtPropertyPath(schema: unknown, path: string): unknown {
  if (!path || typeof schema !== 'object' || schema === null) {
    return schema;
  }
  
  const keys = path.split('.');
  let current: unknown = schema;
  
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    const currentSchema = current as Record<string, unknown>;
    if (currentSchema.$properties && key in (currentSchema.$properties as Record<string, unknown>)) {
      current = (currentSchema.$properties as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  
  return current;
}
