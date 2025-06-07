import { Abortable, FindOptions, MongoClient, WithId, Document } from "mongodb"
import { query as monoSchemaQuery } from "@voidhaus/monoschema-mongo"
import { InferTypeFromMonoSchema, MonoSchema } from "@voidhaus/monoschema"

let mongoClient: MongoClient | null = null

export const initializeMongoClient = async (uri: string) => {
  if (mongoClient) {
    return mongoClient
  }
  mongoClient = new MongoClient(uri)
  await mongoClient.connect()
  return mongoClient
}

export const query = async <T extends InferTypeFromMonoSchema<MonoSchema>>(
  collectionName: string,
  query: ReturnType<typeof monoSchemaQuery<T>>,
  options?: FindOptions & Abortable, 
): Promise<WithId<T & Document>[]> => {
  if (!mongoClient) {
    throw new Error("MongoDB client not initialized. Call initializeMongoClient first.")
  }
  const collection = mongoClient.db().collection<T & Document>(collectionName)
  const results = await collection.find(query.toMongo(), options).toArray()
  return results
}
