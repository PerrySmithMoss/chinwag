import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { object, string, TypeOf } from "zod";

const loginSchema = object({
  email: string().min(1, { message: "Email is required" }),
  password: string().min(1, { message: "Password is required" }),
});

type LoginInput = TypeOf<typeof loginSchema>;

type Props = {
  onSubmit: (values: LoginInput) => void;
  loginError: string | null;
};

export const LoginForm: React.FC<Props> = ({ onSubmit, loginError }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  return (
    // google login
    //     <div className="flex mt-7 space-x-3">
    //     <button className="cursor-pointer bg-white border shadow-md hover:bg-gray-100 px-4 py-2 font-semibold inline-flex items-center space-x-2 rounded">
    //       <svg
    //         viewBox="0 0 24 24"
    //         className="w-5 h-5 fill-current"
    //         xmlns="http://www.w3.org/2000/svg"
    //       >
    //         <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
    //           <path
    //             fill="#4285F4"
    //             d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
    //           />
    //           <path
    //             fill="#34A853"
    //             d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
    //           />
    //           <path
    //             fill="#FBBC05"
    //             d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
    //           />
    //           <path
    //             fill="#EA4335"
    //             d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
    //           />
    //         </g>
    //       </svg>
    //       <span className="font-semibold text-sm">
    //         Login with Google
    //       </span>
    //     </button>
    //     <button className="cursor-pointer bg-blue-500 hover:bg-blue-800 px-4 py-2 font-semibold text-white inline-flex items-center space-x-2 rounded">
    //       <svg
    //         className="w-5 h-5 fill-current"
    //         role="img"
    //         xmlns="http://www.w3.org/2000/svg"
    //         viewBox="0 0 24 24"
    //       >
    //         <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    //       </svg>
    //       <span className="text-sm">Login with Facebook</span>
    //     </button>
    //   </div>
    //    <div className="mt-4 flex items-center">
    //   <span className="border-b w-2/5 lg:w-2/4"></span>
    //   <a
    //     href="#"
    //     className="text-sm text-gray-400 text-center"
    //   >
    //     OR
    //   </a>
    //   <span className="border-b w-2/5 lg:w-2/4"></span>
    // </div>
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-6">
        <label
          htmlFor="email"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Email Address
        </label>
        <input
          id="email"
          autoComplete="on"
          {...register("email")}
          className="bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 w-96"
          type="email"
        />
        <p className="text-red-400 text-sm font-bold">
          {errors.email?.message}
        </p>
      </div>
      <div className="mt-4">
        <label
          htmlFor="password"
          className="block text-sm font-bold text-gray-700 mb-2"
        >
          Password
        </label>
        <input
          id="password"
          autoComplete="on"
          {...register("password")}
          className="bg-gray-200 text-gray-700 border border-gray-300 rounded py-2 px-4 w-96"
          type="password"
        />
        <p className="text-red-400 text-sm font-bold">
          {errors.password?.message}
        </p>
      </div>
      {loginError && (
        <p className="mt-2 text-red-400 font-bold">{loginError}</p>
      )}
      <div className="mt-5">
        <button
          type="submit"
          className="bg-tan-background-accent cursor-pointer text-white font-bold py-2 px-4 w-96 rounded hover:bg-tan-background"
        >
          Login
        </button>
      </div>
    </form>
  );
};
