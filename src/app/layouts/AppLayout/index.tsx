import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-svh ">
      <Navbar />
      <main className="bg-background flex-1">{children}</main>
      <Footer />
    </div>
  );
}
