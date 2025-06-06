import { InferTypeFromMonoSchema, MonoSchemaInstance } from "@voidhaus/monoschema";
import { ContentKeyObject } from "./contentKey";

export const ContentSchema = {
  $type: Object,
  $properties: {
    __BLOCK_TYPE__: {
      $type: String,
      $description: "The block type identifier.",
    },
    key: {
      $type: ContentKeyObject,
      $description: "A unique identifier for the content.",
    },
    properties: {
      $type: Object,
      $description: "The properties of the content.",
    },
  },
} as const;

export const ContentObject = Object.assign(
  () => ({
    validate: (value: unknown, monoschemaInstance?: MonoSchemaInstance) => {
      if (!monoschemaInstance) {
        return {
          valid: false,
          errors: [
            {
              message: "MonoSchemaInstance required",
              expected: "MonoSchemaInstance",
              received: "undefined",
              value,
            },
          ],
        };
      }
      const validate = monoschemaInstance.validate(ContentSchema);
      return validate(value);
    },
  }),
  { tsType: null as unknown as Content }
)

export type Content = InferTypeFromMonoSchema<typeof ContentSchema>;
