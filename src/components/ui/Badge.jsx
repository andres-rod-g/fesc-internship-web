import React from "react";

export default function Badge({
  count = 0,
  variant = "default",
  className = "",
}) {
  if (count === 0) return null;

  const variants = {
    default: "bg-gray-500",
    warning: "bg-yellow-500",
    danger: "bg-red-600",
    success: "bg-green-600",
    info: "bg-blue-600",
  };

  return (
    <span
      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white rounded-full ${variants[variant]} ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
