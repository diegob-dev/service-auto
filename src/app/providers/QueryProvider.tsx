import { hydrate, QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const prerenderState = typeof document === "undefined" ? null : document.getElementById("prerender-state");
if (prerenderState?.textContent && document.getElementById("root")?.dataset.pathname === window.location.pathname) {
  hydrate(queryClient, JSON.parse(prerenderState.textContent));
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
