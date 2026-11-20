import React from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

/* =========================================================
   Vijay Chaurasiya
   REACT QUERY CLIENT CONFIGURATION
   Allahabad High Court eFiling App
========================================================= */

// Centralized Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

/* =========================================================
   Vijay Chaurasiya — QUERY PROVIDER
========================================================= */

type QueryProviderProps = {
  children: React.ReactNode;
};

const QueryProvider: React.FC<QueryProviderProps> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;