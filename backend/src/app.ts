import express from "express";
import cors from "cors";
import helmet from "helmet";
import { initializeWeaviate } from "./lib";
import { imageSearchRoute, textSearchRoute } from "./routes";
import { errorHandler } from "./middleware";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/search/image", imageSearchRoute.router);
app.use("/search/text", textSearchRoute.router);

app.use(errorHandler);

app.use("*", (_, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const startServer = async () => {
  await initializeWeaviate();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch(console.error);
