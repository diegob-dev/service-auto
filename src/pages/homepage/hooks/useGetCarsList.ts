import { apiClient } from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { Car } from "../types";
import database from "../../../../db.json";

const hasRemoteApi = Boolean(import.meta.env.VITE_API_URL);

export const useGetCarsList = () => {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      if (!hasRemoteApi) return database.cars satisfies Car[];

      const res = await apiClient.get<Car[]>("cars");
      return res.data;
    },
  });
};
