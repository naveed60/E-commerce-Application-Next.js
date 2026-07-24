type PyramidLoaderProps = {
  size?: "xs" | "sm" | "md" | "lg";
  label?: string;
  className?: string;
};

export function PyramidLoader({
  size = "md",
  label,
  className = "",
}: PyramidLoaderProps) {
  return (
    <div className={`pyramid-loader-root ${className}`.trim()}>
      <div className={`pyramid-loader pyramid-loader--${size}`} aria-hidden="true">
        <div className="pyramid-loader__spinner">
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="pyramid-loader__bar" />
          ))}
        </div>
      </div>
      {label ? (
        <p className="mt-2 text-xs font-medium text-zinc-500" role="status" aria-live="polite">
          {label}
        </p>
      ) : null}
    </div>
  );
}
