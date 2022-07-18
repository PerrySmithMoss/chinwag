import { Router } from "express";
import {
  allUsersHandler,
  deleteUserHandler,
  getUserHandler,
  getUserFriendsHandler,
  createUserHandler,
  updateUserHandler,
  getCurrentUserHandler,
  searchUsersHandler,
} from "../controllers/user.controller";
import { requireUser } from "../middleware/requireUser";

const userRouter = Router();

// Register new user
userRouter.post("/register", createUserHandler);

// Return all users
userRouter.get("/", allUsersHandler);

// Return logged in user
userRouter.get("/me", requireUser, getCurrentUserHandler);

// Return a users contacts
userRouter.get("/friends/:id", getUserFriendsHandler);

// Return a specifc user
userRouter.get("/:id", getUserHandler);

// Update user details
userRouter.patch("/:id", updateUserHandler);

// Delete a specifc user
userRouter.delete("/:id", deleteUserHandler);

// Search for a user
userRouter.get("/search/:username", searchUsersHandler);

export default userRouter;
