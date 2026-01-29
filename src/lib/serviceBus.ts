import { DefaultAzureCredential } from "@azure/identity";
import { ServiceBusClient, ServiceBusAdministrationClient } from "@azure/service-bus";

import { getEnv } from "./env";

const connectionString = getEnv(
    "AZURE_SERVICE_BUS_CONNECTION_STRING",
    "AZURE-SERVICE-BUS-CONNECTION-STRING"
);
const serviceBusFqdn = getEnv("SERVICE_BUS_FQDN", "SERVICE-BUS-FQDN"); // e.g. app-uksouth-dev-sbs.servicebus.windows.net
const managedIdentityClientId = getEnv("AZURE_CLIENT_ID", "AZURE-CLIENT-ID"); // optional: user-assigned managed identity
const isProd = process.env.NODE_ENV === "production";
const credential = managedIdentityClientId
    ? new DefaultAzureCredential({ managedIdentityClientId })
    : new DefaultAzureCredential();

let serviceBusClient: ServiceBusClient | null = null;
let serviceBusAdminClient: ServiceBusAdministrationClient | null = null;

function ensureClients() {
    if (serviceBusClient && serviceBusAdminClient) return;

    // Prefer managed identity if FQDN is provided, otherwise fall back to connection string.
    if (serviceBusFqdn) {
        serviceBusClient = new ServiceBusClient(serviceBusFqdn, credential);
        serviceBusAdminClient = new ServiceBusAdministrationClient(serviceBusFqdn, credential);
    } else if (connectionString) {
        serviceBusClient = new ServiceBusClient(connectionString);
        serviceBusAdminClient = new ServiceBusAdministrationClient(connectionString);
    } else {
        throw new Error(
            "Service Bus configuration missing: set SERVICE_BUS_FQDN (or SERVICE-BUS-FQDN) for managed identity or AZURE_SERVICE_BUS_CONNECTION_STRING (or AZURE-SERVICE-BUS-CONNECTION-STRING)."
        );
    }
}

if (!isProd) {
    const g = global as typeof global & {
        __sb_client?: ServiceBusClient;
        __sb_admin_client?: ServiceBusAdministrationClient;
    };
    if (g.__sb_client && g.__sb_admin_client) {
        serviceBusClient = g.__sb_client;
        serviceBusAdminClient = g.__sb_admin_client;
    }
}

const safeServiceBusClient = new Proxy({} as ServiceBusClient, {
    get: (_target, prop) => {
        ensureClients();
        return (serviceBusClient as ServiceBusClient)[prop as keyof ServiceBusClient];
    }
});

const safeServiceBusAdminClient = new Proxy({} as ServiceBusAdministrationClient, {
    get: (_target, prop) => {
        ensureClients();
        ensureClients();
        return (serviceBusAdminClient as ServiceBusAdministrationClient)[prop as keyof ServiceBusAdministrationClient];
    }
});

export { safeServiceBusClient as serviceBusClient, safeServiceBusAdminClient as serviceBusAdminClient };

