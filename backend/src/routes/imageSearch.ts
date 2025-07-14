import { Router, Request, Response } from "express";
import sharp from "sharp";
import { upload } from "../middleware";
import { getClient } from "../lib/weaviate";

export const router = Router();

router.post(
  "/",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Image file is required" });
      }

      const processedImage = await sharp(req.file.buffer)
        .resize(224, 224, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer();

      const base64Image = processedImage.toString("base64");

      const result = await getClient()
        .graphql.get()
        .withClassName("Image")
        .withNearImage({ image: base64Image })
        .withLimit(10)
        .withFields("title image")
        .do();

      const images = result.data.Get["Image"];

      console.log("OK");
      res.json({ success: true, results: images, total: images.length });
    } catch (error) {
      console.error("Error in image search:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);
