import { Dispatch, SetStateAction } from "react";
import { CreateClassForm } from "./CreateClassForm";
import { JoinClassForm } from "./JoinClassForm";

interface NewClassProps {
  role: "teacher" | "student";
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export function NewClass({ role, setShowModal }: NewClassProps) {
  const handleSuccess = () => {
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6 space-y-2">
        <h2 className="text-xl sm:text-2xl font-bold">
          {role === "teacher" ? "Add New Class" : "Join New Class"}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          {role === "teacher"
            ? "Enter the details to create a new class"
            : "Enter the class code to join the class"}
        </p>
      </div>

      {role === "teacher" ? (
        <CreateClassForm onSuccess={handleSuccess} />
      ) : (
        <JoinClassForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}
