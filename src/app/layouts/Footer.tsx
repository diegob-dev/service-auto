import { NAV_LINKS, PHONE_NUMBER } from "@/lib/constants";
import { Clock3, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { Container } from "./Container";

export function Footer() {
  const phoneHref = `tel:${PHONE_NUMBER.replace(/\s/g, "")}`;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-foreground text-secondary-foreground">
      <Container size="large" className="py-12 md:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:gap-16">
          <div className="max-w-md">
            <Link
              to="/"
              aria-label="Service SRL - Home"
              className="font-display text-3xl uppercase tracking-wide text-background"
            >
              Service SRL
            </Link>
            <p className="mt-4 leading-relaxed text-secondary-foreground/70">
              Officina specializzata Volvo e auto usate selezionate, con
              competenza, trasparenza e attenzione per ogni cliente.
            </p>
          </div>

          <nav aria-label="Navigazione footer">
            <h2 className="font-display text-xl uppercase tracking-wide text-background">
              Esplora
            </h2>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-secondary-foreground/70 transition-colors hover:text-primary focus-visible:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="font-display text-xl uppercase tracking-wide text-background">
              Contatti
            </h2>
            <ul className="mt-4 space-y-4 text-secondary-foreground/70">
              <li>
                <a
                  href={phoneHref}
                  className="flex items-center gap-3 transition-colors hover:text-primary focus-visible:text-primary"
                >
                  <Phone
                    className="size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {PHONE_NUMBER}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <Link
                  to="/contatti"
                  className="transition-colors hover:text-primary focus-visible:text-primary"
                >
                  Indicazioni e contatti
                </Link>
              </li>
              <li className="flex items-start gap-3">
                <Clock3
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>Contattaci per conoscere gli orari</span>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      <div className="border-t border-secondary-foreground/10">
        <Container
          size="large"
          className="flex flex-col gap-2 py-5 text-sm text-secondary-foreground/50 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>© {currentYear} Service SRL. Tutti i diritti riservati.</p>
          <Link
            to="/contatti"
            className="transition-colors hover:text-secondary-foreground focus-visible:text-secondary-foreground"
          >
            Informazioni e assistenza
          </Link>
        </Container>
      </div>
    </footer>
  );
}
