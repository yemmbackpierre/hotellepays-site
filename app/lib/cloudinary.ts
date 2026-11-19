/* eslint-disable @typescript-eslint/no-var-requires */
const cloudinary: any = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export type UploadResult = {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
};

export function uploadBuffer(buffer: Buffer, publicId?: string): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const opts: Record<string, unknown> = {
      folder: process.env.CLOUDINARY_FOLDER || 'nextjs_uploads',
      resource_type: 'image',
    };
    if (publicId) opts.public_id = publicId;
    const stream = cloudinary.uploader.upload_stream(opts, (error: any, result: any) => {
      if (error) return reject(new Error(String(error)));
      resolve(result as UploadResult);
    });
    stream.end(buffer);
  });
}
