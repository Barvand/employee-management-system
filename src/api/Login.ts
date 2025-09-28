import { makeRequest } from "../axios";

type LoginUserProps = {
  email: string;
  password: string;
};

export default async function loginUser(inputs: LoginUserProps) {
  const res = await makeRequest.post("/auth/login", inputs);
  return res.data; // e.g. { message: "User has been created." }
}
