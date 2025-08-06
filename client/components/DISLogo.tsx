interface DISLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function DISLogo({ size = "md", className = "" }: DISLogoProps) {
  const sizeClasses = {
    sm: "text-lg font-black",
    md: "text-2xl font-black",
    lg: "text-4xl font-black",
    xl: "text-6xl font-black",
  };

  return (
    <div
      className={`${sizeClasses[size]} font-black text-blue-600 dark:text-blue-400 ${className}`}
      style={{ letterSpacing: "0.1em" }}
    >
      DIS
    </div>
  );
}
