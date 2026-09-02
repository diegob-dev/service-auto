import { beforeEach, describe, expect, it, vi } from "vitest";

const query = {
  select: vi.fn(),
  eq: vi.fn(),
  order: vi.fn(),
  limit: vi.fn(),
  then: (resolve: (value: { data: never[]; error: null }) => unknown) =>
    Promise.resolve({ data: [] as never[], error: null }).then(resolve),
};

query.select.mockReturnValue(query);
query.eq.mockReturnValue(query);
query.order.mockReturnValue(query);
query.limit.mockReturnValue(query);

vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => query),
    storage: { from: vi.fn() },
  },
}));

import { getPublishedCars } from "./api";

describe("getPublishedCars", () => {
  beforeEach(() => vi.clearAllMocks());

  it("filtra e limita le auto in evidenza quando richiesto", async () => {
    await getPublishedCars({ featuredOnly: true, limit: 3 });

    expect(query.eq).toHaveBeenCalledWith("status", "published");
    expect(query.eq).toHaveBeenCalledWith("featured", true);
    expect(query.limit).toHaveBeenCalledWith(3);
  });
});
