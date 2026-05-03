import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { env } from "../config/env.js";

let s3: S3Client | null = null;

function getS3() {
  if (!s3) s3 = new S3Client({ region: env.AWS_REGION });
  return s3;
}

export async function createUploadUrl(params: {
  agentId: string;
  buyerId: string;
  fileName: string;
  contentType: string;
}) {
  const safeName = params.fileName.replace(/[^\w.\-]+/g, "_");
  const key = `agents/${params.agentId}/buyers/${params.buyerId}/${randomUUID()}-${safeName}`;
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: params.contentType,
    ServerSideEncryption: "AES256"
  });

  return {
    key,
    uploadUrl: await getSignedUrl(getS3(), command, { expiresIn: 900 })
  };
}
