import { forwardRef } from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, className = "", ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-black uppercase tracking-wider opacity-60">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={4}
        className={`w-full resize-none border border-black/10 bg-transparent p-3 text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-[#375e40] rounded-sm ${className}`}
        {...props}
      />
    </div>
  )
);

Textarea.displayName = "Textarea";
