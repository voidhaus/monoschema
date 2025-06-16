import type { Plugin } from "@voidhaus/monoschema";

// Define the types locally so this file/package is standalone
export type TransformerObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (value: any) => any;
};
export type Transformer = () => TransformerObject;

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
