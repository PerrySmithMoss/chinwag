import { Request, Response } from "express";
import { config } from "../config/config";
import * as Cloudinary from "cloudinary";

interface CreateSignatureQuery {
  avatarId?: string;
}

// Create a cloudinary signature
// @TODO: Tag each image which a user ID
// if that user ID has already uploaded 5 images in the last 24 hours
// then do not allow them to generate a new signature
export async function createSignatureHandler(
  req: Request<{}, {}, {}, CreateSignatureQuery>,
  res: Response
) {
  try {
    let { avatarId } = req.query;
    const parsedAvatarId = avatarId === "null" ? null : avatarId;

    const timestamp = Math.floor(Date.now() / 1000);

    const params: Record<string, any> = {
      timestamp,
      folder: "chinwag/avatars",
    };

    if (parsedAvatarId) {
      Object.assign(params, {
        public_id: parsedAvatarId,
        invalidate: true,
        overwrite: true,
      });
    }

    const signature = Cloudinary.v2.utils.api_sign_request(
      params,
      config.cloudinaryApiSecret as string
    );

    res.json({ timestamp, signature });
  } catch (err) {
    console.error("Cloudinary signature error:", err);
    res.status(500).json({ error: "Failed to generate Cloudinary signature" });
  }
}
