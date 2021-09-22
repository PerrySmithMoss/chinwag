import { Post } from "./Post";
import { Profile } from "./Profile";

export interface User {
  id: number;
  createdAt: string;
  updatedAt: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  posts: Post[];
  profile: Profile;
}
