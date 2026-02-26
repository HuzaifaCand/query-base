import { useState } from "react";
import { BookOpen, GraduationCap } from "lucide-react";
import { TextInput } from "../TextInput";
import { RadioGroup } from "../RadioGroup";
import { CustomSelect } from "../CustomSelect";
import { SubmitButton } from "../../ui/SubmitButton";
import { useClassActions } from "./useClassActions";

// Constants moved outside or imported
const SUBJECTS = [
  { label: "Mathematics", value: "mathematics" },
  { label: "Physics", value: "physics" },
];

const CLASS_LEVELS = [
  { label: "A Level", value: "a-level" },
  { label: "O Level", value: "o-level" },
];

export function CreateClassForm({ onSuccess }: { onSuccess: () => void }) {
  const [className, setClassName] = useState("");
  const [classSubject, setClassSubject] = useState("");
  const [classLevel, setClassLevel] = useState<string>("a-level");

  const { createClass, submitting } = useClassActions(onSuccess);

  const handleSubmit = () => {
    if (!className || !classSubject || !classLevel) return;
    createClass(className, classSubject, classLevel);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-4">
        <TextInput
          title="Class Name"
          text={className}
          setText={setClassName}
          placeholder="Enter class name"
          Icon={BookOpen}
        />
        <RadioGroup
          title="Class Level"
          options={CLASS_LEVELS}
          selected={classLevel}
          setSelected={setClassLevel}
        />
        <CustomSelect
          title="Subject"
          value={classSubject}
          setValue={setClassSubject}
          placeholder="Select a subject"
          Icon={GraduationCap}
          options={SUBJECTS}
        />
      </div>
      <SubmitButton
        submitting={submitting}
        handleSubmit={handleSubmit}
        text="Add Class"
        loadingText="Adding..."
        disabled={!className || !classSubject}
      />
    </div>
  );
}
