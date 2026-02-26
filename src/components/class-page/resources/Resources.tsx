import { Role } from "@/components/profile/types";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Library } from "lucide-react";

export function Resources({ role }: { role: Role }) {
  return (
    <ComingSoon
      text={
        role == "student"
          ? "Resources Coming Soon"
          : "Resource Management Coming Soon"
      }
      icon={Library}
    />
  );
}
