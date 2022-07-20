import { Request, Response } from "express";
import { config } from "../../config/config";
import * as Cloudinary from "cloudinary";

// Create a cloudinary signature
// @TODO: Tag each image which a user ID
// if that user ID has already uploaded 10 images
// then do not allow them to generate a new signature
export async function createSignatureHandler(req: Request, res: Response) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = Cloudinary.v2.utils.api_sign_request(
      {
        timestamp: timestamp,
        folder: "chinwag/avatars"
      },
      config.cloudinaryApiSecret as string
    );
    res.json({ timestamp, signature });
  } catch (err) {
    res.status(500).json(err);
  }
}
