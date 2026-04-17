export type SegmentedOption = {
  key: string;
  label: string;
  disabled?: boolean;
};

type SegmentedControlProps = {
  options: SegmentedOption[];
  value: string;
  onChange: (next: string) => void;
  className?: string;
};

export default function SegmentedControl({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps) {
  return (
    <div className={`edu-segmented ${className}`.trim()} role="tablist" aria-label="B? l?c nhanh">
      {options.map((option) => {
        const active = option.key === value;
        return (
          <button
            key={option.key}
            type="button"
            className={`edu-segmented-btn ${active ? 'active' : ''}`.trim()}
            disabled={option.disabled}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
