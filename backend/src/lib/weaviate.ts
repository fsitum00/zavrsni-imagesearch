import weaviate, { WeaviateClient } from "weaviate-ts-client";
import "dotenv/config";

let client: WeaviateClient;

export const initializeWeaviate = async (): Promise<void> => {
  client = weaviate.client({
    scheme: process.env.WEAVIATE_PROTOCOL || "http",
    host: process.env.WEAVIATE_BASE_URL || "http://localhost:8080",
  });
};

export const getClient = (): WeaviateClient => client;
