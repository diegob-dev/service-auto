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
import { useState } from "react";
import { NAV_LINKS, PHONE_NUMBER } from "@/lib/constants";

export const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
        <NavigationMenuList className="hidden lg:flex">
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
        <div className="hidden items-center justify-end gap-2 text-background uppercase font-bold lg:flex">
          <ButtonAnchor variant="default" size="lg" href={phoneHref}>
            <Phone className="mr-1" />
            Contattaci
          </ButtonAnchor>
        </div>
        <Button
          className="lg:hidden"
          variant="ghost"
          size="icon-lg"
          aria-label={isMenuOpen ? "Chiudi menu" : "Apri menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X /> : <Menu />}
        </Button>
      </Container>
      {isMenuOpen && (
        <div
          id="mobile-navigation"
          className="absolute inset-x-0 top-full border-t border-muted-foreground/30 bg-foreground p-4 shadow-lg lg:hidden"
        >
          <nav aria-label="Navigazione mobile" className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsMenuOpen(false)}
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
              <Phone className="size-4" /> Chiama {PHONE_NUMBER}
            </a>
          </nav>
        </div>
      )}
    </NavigationMenu>
  );
};
