import { AnalyzeDocumentCommand, TextractClient } from "@aws-sdk/client-textract";
import { createWorker } from "tesseract.js";
import { env } from "../config/env.js";

let textract: TextractClient | null = null;

function getTextract() {
  if (!textract) textract = new TextractClient({ region: env.AWS_REGION });
  return textract;
}

export async function extractTextFromS3(s3Key: string) {
  if (!env.AWS_TEXTRACT_ENABLED) {
    return "OCR_PENDING: enable AWS_TEXTRACT_ENABLED=true or submit an image buffer to local Tesseract.";
  }

  const result = await getTextract().send(new AnalyzeDocumentCommand({
    Document: { S3Object: { Bucket: env.AWS_S3_BUCKET, Name: s3Key } },
    FeatureTypes: ["FORMS", "TABLES"]
  }));

  return result.Blocks?.filter((block) => block.BlockType === "LINE").map((block) => block.Text).filter(Boolean).join("\n") || "";
}

export async function extractTextFromImageBuffer(buffer: Buffer) {
  const worker = await createWorker("eng");
  try {
    const result = await worker.recognize(buffer);
    return result.data.text;
  } finally {
    await worker.terminate();
  }
}
