import clsx from "clsx";
import { Hash } from "lucide-react";

export function RequiredTag() {
  return (
    <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary tracking-wider font-semibold">
      REQUIRED
    </span>
  );
}

export function InputInfo({ text }: { text: string }) {
  return (
    <p className="text-[11px] text-muted-foreground mt-2 ml-1 flex items-center gap-1.5">
      <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/50" />
      {text}
    </p>
  );
}

export function ClassCodeInput({
  classCode,
  setClassCode,
}: {
  classCode: string;
  setClassCode: (code: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="class-code"
        className="flex items-center gap-2 text-xs font-semibold text-primary ml-1 mb-1.5 uppercase tracking-wider"
      >
        Class Code <RequiredTag />
      </label>
      <div className="relative group">
        <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 transition-colors group-focus-within:text-primary" />
        <input
          id="class-code"
          type="text"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value.toUpperCase())}
          placeholder="XYZ-123"
          className={clsx(
            "w-full rounded-xl border-2 border-primary/15 bg-primary/5 px-4 pl-11 py-4 text-lg font-bold tracking-widest outline-none transition-all uppercase",
            "focus:border-primary focus:ring-4 focus:ring-primary/15",
            "placeholder:text-muted-foreground/30 placeholder:font-normal placeholder:tracking-normal",
            "hover:border-primary/40",
            "text-foreground",
          )}
        />
      </div>
      <InputInfo text="Ask your teacher if you don't have a code" />
    </div>
  );
}
