import { InferTypeFromMonoSchema, MonoSchema } from "@voidhaus/monoschema";
import {
  Abortable,
  BulkWriteOptions,
  FindOptions,
  InsertManyResult,
  InsertOneOptions,
  InsertOneResult,
  MongoClient,
  OptionalUnlessRequiredId,
  WithId,
  Document,
} from "mongodb";
import { query as monoSchemaQuery } from "./query";

export class MonoSchemaMongoClient {
  constructor(private readonly mongoClient: MongoClient) {}

  public async find<T extends InferTypeFromMonoSchema<MonoSchema>>(
    collectionName: string,
    query: ReturnType<typeof monoSchemaQuery<T>>,
    options?: FindOptions & Abortable
  ): Promise<WithId<T & Document>[]> {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized.");
    }
    const collection = this.mongoClient
      .db()
      .collection<T & Document>(collectionName);
    const results = await collection.find(query.toMongo(), options).toArray();
    return results;
  }

  public async findOne<T extends InferTypeFromMonoSchema<MonoSchema>>(
    collectionName: string,
    query: ReturnType<typeof monoSchemaQuery<T>>,
    options?: FindOptions & Abortable
  ): Promise<WithId<T & Document> | null> {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized.");
    }
    const collection = this.mongoClient
      .db()
      .collection<T & Document>(collectionName);
    const result = await collection.findOne(query.toMongo(), options);
    return result as WithId<T & Document> | null;
  }

  public async insertOne<T extends InferTypeFromMonoSchema<MonoSchema>>(
    collectionName: string,
    document: OptionalUnlessRequiredId<T & Document>,
    options?: InsertOneOptions & Abortable
  ): Promise<InsertOneResult<T>> {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized.");
    }
    const collection = this.mongoClient.db().collection<T & Document>(collectionName);
    const result = await collection.insertOne(document, options);
    if (!result.acknowledged) {
      throw new Error("Insert operation was not acknowledged.");
    }

    return result;
  }

  public async insertMany<T extends InferTypeFromMonoSchema<MonoSchema>>(
    collectionName: string,
    documents: OptionalUnlessRequiredId<T & Document>[],
    options?: BulkWriteOptions & Abortable
  ): Promise<InsertManyResult<T & Document>> {
    if (!this.mongoClient) {
      throw new Error("MongoDB client not initialized.");
    }
    const collection = this.mongoClient
      .db()
      .collection<T & Document>(collectionName);
    const results = await collection.insertMany(documents, options);
    if (!results.acknowledged) {
      throw new Error("Insert operation was not acknowledged.");
    }

    return results;
  }
}
