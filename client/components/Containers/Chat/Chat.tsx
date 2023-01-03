import { useContext } from "react";
import { UserContext } from "../../../context/user-context";
import { SideNav } from "../../Chat/SideNav/SideNav";
import { Main } from "../../Chat/Main/Main";
import { User } from "../../../interfaces/User";
import fetcher from "../../../utils/fetcher";
import { useQuery } from "@tanstack/react-query";

import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

interface ChatProps {
  user: User | null;
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  const { userDispatch } = useContext(UserContext);

  const { data } = useQuery(
    ["me"],
    () => fetcher(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me/v2`),
    {
      initialData: user,
      onSuccess: (data: User) => {
        userDispatch({ type: "SET_USER", payload: data });
      },
    }
  );

  if (!data?.id) {
    return <div>You need to login!</div>;
  }
  return (
    <main>
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <SideNav user={data} />
          <Main user={data}/>
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </div>
    </main>
  );
};
