// /src/api/appwriteConfig.js
import { Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // your Appwrite endpoint
  .setProject("688cf0f10002a903a086"); // your Appwrite project ID

const databases = new Databases(client);

export { client, databases };
