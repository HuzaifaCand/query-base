import { cn } from "@/lib/utils";
import { Dispatch, SetStateAction } from "react";

interface RadioOption {
  label: string;
  value: string;
}

interface Props {
  title: string;
  options: RadioOption[];
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}

export function RadioGroup({ title, options, selected, setSelected }: Props) {
  return (
    <>
      <label className="block text-xs font-semibold text-muted-foreground ml-1 mb-1.5 uppercase tracking-wider">
        {title}
      </label>
      <div className="flex gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setSelected(option.value)}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all",
              "hover:border-primary/30 hover:bg-primary/5",
              "focus:outline-none focus:ring-2 focus:ring-primary/10",
              selected === option.value
                ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                : "border-input bg-background/50 text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
