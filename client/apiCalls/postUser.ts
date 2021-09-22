import { User } from "../interfaces/User";

export const postUser = async (formValues: {
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      body: JSON.stringify(formValues),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const json: User = await res.json();

    return json;
  } catch (err: any) {
    console.log("Login error: ", err);
    throw Error(err);
  }
};
