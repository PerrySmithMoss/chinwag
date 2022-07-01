import { useContext } from "react";
import { UserContext } from "../../../context/user-context";
import { SideNav } from "../../Chat/SideNav/SideNav";
import { Main } from "../../Chat/Main/Main";

interface ChatProps {}

export const Chat: React.FC<ChatProps> = ({}) => {
  const { userState, userDispatch } = useContext(UserContext);

  if (!userState.user) {
    return <>You need to login!</>;
  }
  return (
    <main>
      <div className="flex h-screen antialiased text-gray-800">
        <div className="flex flex-row h-full w-full overflow-x-hidden">
          <SideNav />
          <Main />
        </div>
      </div>
    </main>
  );
};
