import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamento da finestra modale: porta il focus nel contenitore, lo tiene
 * all'interno con Tab, chiama onEscape con il tasto Esc e alla chiusura
 * restituisce il focus all'elemento che l'aveva aperta.
 * Il contenitore deve avere tabIndex={-1}.
 */
export function useDialog<T extends HTMLElement>(onEscape: () => void, active = true) {
  const ref = useRef<T>(null);
  const onEscapeRef = useRef(onEscape);

  useEffect(() => {
    onEscapeRef.current = onEscape;
  }, [onEscape]);

  useEffect(() => {
    const container = ref.current;
    if (!active || !container) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    container.focus();

    const focusableElements = () =>
      [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((element) => !element.closest("[hidden]"));

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const elements = focusableElements();
      if (!elements.length) {
        event.preventDefault();
        return;
      }
      const first = elements[0];
      const last = elements[elements.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === container)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [active]);

  return ref;
}
