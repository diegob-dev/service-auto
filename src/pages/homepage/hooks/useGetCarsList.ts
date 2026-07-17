import { apiClient } from "@/utils/apiClient";
import { useQuery } from "@tanstack/react-query";
import type { Car } from "../types";

export const useGetCarsList = () => {
  return useQuery({
    queryKey: ["cars"],
    queryFn: async () => {
      const res = await apiClient.get<Car[]>("cars");
      return res.data;
    },
  });
};
