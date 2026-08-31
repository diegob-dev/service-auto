import { apiClient } from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import database from "../../../db.json";
import { getPublishedCars } from "./api";
import type { LegacyCar } from "./types";

const hasRemoteApi = Boolean(import.meta.env.VITE_API_URL);

export const useGetCarsList = () => {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      if (!hasRemoteApi) return database.cars satisfies LegacyCar[];

      const res = await apiClient.get<LegacyCar[]>("cars");
      return res.data;
    },
  });
};

export function usePublishedCars() {
  return useQuery({
    queryKey: ["cars", "published"],
    queryFn: getPublishedCars,
    staleTime: 5 * 60 * 1000,
  });
}
