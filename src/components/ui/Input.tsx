import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-black uppercase tracking-wider opacity-60">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full border-b border-black/20 bg-transparent py-2 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-[#375e40] ${className}`}
        {...props}
      />
    </div>
  )
);

Input.displayName = "Input";
