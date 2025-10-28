"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ProfileProvider } from "@/lib/contexts/profile-context";

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5,
                retry: 1,
            },
        },
    }));

    return (
        <>
            <NextTopLoader showSpinner={false} />
            <ThemeProvider
                attribute='class'
                defaultTheme='system'
                enableSystem
                disableTransitionOnChange
                enableColorScheme
            >
                <QueryClientProvider client={queryClient}>
                    <ProfileProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            closeButton
                            offset={{
                                top: "55px",
                                right: "65px",
                            }}
                        />
                        <ReactQueryDevtools initialIsOpen={false} />
                    </ProfileProvider>
                </QueryClientProvider>
            </ThemeProvider>
        </>
    );
}
