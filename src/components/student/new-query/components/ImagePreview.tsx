import { X } from "lucide-react";

interface ImagePreviewProps {
  images: File[];
  onRemove: (index: number) => void;
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className="px-4 pt-4 pb-2">
      <div className="flex flex-wrap gap-2">
        {images.map((file, i) => (
          <div
            key={i}
            className="relative group w-24 h-24 rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-colors"
          >
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full transition-all opacity-100 lg:opacity-0 lg:group-hover:opacity-100 z-10"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
