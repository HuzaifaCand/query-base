import { cn } from "@/lib/utils";
import { ChevronDown, LucideIcon } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  title: string;
  value: string;
  setValue: Dispatch<SetStateAction<string>>;
  placeholder: string;
  Icon: LucideIcon;
  options: { label: string; value: string }[];
}

export function CustomSelect({
  value,
  setValue,
  placeholder,
  Icon,
  title,
  options,
}: Props) {
  return (
    <>
      <label className="block text-xs font-semibold text-muted-foreground ml-1 mb-1.5 uppercase tracking-wider">
        {title}
      </label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors text-primary/60 pointer-events-none z-10" />
        <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-all text-primary/60 group-focus-within:rotate-180 pointer-events-none z-10" />
        <select
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "w-full rounded-xl border border-input bg-background px-4 pl-10 pr-10 py-3 text-sm outline-none transition-all appearance-none cursor-pointer",
            "focus:border-primary/50 focus:ring-4 focus:ring-primary/10",
            "hover:border-accent-foreground/20",
            !value && "text-muted-foreground/40",
          )}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
