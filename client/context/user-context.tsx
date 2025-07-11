import React, { createContext, useContext, useReducer } from "react";
import userReducer, {
  initialState,
  IUserState,
  UserDispatchTypes,
} from "./user-reducer";

export interface IUserContextProps {
  userState: IUserState;
  userDispatch: React.Dispatch<UserDispatchTypes>;
}

export const UserContext = createContext<IUserContextProps>({
  userState: initialState,
  userDispatch: () => {},
});

interface IUserStateProvider {
  children: React.ReactNode;
}

export const UserContextProvider = ({ children }: IUserStateProvider) => {
  const [userState, userDispatch] = useReducer(userReducer, initialState);

  return (
    <UserContext.Provider value={{ userState, userDispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export const useRequiredUser = () => {
  const { userState } = useContext(UserContext);
  if (!userState.user) throw new Error("User not found in context");
  return userState.user;
};
