import { User } from "../interfaces/User";

export interface initialStateI {
  user: User;
}

export interface IUserActions {
  type: "SET_USER";
  payload: User;
}

export interface IUserState {
  user: User;
}

export const initialState: IUserState = {
  user: {} as User,
};

export const actionTypes = {
  SET_USER: "SET_USER",
};

export type UserDispatchTypes = IUserActions;

const userReducer = (
  state: initialStateI = initialState,
  action: UserDispatchTypes
) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    default:
      return state;
  }
};

export default userReducer;
