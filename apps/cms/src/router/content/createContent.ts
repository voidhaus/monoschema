import {
  createContentInputSchema,
  createContentOutputSchema,
  CreateContentInput,
  CreateContentOutput,
  Content,
  ContentKeyObject,
} from "@voidhaus/cms-types";
import { input, output, procedure, resolver } from "@voidhaus/rpc";
import { MonoSchemaProperty } from "@voidhaus/monoschema";
import { query, eq } from "@voidhaus/monoschema-mongo";
import data from "../../providers/data";
import { BlockTypeData } from "../../providers/data/types";
import { Constraint, instanceOf } from "@voidhaus/monoschema/constraints";
import { contentBlockExists } from "../../constraints/contentBlockExists";
import { stringToDate, Transformer } from "@voidhaus/monoschema-transformer";

const createContentResolver = resolver<CreateContentInput, CreateContentOutput>(
  async (input, context) => {
    // 1. Find the block type by blockKey
    const blockType = await data.Client.findOne<BlockTypeData>(
      "blockTypes",
      query<BlockTypeData>(eq("key", input.blockKey))
    );

    if (!blockType) {
      throw new Error(`Block type with key "${input.blockKey}" not found`);
    }

    // 2. Dynamically build a validation schema from the block type's properties
    const dynamicSchemaProperties: Record<string, MonoSchemaProperty> = {};

    for (const property of blockType.properties) {
      let propertyType:
        | StringConstructor
        | NumberConstructor
        | BooleanConstructor
        | DateConstructor
        | typeof ContentKeyObject;
      const constraints: Constraint[] = [];
      const transformers: Transformer[] = [];

      // Map property type strings to MonoSchema types
      switch (property.type) {
        case "string":
          propertyType = String;
          constraints.push(
            instanceOf(String),
          )
          break;
        case "number":
          propertyType = Number;
          constraints.push(
            instanceOf(Number),
          )
          break;
        case "boolean":
          propertyType = Boolean;
          constraints.push(
            instanceOf(Boolean),
          )
          break;
        case "date":
          propertyType = Date;
          transformers.push(
            stringToDate
          )
          constraints.push(
            instanceOf(Date),
          )
          break;
        case "contentKey":
          // Assuming contentKey is a string that references another content item
          propertyType = ContentKeyObject;
          constraints.push(
            instanceOf(String),
            contentBlockExists(),
          )
          break;
        default:
          // Default to String for unknown types
          propertyType = String;
          constraints.push(
            instanceOf(String),
          )
          break;
      }

      dynamicSchemaProperties[property.name] = {
        $type: propertyType,
        $optional: !property.required,
        $description: property.description,
        $constraints: constraints,
        $transformers: transformers,
      };
    }

    const contentPropertiesSchema = {
      $type: Object,
      $properties: dynamicSchemaProperties,
    } as const;

    // 3. Validate the input content properties against the dynamic schema
    if (input.properties) {
      const validate = context.monoschema.validate(contentPropertiesSchema);
      const validationResult = await validate(input.properties);

      if (!validationResult.valid) {
        const errorMessages = validationResult.errors
          .map(
            (error: { path: string; message: string }) =>
              `${error.path}: ${error.message}`
          )
          .join(", ");
        throw new Error(
          `Content properties validation failed: ${errorMessages}`
        );
      }
    }

    // 4. Store the validated content in the database
    const contentData: Content = {
      key: input.key,
      blockKey: input.blockKey,
      properties: input.properties || {},
    };

    const result = await data.Client.insertOne<Content>("content", contentData);

    // 5. Return the created content with the inserted ID
    return {
      ...contentData,
      _id: result.insertedId,
    };
  }
);

export const createContent = procedure(
  input(createContentInputSchema),
  output(createContentOutputSchema),
  createContentResolver
);
