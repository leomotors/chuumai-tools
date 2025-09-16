import { S3Client } from "@aws-sdk/client-s3";

import { environment } from "./environment";

export const s3 = new S3Client({
  endpoint: environment.AWS_ENDPOINT,
  region: environment.AWS_REGION,
  credentials: {
    accessKeyId: environment.AWS_ACCESS_KEY_ID,
    secretAccessKey: environment.AWS_SECRET_ACCESS_KEY,
  },
  // minio
  forcePathStyle: true,
});
