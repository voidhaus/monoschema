// Transformer plugin for monoschema prevalidation

// Define the types locally so this file/package is standalone
export type TransformerObject = {
  input: any;
  output: any;
  transform: (value: any) => any;
};
export type Transformer = () => TransformerObject;


import type { Plugin } from "./monoschema";

/**
 * This plugin applies $transformers in the schema as a prevalidation step.
 * It checks for $transformers, applies them in order, and throws if invalid.
 */
export const transformerPlugin: Plugin = {
  name: "TransformerPlugin",
  description: "Applies $transformers in schema as a prevalidation step.",
  types: [],
  prevalidate: [
    (value, schema, path) => {
      // Duck-typing: check for $transformers
      const transformers = (schema as any).$transformers as readonly Transformer[] | undefined;
      if (!Array.isArray(transformers)) return value;
      let transformedValue = value;
      for (const transformer of transformers) {
        if (typeof transformer !== 'function') {
          throw new Error('Invalid transformer provided. Expected a function with input and output types defined, as well as a transform function.');
        }
        const transformerInstance = transformer();
        if (
          !transformerInstance ||
          typeof transformerInstance.transform !== 'function' ||
          typeof transformerInstance.input === 'undefined' ||
          typeof transformerInstance.output === 'undefined'
        ) {
          throw new Error('Invalid transformer provided. Expected a function with input and output types defined, as well as a transform function.');
        }
        try {
          transformedValue = transformerInstance.transform(transformedValue);
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(`${path}: ${error.message}`);
          }
          throw error;
        }
      }
      return transformedValue;
    }
  ]
};
