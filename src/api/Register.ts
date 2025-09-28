import { makeRequest } from "../axios";

type Role = "employee" | "admin" | "accountant";

type RegisterUserProps = {
  name: string;
  email: string;
  password: string;
  username: string;
  role: Role;
};

export default async function registerUser(inputs: RegisterUserProps) {
  const res = await makeRequest.post("/auth/register", inputs);
  return res.data; // e.g. { message: "User has been created." }
}
