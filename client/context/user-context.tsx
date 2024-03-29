import React, { createContext, useContext, useReducer } from "react";
import userReducer, {
  initialState,
  IUserActions,
  IUserState,
} from "./user-reducer";

export interface IUserContextProps {
  userState: IUserState;
  userDispatch: React.Dispatch<IUserActions>;
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

export const useUserValue = () => useContext(UserContext);
