import { Link, useLocation } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../../../components/ui/navigation-menu";
import { Button } from "../../../components/ui/button";
import { Logo } from "./Logo";
import { Phone } from "lucide-react";
import { ContainerLarge } from "../Container";

export const Navbar = () => {
  const location = useLocation();

  const links = [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Officina",
      href: "/officina",
    },
    {
      label: "Servizi",
      href: "/servizi",
    },
    {
      label: "Auto usate",
      href: "/auto-usate",
    },
    {
      label: "Chi siamo",
      href: "/chi-siamo",
    },
    {
      label: "Contatti",
      href: "/contatti",
    },
  ];

  return (
    <NavigationMenu className="sticky top-0 z-50">
      <ContainerLarge className="flex items-center justify-between gap-4">
        <Logo />
        <NavigationMenuList>
          {links.map((link) => (
            <NavigationMenuItem key={link.href}>
              <NavigationMenuLink
                className={navigationMenuTriggerStyle({
                  active: link.href === location.pathname,
                })}
                render={<Link to={link.href}>{link.label}</Link>}
              />
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <div className="flex items-center justify-end gap-2 text-background uppercase font-bold">
          <Button variant="default" size="lg">
            <Phone className="mr-1" />
            Contattaci
          </Button>
        </div>
      </ContainerLarge>
    </NavigationMenu>
  );
};
