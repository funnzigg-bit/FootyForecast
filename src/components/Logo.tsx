import logoSrc from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
};

const Logo = ({ size = "md", className }: LogoProps) => (
  <img
    src={logoSrc}
    alt="FootyForecast"
    className={cn(sizeMap[size], "object-contain", className)}
  />
);

export default Logo;
