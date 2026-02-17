/**
 * Compresses an image file to reduce upload size
 * @param file - The original image file
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1080)
 * @param quality - JPEG quality 0-1 (default: 0.8)
 * @returns Compressed image as a File object
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8,
): Promise<File> {
  // Return non-image files as-is
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Return GIFs without compression (to preserve animation)
  if (file.type === "image/gif") {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }

            // Create new file from blob
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg", // Convert all to JPEG for better compression
              lastModified: Date.now(),
            });

            // Only use compressed version if it's actually smaller
            if (compressedFile.size < file.size) {
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compresses multiple images in parallel
 * @param files - Array of image files
 * @param options - Compression options
 * @returns Array of compressed files
 */
export async function compressImages(
  files: File[],
  options?: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  },
): Promise<File[]> {
  const compressionPromises = files.map((file) =>
    compressImage(
      file,
      options?.maxWidth,
      options?.maxHeight,
      options?.quality,
    ),
  );

  return Promise.all(compressionPromises);
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
