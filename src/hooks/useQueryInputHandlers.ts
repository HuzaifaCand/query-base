import { toast } from "sonner";
import { UseFormSetValue, UseFormTrigger } from "react-hook-form";

export interface UseQueryInputHandlersProps {
  type: "query" | "answer";
  voiceRecorder: {
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    deleteVoiceNote: () => void;
  };
  imageUpload: {
    maxImages: number;
  };
  hasVoiceNote: boolean;
  images: File[] | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: UseFormSetValue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  trigger: UseFormTrigger<any>;
}

export function useQueryInputHandlers({
  type,
  voiceRecorder,
  imageUpload,
  hasVoiceNote,
  images,
  setValue,
  trigger,
}: UseQueryInputHandlersProps) {
  const textFieldName = type === "query" ? "description" : "bodyText";
  const maxTextLength = type === "query" ? 1500 : 2000;

  const handleStartRecording = async () => {
    await voiceRecorder.startRecording();
  };

  const handleStopRecording = () => {
    voiceRecorder.stopRecording();
    setValue("hasVoiceNote", true, { shouldValidate: true });
    // This casting ensures trigger acts properly depending on the text field
    trigger(textFieldName);
  };

  const handleDeleteVoiceNote = () => {
    voiceRecorder.deleteVoiceNote();
    setValue("hasVoiceNote", false, { shouldValidate: true });
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > maxTextLength) {
      toast.error(
        `${type === "query" ? "Description" : "Answer"} cannot exceed ${maxTextLength} characters`,
      );
      return;
    }
    setValue(textFieldName, value, { shouldValidate: true });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    // Extract image files from clipboard
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length === 0) return;

    // Prevent default paste behavior for images
    e.preventDefault();

    const currentImages = images || [];
    const maxImages = imageUpload.maxImages;

    if (currentImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const availableSlots = maxImages - currentImages.length;
    const filesToAdd = imageFiles.slice(0, availableSlots);

    if (imageFiles.length > availableSlots) {
      toast.error(`Only ${availableSlots} more image(s) can be added`);
    }

    setValue("images", [...currentImages, ...filesToAdd], {
      shouldValidate: true,
    });
  };

  const getPlaceholder = () => {
    if (hasVoiceNote) {
      return "Add more context to your voice note (optional)...";
    }
    if (images && images.length > 0) {
      return type === "query"
        ? "Describe what you need help with..."
        : "Describe your answer...";
    }
    return type === "query"
      ? "Describe your question, attach images (Ctrl+V to paste), or record a voice note..."
      : "Write your answer, attach images (Ctrl+V to paste), or record a voice note...";
  };

  return {
    handleStartRecording,
    handleStopRecording,
    handleDeleteVoiceNote,
    handleTextChange,
    handlePaste,
    getPlaceholder,
  };
}
