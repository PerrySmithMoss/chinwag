import { Post, Profile } from "@prisma/client";

export interface User {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
  profile: Profile;
  posts: Post;
}
