import { Router } from "express";
import {
  allUsersHandler,
  deleteUserHandler,
  getUserHandler,
  getUserFriendsHandler,
  createUserHandler,
  updateUserHandler,
  loginUserHandler,
  getCurrentUserHandler,
} from "../controllers/userController";
import { requireUser } from "../middleware/requireUser";

const userRouter = Router();

// Register new user
userRouter.post("/register", createUserHandler);

// Log a user in
userRouter.post("/login", loginUserHandler);

// Return all users
userRouter.get("/", allUsersHandler);

// Return logged in user
userRouter.get("/me", requireUser, getCurrentUserHandler);

// Return all users
userRouter.get("/friends/:id", getUserFriendsHandler);

// Return a specifc user
userRouter.get("/:id", getUserHandler);

// Update user details
userRouter.patch("/:id", updateUserHandler);

// Delete a specifc user
userRouter.delete("/:id", deleteUserHandler);

export default userRouter;
