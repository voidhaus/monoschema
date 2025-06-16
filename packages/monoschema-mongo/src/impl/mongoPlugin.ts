
import { Plugin } from "@voidhaus/monoschema";
import { ObjectId } from 'mongodb'

export const ObjectID = Object.assign(
  () => {
    const validate = (value: unknown) => {
      if (!(value instanceof ObjectId)) {
        return {
          valid: false,
          errors: [
            {
              message: `Invalid ObjectId: ${value}`,
              expected: `ObjectId`,
              received: typeof value,
              value,
            }
          ]
        }
      }
    }
    return {
      validate,
      tsType: null as unknown as ObjectId,
    }
  },
  { tsType: null as unknown as ObjectId }
);

export const MongoTypesPlugin: Plugin = {
  name: "MongoTypesPlugin",
  description: "Provides MongoDB types for Monoschema.",
  types: [ObjectID],
}

export const MongoTransformersPlugin: Plugin = {
  name: "MongoTransformersPlugin",
  description: "Provides MongoDB transformers for Monoschema.",
  types: [],
  prevalidate: [
    (value, schema, path) => {
      // If the schema is expecting an ObjectId and the value is a string, convert it
      if (schema.$type === ObjectID && typeof value === 'string') {
        try {
          return new ObjectId(value);
        } catch {
          throw new Error(`${path}: Invalid ObjectId: ${value}`);
        }
      }
      // Always return the value (even if unchanged)
      return value;
    },
  ],
}