import { cn } from "@/lib/utils";
import { LucideIcon, User } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  title: string;
  text: string;
  setText: Dispatch<SetStateAction<string>>;
  placeholder: string;
  Icon: LucideIcon;
}

export function TextInput({ text, setText, placeholder, Icon, title }: Props) {
  return (
    <>
      <label className="block text-xs font-semibold text-muted-foreground ml-1 mb-1.5 uppercase tracking-wider">
        {title}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-xl border border-input bg-background/50 px-4 pl-10 py-3 text-sm outline-none transition-all",
            "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
            "placeholder:text-muted-foreground/40",
            "hover:border-accent-foreground/20",
          )}
        />
      </div>
    </>
  );
}
