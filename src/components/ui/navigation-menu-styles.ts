import { cva } from "class-variance-authority";

export const navigationMenuTriggerStyle = cva(
  [
    "relative",
    "inline-flex",
    "items-center",
    "justify-center",
    "h-10",
    "px-5",
    "font-medium",
    "tracking-wide",
    "uppercase",
    "text-md",
    "text-background",
    "transition-all",
    "focus-visible:ring-2",
    "hover:text-primary",
  ].join(" "),
  {
    variants: {
      active: {
        true: "text-primary border-b-2 border-primary",
        false: "",
      },
    },
  },
);
