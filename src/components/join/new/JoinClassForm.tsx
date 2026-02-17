import { useState } from "react";
import { ClassCodeInput } from "../ClassCodeInput";
import { ContinueButton } from "../ContinueButton";
import { useClassActions } from "./useClassActions";

export function JoinClassForm({ onSuccess }: { onSuccess: () => void }) {
  const [classCode, setClassCode] = useState("");
  const { joinClass, submitting } = useClassActions(onSuccess);

  const handleSubmit = () => {
    if (!classCode || classCode.length < 6) return;
    joinClass(classCode);
  };

  return (
    <div className="flex flex-col gap-6">
      <ClassCodeInput classCode={classCode} setClassCode={setClassCode} />
      <ContinueButton
        submitting={submitting}
        handleSubmit={handleSubmit}
        text="Join Class"
        loadingText="Joining..."
        disabled={!classCode}
      />
    </div>
  );
}
