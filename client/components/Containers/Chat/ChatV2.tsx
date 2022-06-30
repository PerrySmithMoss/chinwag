import { useContext } from "react";
import { UserContext } from "../../../contexts/user-context";
import { SideNav } from "../../Chat/SideNav/SideNav";
import { Main } from "../../Chat/Main/Main";

interface ChatV2Props {}

export const ChatV2: React.FC<ChatV2Props> = ({}) => {
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
