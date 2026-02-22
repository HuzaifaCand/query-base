import { X, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  images: File[];
  onRemove: (index: number) => void;
  className?: string;
}

export function ImagePreview({
  images,
  onRemove,
  className,
}: ImagePreviewProps) {
  if (images.length === 0) return null;

  return (
    <div className={cn("px-3 pt-3 pb-1", className)}>
      <div className="flex flex-wrap gap-2">
        {images.map((file, i) => (
          <div
            key={i}
            className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border/60 shadow-sm transition-all duration-200 hover:shadow-md hover:border-primary/40 hover:scale-[1.02]"
          >
            {/* Image */}
            <img
              src={URL.createObjectURL(file)}
              alt={`Preview ${i + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none" />

            {/* Image index badge */}
            <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
              <ImageIcon className="w-2.5 h-2.5 text-white/80" />
              <span className="text-[10px] text-white/80 font-medium tabular-nums">
                {i + 1}
              </span>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className={cn(
                "absolute top-1 right-1 p-1 rounded-full z-10 transition-all duration-200",
                "bg-black/60 hover:bg-red-500 text-white",
                "opacity-100 lg:opacity-0 lg:group-hover:opacity-100",
                "hover:scale-110 active:scale-95",
              )}
              aria-label={`Remove image ${i + 1}`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
