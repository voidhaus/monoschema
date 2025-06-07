import { InferTypeFromMonoSchema, MonoSchema } from "@voidhaus/monoschema"
import { Abortable, FindOptions, MongoClient, WithId } from "mongodb"
import { query as monoSchemaQuery } from "./query"

export class MonoSchemaMongoClient {
  constructor(
    private readonly mongoClient: MongoClient,
  ) {}

  public async query<T extends InferTypeFromMonoSchema<MonoSchema>>(
    collectionName: string,
    query: ReturnType<typeof monoSchemaQuery<T>>,
    options?: FindOptions & Abortable, 
  ): Promise<WithId<T & Document>[]> {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized. Call initializeMongoClient first.")
    }
    const collection = this.mongoClient.db().collection<T & Document>(collectionName)
    const results = await collection.find(query.toMongo(), options).toArray()
    return results
  }
}