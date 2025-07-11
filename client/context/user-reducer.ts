import { User } from "../interfaces/User";

// --- Types ---
export interface IUserState {
  user: User | null;
}

export const initialState: IUserState = {
  user: null,
};

export type UserDispatchTypes =
  | { type: "SET_USER"; payload: User }
  | { type: "REMOVE_USER" };

// --- Action Types ---
export const actionTypes = {
  SET_USER: "SET_USER" as const,
  REMOVE_USER: "REMOVE_USER" as const,
};

// --- Reducer ---
const userReducer = (
  state: IUserState = initialState,
  action: UserDispatchTypes
): IUserState => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    case actionTypes.REMOVE_USER:
      return { ...state, user: null };
    default:
      return state;
  }
};

export default userReducer;
