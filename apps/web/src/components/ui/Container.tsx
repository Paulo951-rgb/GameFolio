/** Container — consistent horizontal padding + max width across pages. */
export function Container({
  children,
  className = "",
  width = "default",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "default" | "narrow" | "wide";
}) {
  const max =
    width === "narrow" ? "max-w-2xl" : width === "wide" ? "max-w-[1400px]" : "max-w-6xl";
  return <div className={`mx-auto w-full ${max} px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>;
}
