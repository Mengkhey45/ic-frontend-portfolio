'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // How long data is considered "fresh" before it's refetched in background
            staleTime: 5 * 60 * 1000, // 5 minutes
            // How long data stays in memory after no component is using it
            gcTime: 30 * 60 * 1000, // 30 minutes
            // Keep previous data when fetching new data
            placeholderData: (previousData: any) => previousData,
            // Re-fetch when window is refocused
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
