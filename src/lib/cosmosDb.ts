import { CosmosClient } from "@azure/cosmos";

import { getEnv } from "./env";

const connectionString = getEnv("COSMOS_DB_CONNECTION_STRING", "COSMOS-DB-CONNECTION-STRING");

let cosmosClient: CosmosClient | null = null;

function ensureClient(): CosmosClient {
    if (cosmosClient) return cosmosClient;

    if (!connectionString) {
        throw new Error(
            "Cosmos DB configuration missing: set COSMOS_DB_CONNECTION_STRING or COSMOS-DB-CONNECTION-STRING."
        );
    }

    cosmosClient = new CosmosClient(connectionString);
    return cosmosClient;
}

// Cache client in development to avoid reconnections on hot reload
const isProd = process.env.NODE_ENV === "production";
if (!isProd) {
    const g = global as typeof global & {
        __cosmos_client?: CosmosClient;
    };
    if (g.__cosmos_client) {
        cosmosClient = g.__cosmos_client;
    }
}

export async function listDatabases(): Promise<{ id: string }[]> {
    const client = ensureClient();
    const { resources } = await client.databases.readAll().fetchAll();
    return resources.map(db => ({ id: db.id }));
}

export async function listContainers(databaseId: string): Promise<{ id: string; partitionKey: string }[]> {
    const client = ensureClient();
    const database = client.database(databaseId);
    const { resources } = await database.containers.readAll().fetchAll();
    return resources.map(container => ({
        id: container.id,
        partitionKey: container.partitionKey?.paths?.join(", ") || "Unknown"
    }));
}

export async function queryItems(
    databaseId: string,
    containerId: string,
    query?: string,
    continuationToken?: string,
    maxItemCount: number = 25
): Promise<{ items: Record<string, unknown>[]; continuationToken?: string; hasMore: boolean }> {
    const client = ensureClient();
    const container = client.database(databaseId).container(containerId);

    const querySpec = query
        ? { query }
        : { query: "SELECT * FROM c" };

    const options: {
        maxItemCount: number;
        continuationToken?: string;
    } = {
        maxItemCount,
        continuationToken: continuationToken || undefined
    };

    const response = await container.items.query(querySpec, options).fetchNext();

    return {
        items: response.resources || [],
        continuationToken: response.continuationToken,
        hasMore: !!response.continuationToken
    };
}

export async function getItem(
    databaseId: string,
    containerId: string,
    itemId: string,
    partitionKey: string
): Promise<Record<string, unknown> | null> {
    const client = ensureClient();
    const container = client.database(databaseId).container(containerId);
    const { resource } = await container.item(itemId, partitionKey).read();
    return resource;
}

export async function searchItems(
    databaseId: string,
    containerId: string,
    searchField: string,
    searchValue: string,
    maxItemCount: number = 50
): Promise<Record<string, unknown>[]> {
    const client = ensureClient();
    const container = client.database(databaseId).container(containerId);

    const querySpec = {
        query: `SELECT * FROM c WHERE CONTAINS(c.${searchField}, @searchValue, true)`,
        parameters: [{ name: "@searchValue", value: searchValue }]
    };

    const { resources } = await container.items.query(querySpec, { maxItemCount }).fetchAll();
    return resources;
}

// Store client globally in dev mode
if (!isProd && cosmosClient) {
    (global as typeof global & {
        __cosmos_client?: CosmosClient;
    }).__cosmos_client = cosmosClient;
}

export { ensureClient as getCosmosClient };
