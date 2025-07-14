import weaviate, { WeaviateClient } from "weaviate-ts-client";

let client: WeaviateClient;

export const initializeWeaviate = async (): Promise<void> => {
  client = weaviate.client({
    scheme: process.env.WEAVIATE_PROTOCOL || "http",
    host: process.env.WEAVIATE_HOST || "http://localhost:8080",
  });
};

export const getClient = (): WeaviateClient => client;
