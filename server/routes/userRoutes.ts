import { Router } from "express";
import {
  allUsers,
  deleteUser,
  getUser,
  getUserFriends,
  updateUser,
} from "../controllers/userController";

const authRouter = Router();

// Return all users
authRouter.get("/", allUsers);

// Return all users
authRouter.get("/friends/:id", getUserFriends);

// Return a specifc user
authRouter.get("/:id", getUser);

// Update user details
authRouter.patch("/:id", updateUser);

// Delete a specifc user
authRouter.delete("/:id", deleteUser);

export default authRouter;
