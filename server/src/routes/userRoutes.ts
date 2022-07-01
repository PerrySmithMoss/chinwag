import { Router } from "express";
import {
  allUsers,
  deleteUser,
  getUser,
  getUserFriends,
  updateUser,
} from "../controllers/userController";

const userRouter = Router();

// Return all users
userRouter.get("/", allUsers);

// Return all users
userRouter.get("/friends/:id", getUserFriends);

// Return a specifc user
userRouter.get("/:id", getUser);

// Update user details
userRouter.patch("/:id", updateUser);

// Delete a specifc user
userRouter.delete("/:id", deleteUser);

export default userRouter;
