import { Abortable, FindOptions, MongoClient, WithId } from "mongodb"
import { query as monoSchemaQuery } from "@voidhaus/monoschema-mongo"
import { InferTypeFromMonoSchema } from "@voidhaus/monoschema"

let mongoClient: MongoClient | null = null

export const initializeMongoClient = async (uri: string) => {
  if (mongoClient) {
    return mongoClient
  }
  mongoClient = new MongoClient(uri)
  await mongoClient.connect()
  return mongoClient
}

export const DocumentSchema = {
  $type: Object,
  $properties: {
    _id: { $type: String, $optional: true },
  },
} as const

export const query = async <T extends typeof DocumentSchema>(
  collectionName: string,
  query: ReturnType<typeof monoSchemaQuery<T>>,
  options?: FindOptions & Abortable, 
): Promise<WithId<InferTypeFromMonoSchema<T>>[]> => {
  if (!mongoClient) {
    throw new Error("MongoDB client not initialized. Call initializeMongoClient first.")
  }
  const collection = mongoClient.db().collection<InferTypeFromMonoSchema<T>>(collectionName)
  const results = await collection.find(query, options).toArray()
  return results
}
