import type { NextPage } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import { useContext, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { Login } from "../components/Icons/Login";
import { User } from "../interfaces/User";
import { UserContext } from "../context/user-context";
import useLocalStorage from "../hooks/useLocalStorage";

interface ILoginForm {
  email: string,
  password: string
}

const Home: NextPage = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [id, setId] = useLocalStorage('id')
  const [formValues, setFormValues] = useState<ILoginForm>({
    email: "",
    password: "",
  });
  const { userState, userDispatch } = useContext(UserContext);
  const onFormChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
  };
  const handleRegisterUser = async () => {
    mutateAsync();
    router.push("/chat");
  };
  const postUser = async (): Promise<User> => {
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        body: JSON.stringify(formValues),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const json = await res.json();
      setId(json.id)
      return json;
    } catch (err: any) {
      console.log("Login error: ", err);
      throw Error(err);
    }
  };

  const { mutateAsync, data } = useMutation("loginUser", postUser, {
    onSuccess: (data) => {
      // console.log("Logged in user: ", data)
      queryClient.setQueryData(["user"], data);
      userDispatch({ type: "SET_USER", payload: data });
    },
  });

  return (
    <div>
      <Head>
        <title>Chinwag</title>
        <meta
          name="description"
          content="Text, Phone, Video with anyone, anywhere."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="grid grid-cols-2 h-screen antialiased">
          <div className="bg-tan-background">
            <div className="ml-6 mt-4 flex flex-wrap content-center items-center">
              <div>
                <Image src="/assets/images/logo.png" height={50} width={50} />
              </div>
              <div>
                <h1 className=" text-blue-text text-2xl font-bold">Chinwag</h1>
              </div>
            </div>
            <div className="flex justify-center mt-60">
              <Login width="550px" />
            </div>
            <div className="mt-6 flex justify-center">
              <h1 className="text-white text-3xl font-bold">
                Chat with anyone, anywhere.
              </h1>
            </div>
          </div>
          <div className="ml-24 mt-80">
            <div className="flex">
              <h2 className="text-3xl font-bold">Chat Now.</h2>
            </div>
            <div className="flex">
              <div>
                <p className="mt-1 text-sm text-gray-400">
                  Don't have an account?
                </p>
              </div>
              <div>
                <p className="ml-1 mt-1 text-tan-background-accent text-sm tracking-wide">
                  Sign up
                </p>
              </div>
            </div>
            <div className="flex mt-7 space-x-3">
              <button className="bg-white border shadow-md hover:bg-gray-100 px-4 py-2 font-semibold inline-flex items-center space-x-2 rounded">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                    <path
                      fill="#4285F4"
                      d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                    />
                    <path
                      fill="#34A853"
                      d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                    />
                  </g>
                </svg>
                <span className="font-semibold text-sm">Login with Google</span>
              </button>
              <button className="bg-blue-500 hover:bg-blue-800 px-4 py-2 font-semibold text-white inline-flex items-center space-x-2 rounded">
                <svg
                  className="w-5 h-5 fill-current"
                  role="img"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="text-sm">Login with Facebook</span>
              </button>
            </div>
            {/* <div className="mt-4 flex items-center">
              <span className="border-b w-2/5 lg:w-2/4"></span>
              <a
                href="#"
                className="text-sm text-gray-400 text-center"
              >
                OR
              </a>
              <span className="border-b w-2/5 lg:w-2/4"></span>
            </div> */}
            <div className="mt-10">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                name="email"
                onChange={onFormChange}
                className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-96 appearance-none"
                type="email"
              />
            </div>
            <div className="mt-4">
              <div className="flex justify-between">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Password
                </label>
                {/* <a href="#" className="text-xs text-gray-500">
                  Forgot Password?
                </a> */}
              </div>
              <input
                name="password"
                onChange={onFormChange}
                className="bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-96 appearance-none"
                type="password"
              />
            </div>
            <div className="flex">
              <div className="ml-1 mt-2">
                <input
                  type="checkbox"
                  defaultChecked
                  name="checkbok-1"
                  id="checkbok-1"
                />
                <span className="check-icon"></span>
              </div>
              <div>
                <p className="mt-2 ml-2 text-sm text-gray-400">
                  I agree to the
                </p>
              </div>
              <div>
                <p className="ml-1 mt-2 text-tan-background-accent text-sm">
                  Terms of Service
                </p>
              </div>
              <div>
                <p className="ml-1 mt-2 text-sm text-gray-400">&</p>
              </div>
              <div>
                <p className="ml-1 mt-2 text-tan-background-accent text-sm">
                  Privacy Policy
                </p>
              </div>
            </div>
            <div className="mt-8">
              <button
                onClick={handleRegisterUser}
                className="bg-tan-background-accent text-white font-bold py-2 px-4 w-96 rounded hover:bg-tan-background"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
