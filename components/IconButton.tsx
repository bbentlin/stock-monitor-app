import { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: "default" | "danger" | "success";
  size?: "sm" | "md";
}

export default function IconButton({
  icon,
  label,
  variant = "default",
  size = "md",
  className = "",
  ...props
}: IconButtonProps) {
  const variants = {
    default: "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700",
    danger: "text-gray-500 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:text-red-400 dark:hover:bg-red-900/20",
    success: "text-gray-500 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:text-green-400 dark:hover:bg-green-900/20",
  };

  const sizes = {
    sm: "p-1",
    md: "p-2",
  };

  return (
    <button
      aria-label={label}
      title={label}
      className={`rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}