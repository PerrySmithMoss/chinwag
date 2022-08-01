import { User } from "../interfaces/User";

export const login = async (formValues: {
  email: string;
  password: string;
}): Promise<User> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        body: JSON.stringify(formValues),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const json: User = await res.json();

    return json;
  } catch (err: any) {
    console.log("Login error: ", err);
    throw Error(err);
  }
};
