"use client";

interface CheckboxItemProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children?: React.ReactNode;
}

export function CheckboxItem({ id, label, checked, onChange, children }: CheckboxItemProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex cursor-pointer items-center gap-3 group">
        <div
          className={`flex h-4 w-4 shrink-0 items-center justify-center border transition-colors ${
            checked ? "border-[#375e40] bg-[#375e40]" : "border-black/30 bg-transparent group-hover:border-[#375e40]"
          }`}
        >
          {checked && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span className="text-sm text-black">{label}</span>
      </label>
      {checked && children && <div className="ml-7">{children}</div>}
    </div>
  );
}
