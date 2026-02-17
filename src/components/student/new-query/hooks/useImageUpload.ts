import { useRef } from "react";
import { toast } from "sonner";

const MAX_IMAGES = 3;

export function useImageUpload(
  images: File[] | undefined,
  setValue: (name: "images", value: File[], options?: any) => void,
) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const currentImages = images || [];

      if (currentImages.length >= MAX_IMAGES) {
        toast.error(`Maximum ${MAX_IMAGES} images allowed`);
        return;
      }

      const availableSlots = MAX_IMAGES - currentImages.length;
      const filesToAdd = newFiles.slice(0, availableSlots);

      if (newFiles.length > availableSlots) {
        toast.error(`Only ${availableSlots} more image(s) can be added`);
      }

      setValue("images", [...currentImages, ...filesToAdd], {
        shouldValidate: true,
      });
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const currentImages = images || [];
    setValue(
      "images",
      currentImages.filter((_, i) => i !== index),
    );
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    handleImageSelect,
    removeImage,
    triggerFileInput,
    maxImages: MAX_IMAGES,
    canAddMore: (images?.length || 0) < MAX_IMAGES,
  };
}
