import { Profile } from "./Profile";

export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  profile: Profile;
}
