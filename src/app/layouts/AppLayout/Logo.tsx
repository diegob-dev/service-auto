import { Link } from "react-router-dom";

export const Logo = () => {
  return (
    <Link
      to="/"
      aria-label="Service SRL - Home"
      className="flex items-center gap-2 text-2xl font-bold uppercase text-background sm:text-3xl"
    >
      Service srl
    </Link>
  );
};
