import { Router } from "express";
import { createSignatureHandler } from "../controllers/images.controller";
import { requireUser } from "../middleware/requireUser";

const imageRouter = Router();

// get a cloudinary signature
imageRouter.get("/signature", requireUser, createSignatureHandler);

export default imageRouter;
