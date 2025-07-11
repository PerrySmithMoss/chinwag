import { useEffect } from "react";
import { useUser } from "../../../context/user-context";
import { SideNav } from "../../Chat/SideNav/SideNav";
import { Main } from "../../Chat/Main/Main";
import { User } from "../../../interfaces/User";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useCurrentUser } from "../../../hooks/queries/useCurrentUser";

interface ChatProps {
  user: User | null;
}

export const Chat: React.FC<ChatProps> = ({ user }) => {
  const { userDispatch } = useUser();

  const { data } = useCurrentUser({ initialData: user });

  useEffect(() => {
    if (data) {
      userDispatch({ type: "SET_USER", payload: data });
    }
  }, [data, userDispatch]);

  if (!data) return null;
  return (
    <main>
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <SideNav user={data} />
          <Main user={data} />
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
