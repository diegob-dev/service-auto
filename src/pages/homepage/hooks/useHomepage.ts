import { useGetCarsList } from "./useGetCarsList";

export const useHomepage = () => {
  const { data: cars, isLoading, isError } = useGetCarsList();

  return {
    cars,
    isLoading,
    isError,
  };
};
