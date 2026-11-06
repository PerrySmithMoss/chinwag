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
import { requireAccountOwner } from "../middleware/requireAccountOwner";

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
userRouter.patch("/:id", requireUser, requireAccountOwner, updateUserHandler);

// Delete the signed-in user's account
userRouter.delete("/:id", requireUser, requireAccountOwner, deleteUserHandler);

// Search for a user by username
userRouter.get("/search/username/:username", searchForUserByUsernameHandler);

// Search for a user by email
userRouter.get("/search/email/:email", requireUser, searchForUserByEmailHandler);

// Upload a user avatar
userRouter.post("/avatar/:id", requireUser, requireAccountOwner, uploadUserAvatarHandler);

export default userRouter;
