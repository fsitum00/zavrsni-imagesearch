import weaviate, { ObjectsBatcher, WeaviateClient } from "weaviate-ts-client";
import csv from "csv-parser";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import "dotenv/config";

interface ImageData {
  image: string;
  title: string;
}

class DataIngestion {
  private client: WeaviateClient;
  private datasetPath: string;
  private csvPath: string;

  constructor() {
    this.client = null as any;
    this.datasetPath = path.join(__dirname, "../../../dataset/data");
    this.csvPath = path.join(__dirname, "../../../dataset/data.csv");
  }

  async initialize() {
    try {
      this.client = weaviate.client({
        scheme: process.env.WEAVIATE_PROTOCOL || "http",
        host: process.env.WEAVIATE_BASE_URL || "http://localhost:8080",
      });

      try {
        await this.client.misc.metaGetter().do();
      } catch (error) {
        throw error;
      }

      await this.createSchema();
    } catch (error) {
      throw error;
    }
  }

  private async createSchema() {
    const schema = {
      class: "Image",
      description: "A class to store image data with vector embeddings",
      vectorizer: "multi2vec-clip",
      moduleConfig: {
        "multi2vec-clip": {
          imageFields: ["image"],
          textFields: ["title"],
        },
      },
      properties: [
        {
          name: "image",
          dataType: ["blob"],
          description: "The image file",
        },
        {
          name: "title",
          dataType: ["text"],
          description: "Title of the product",
        },
      ],
    };

    await this.client.schema.classCreator().withClass(schema).do();
  }

  private async readCSVData(): Promise<ImageData[]> {
    return new Promise((resolve, reject) => {
      const results: ImageData[] = [];

      fs.createReadStream(this.csvPath)
        .pipe(csv())
        .on("data", (data) => {
          results.push({
            image: data.image,
            title: data["display name"],
          });
        })
        .on("end", () => {
          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }

  private async processImage(imagePath: string): Promise<Buffer> {
    try {
      const imageBuffer = await sharp(imagePath)
        .resize(224, 224, { fit: "cover" })
        .jpeg({ quality: 90 })
        .toBuffer();

      return imageBuffer;
    } catch (error) {
      throw error;
    }
  }

  private async uploadBatch(batch: any[], batchNumber: number) {
    try {
      let batcher: ObjectsBatcher = this.client.batch.objectsBatcher();

      const promises = batch.map(async (item: any) => {
        const dataObj = {
          title: item.title,
          image: item.image.toString("base64"),
        };

        batcher = batcher.withObject({
          class: "Image",
          properties: dataObj,
        });
      });

      await Promise.all(promises);

      await batcher.do();
    } catch (error) {
      throw error;
    }
  }

  async ingestData(limit?: number) {
    try {
      const csvData = await this.readCSVData();
      const dataToProcess = limit ? csvData.slice(0, limit) : csvData;

      console.log(`Processing ${dataToProcess.length} images...`);

      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < dataToProcess.length; i += batchSize) {
        const batch = dataToProcess.slice(i, i + batchSize);
        batches.push(batch);
      }

      let processedCount = 0;
      let successCount = 0;
      let errorCount = 0;

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        const batchNumber = batchIndex + 1;

        console.log(`\nProcessing batch ${batchNumber}/${batches.length}...`);

        const processedBatch = [];

        for (const item of batch) {
          try {
            const imagePath = path.join(this.datasetPath, item.image);

            if (!fs.existsSync(imagePath)) {
              errorCount++;
              continue;
            }

            const imageBuffer = await this.processImage(imagePath);

            processedBatch.push({
              ...item,
              image: imageBuffer,
              filename: item.image,
            });

            processedCount++;

            if (processedCount % 10 === 0) {
              console.log(
                `   Processed ${processedCount}/${dataToProcess.length} images`
              );
            }
          } catch (error) {
            errorCount++;
          }
        }

        if (processedBatch.length > 0) {
          try {
            await this.uploadBatch(processedBatch, batchNumber);
            successCount += processedBatch.length;
          } catch (error) {
            errorCount += processedBatch.length;
          }
        }
      }
    } catch (error) {
      throw error;
    }
  }
}

const main = async () => {
  const ingestion = new DataIngestion();

  try {
    await ingestion.initialize();

    const args = process.argv.slice(2);
    const limit = args.find((arg) => arg.startsWith("--limit="))?.split("=")[1];
    const limitNumber = limit ? parseInt(limit) : undefined;

    await ingestion.ingestData(limitNumber);
  } catch (error) {
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}
