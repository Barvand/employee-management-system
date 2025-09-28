import { makeRequest } from "../axios";

type RegisterUserProps = { 
    name: string;
    email: string;
    password: string; 
    username:string; 
}


export default async function registerUser(inputs : RegisterUserProps) {
  const res = await makeRequest.post("/auth/register", inputs);
  return res.data; // e.g. { message: "User has been created." }
}