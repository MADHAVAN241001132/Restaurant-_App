import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured =
  cloudName &&
  apiKey &&
  apiSecret &&
  !cloudName.startsWith("mock") &&
  !apiKey.startsWith("mock") &&
  !apiSecret.startsWith("mock");

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (isCloudinaryConfigured) {
      console.log("🌩️ Uploading image to Cloudinary...");
      // Upload to Cloudinary using a Promise wrapper for stream upload
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "restaurant_menu" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        uploadStream.write(buffer);
        uploadStream.end();
      });

      return NextResponse.json({ url: uploadResult.secure_url });
    } else {
      console.log("💾 Cloudinary credentials missing/mock. Saving file locally...");
      // Save locally to public/uploads
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const sanitizedFilename = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filepath = path.join(uploadDir, sanitizedFilename);

      await writeFile(filepath, buffer);
      
      const localUrl = `/uploads/${sanitizedFilename}`;
      return NextResponse.json({ url: localUrl });
    }
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload image" },
      { status: 500 }
    );
  }
}
export const dynamic = 'force-dynamic';
