import { Client, Databases, Account } from "appwrite";

const client = new Client()
  .setEndpoint("https://fra.cloud.appwrite.io/v1") 
  .setProject("688cf0f10002a903a086");

const databases = new Databases(client);
const account = new Account(client); // ✅ Add this line

export { client, databases, account };
