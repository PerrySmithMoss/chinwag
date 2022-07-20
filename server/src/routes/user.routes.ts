import { Router } from "express";
import {
  allUsersHandler,
  deleteUserHandler,
  getUserHandler,
  getUserFriendsHandler,
  createUserHandler,
  updateUserHandler,
  getCurrentUserHandler,
  searchForUserByUsernameHandler,
  uploadUserAvatarHandler,
  getCurrentLoggedInUserHandler,
  searchForUserByEmailHandler,
} from "../controllers/user.controller";
import { requireUser } from "../middleware/requireUser";

const userRouter = Router();

// Register new user
userRouter.post("/register", createUserHandler);

// Return all users
userRouter.get("/", allUsersHandler);

// Return logged in user
userRouter.get("/me", requireUser, getCurrentUserHandler);

// Get current logged in user
userRouter.get("/me/v2", requireUser, getCurrentLoggedInUserHandler);

// Return a users friends
userRouter.get("/friends/:id", getUserFriendsHandler);

// Return a specifc user
userRouter.get("/:id", getUserHandler);

// Update user details
userRouter.patch("/:id", updateUserHandler);

// Delete a specifc user
userRouter.delete("/:id", deleteUserHandler);

// Search for a user by username
userRouter.get("/search/username/:username", searchForUserByUsernameHandler);

// Search for a user by email
userRouter.get("/search/email/:email", searchForUserByEmailHandler);

// Upload a user avatar
userRouter.post("/avatar/:id", requireUser, uploadUserAvatarHandler);

export default userRouter;
