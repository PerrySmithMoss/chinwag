import { Request, Response } from "express";
import { config } from "../config/config";
import { v2 as cloudinary } from "cloudinary";

export function avatarPublicId(userId: number) {
  return `chinwag/avatars/user-${userId}`;
}

export function createSignatureHandler(_req: Request, res: Response) {
  const timestamp = Math.floor(Date.now() / 1000);
  const publicId = avatarPublicId(res.locals.user.id);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, public_id: publicId, invalidate: true, overwrite: true },
    config.cloudinaryApiSecret
  );
  res.json({ timestamp, publicId, signature });
}
