import { Account, Client, Databases } from "appwrite";

export const DB_ID = "688cf1f200298c50183d";
export const PROJECTS_COLLECTION = "688cf200000b6fdbfe61";
export const PROJECT_LOGS_COLLECTION = "688cf3c800172f6bf40c";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // your Appwrite endpoint
  .setProject("688cf0f10002a903a086"); // your Appwrite project ID

const databases = new Databases(client);
const account = new Account(client);

export { client, databases, account };
