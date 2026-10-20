import { useQuery } from "@tanstack/react-query";
import { getPublishedCars } from "./api";

export function usePublishedCars() {
  return useQuery({
    queryKey: ["cars", "published"],
    queryFn: () => getPublishedCars(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedCars() {
  return useQuery({
    queryKey: ["cars", "published", "featured"],
    queryFn: () => getPublishedCars({ featuredOnly: true, limit: 3 }),
    staleTime: 5 * 60 * 1000,
  });
}
