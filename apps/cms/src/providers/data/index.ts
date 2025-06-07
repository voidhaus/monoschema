import { MongoClient } from "mongodb";
import { MonoSchemaMongoClient } from "@voidhaus/monoschema-mongo";

let client: MonoSchemaMongoClient | null = null;

export const initializeMongoClient = async (
  uri: string
): Promise<MonoSchemaMongoClient> => {
  if (client) {
    return client;
  }
  const mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  client = new MonoSchemaMongoClient(mongoClient);
  return client;
};

export const Client: MonoSchemaMongoClient =
  client ??
  (() => {
    throw new Error(
      "MongoDB client not initialized. Call initializeMongoClient first."
    );
  })();
