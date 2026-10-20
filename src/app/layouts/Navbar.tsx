import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu-styles";
import { Button } from "@/components/ui/button";
import { ButtonAnchor } from "@/components/ui/button-link";
import { Logo } from "./Logo";
import { Menu, Phone, X } from "lucide-react";
import { Container } from "./Container";
import { useEffect, useRef, useState } from "react";
import { NAV_LINKS, PHONE_NUMBER } from "@/lib/constants";

export const Navbar = () => {
  const location = useLocation();
  // Il menu è legato alla pagina in cui è stato aperto: cambiando pagina
  // (anche dal logo o con il tasto Indietro) si chiude da solo.
  const [menuOpenOn, setMenuOpenOn] = useState<string | null>(null);
  const isMenuOpen = menuOpenOn === location.pathname;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeMenu = () => setMenuOpenOn(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpenOn(null);
      menuButtonRef.current?.focus();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === href
      : location.pathname.startsWith(href);

  return (
    <NavigationMenu className="sticky top-0 z-50">
      <Container
        size="large"
        className="flex items-center justify-between gap-4"
      >
        <Logo />
        <NavigationMenuList className="hidden min-[1180px]:flex">
          {NAV_LINKS.map((link) => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle({
                  active: isActive(link.href),
                })}
                render={<Link to={link.href}>{link.label}</Link>}
              />
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <div className="hidden items-center justify-end gap-2 text-background uppercase font-bold min-[1180px]:flex">
          <ButtonAnchor variant="default" size="lg" href={phoneHref}>
            <Phone className="mr-1" aria-hidden="true" />
            Contattaci
          </ButtonAnchor>
        </div>
        <div className="flex items-center gap-2 min-[1180px]:hidden">
          <Link
            to="/auto-usate"
            className={`hidden rounded-lg px-3 py-2 text-sm font-bold uppercase transition-colors hover:bg-white/10 sm:inline-flex ${
              isActive("/auto-usate") ? "text-primary" : "text-background"
            }`}
          >
            Auto usate
          </Link>
          <ButtonAnchor className="hidden md:inline-flex" variant="default" size="sm" href={phoneHref}>
            <Phone aria-hidden="true" /> Chiama
          </ButtonAnchor>
          <Button
            className="rounded-full border border-white/15 text-background hover:bg-white/10 hover:text-background aria-expanded:bg-white/10 aria-expanded:text-background"
            variant="ghost"
            size="icon-lg"
            aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            ref={menuButtonRef}
            onClick={() => setMenuOpenOn(isMenuOpen ? null : location.pathname)}
          >
            {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>
      </Container>
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-t border-white/10 bg-foreground/98 p-4 shadow-xl backdrop-blur-sm md:left-auto md:w-96 md:border-l min-[1180px]:hidden"
        >
          <nav aria-label="Navigazione mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMenu}
                className={`px-4 py-3 uppercase transition-colors hover:text-primary ${
                  isActive(link.href) ? "text-primary" : "text-background"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href={phoneHref}
              className="mt-2 flex items-center gap-2 px-4 py-3 text-primary uppercase"
            >
              <Phone className="size-4" aria-hidden="true" /> Chiama {PHONE_NUMBER}
            </a>
          </nav>
        </div>
      )}
    </NavigationMenu>
  );
};
