interface SectionTitleProps {
  number?: string | number;
  title: string;
}

export function SectionTitle({ number, title }: SectionTitleProps) {
  return (
    <div className="mb-6">
      <div className="flex items-baseline gap-2">
        {number && (
          <span className="text-sm font-semibold text-black opacity-40 uppercase tracking-widest">
            {number}.
          </span>
        )}
        <h2 className="text-lg font-semibold text-black tracking-tight">{title}</h2>
      </div>
      <div className="mt-2 h-px bg-[#375e40]" />
    </div>
  );
}
