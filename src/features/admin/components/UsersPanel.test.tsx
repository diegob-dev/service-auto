import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminUser } from "../types";
import { UsersPanel } from "./UsersPanel";
import * as adminApi from "../api";

vi.mock("../api", () => ({
  saveUser: vi.fn(),
  deleteUser: vi.fn(),
}));

const users: AdminUser[] = [
  {
    id: "other-user",
    email: "anna",
    role: "seller",
    active: true,
    created_at: "2026-10-01",
    updated_at: "2026-10-01",
  },
  {
    id: "current-user",
    email: "zorro",
    role: "admin",
    active: true,
    created_at: "2026-10-01",
    updated_at: "2026-10-01",
  },
];

describe("UsersPanel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("mostra l'account corrente per primo anche se viene dopo alfabeticamente", () => {
    const { container } = render(
      <UsersPanel
        users={users}
        currentUserId="current-user"
        busy={false}
        onCreate={vi.fn()}
        onRefresh={vi.fn(async () => undefined)}
        onError={vi.fn()}
      />,
    );

    const displayedUsers = [...container.querySelectorAll("strong")].map((element) => element.textContent);
    expect(displayedUsers).toEqual(["zorro", "anna"]);
    const currentUserRow = container.querySelector("strong")?.parentElement?.parentElement;
    expect(currentUserRow).toHaveClass("border-primary/40", "bg-primary/8", "shadow-sm");
    expect(container).not.toHaveTextContent("Tu");
    expect(container).not.toHaveTextContent("Cambia password");
  });

  it("mostra un avanzamento mentre cambia il ruolo", async () => {
    vi.mocked(adminApi.saveUser).mockReturnValue(new Promise(() => undefined));
    render(
      <UsersPanel
        users={users}
        currentUserId="current-user"
        busy={false}
        onCreate={vi.fn()}
        onRefresh={vi.fn(async () => undefined)}
        onError={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: "Ruolo di anna" }), {
      target: { value: "admin" },
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Aggiornamento ruolo…");
    expect(screen.getByRole("combobox", { name: "Ruolo di anna" })).toBeDisabled();
  });
});
