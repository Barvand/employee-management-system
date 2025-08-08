import { Account, Client, Databases } from "appwrite";

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // your Appwrite endpoint
  .setProject("688cf0f10002a903a086"); // your Appwrite project ID

const databases = new Databases(client);
const account = new Account(client); 

export { client, databases, account }; // ✅ export lowercase `account`
