import { Request, Response } from "express";
import { config } from "../../config/config";
import * as Cloudinary from "cloudinary";

// Create a cloudinary signature
// @TODO: Tag each image which a user ID
// if that user ID has already uploaded 5 images in the last 24 hours
// then do not allow them to generate a new signature
export async function createSignatureHandler(req: Request, res: Response) {
  try {
    let { avatarId } = req.query;
    const parsedAvatarId = avatarId === "null" ? null : avatarId;

    const timestamp = Math.round(new Date().getTime() / 1000);

    let signature;

    if (parsedAvatarId) {
      // If user already has an avatar - overwrite 
      // their current avatar with the new one
      signature = Cloudinary.v2.utils.api_sign_request(
        {
          timestamp: timestamp,
          folder: "chinwag/avatars",
          invalidate: true,
          overwrite: true,
          public_id: avatarId,
        },
        config.cloudinaryApiSecret as string
      );
    } else {
      // If user does not have an avatar - upload the image
      signature = Cloudinary.v2.utils.api_sign_request(
        {
          timestamp: timestamp,
          folder: "chinwag/avatars",
        },
        config.cloudinaryApiSecret as string
      );
    }

    res.json({ timestamp, signature });
  } catch (err) {
    res.status(500).json(err);
  }
}
