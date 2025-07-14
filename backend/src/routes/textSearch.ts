import { Router, Request, Response } from "express";
import { z } from "zod";
import { getClient } from "../lib/weaviate";

export const router = Router();

const searchTextSchema = z.object({
  query: z.string(),
  limit: z.number().default(10),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const parsed = searchTextSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid data" });
    }

    const { query, limit } = parsed.data;

    const result = await getClient()
      .graphql.get()
      .withClassName("Image")
      .withFields("title image")
      .withBm25({ query })
      .withLimit(limit)
      .do();

    console.log("OK");
    res.json({ results: result.data.Get["Image"] });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});
