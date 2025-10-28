import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
  display: "swap",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "AISAM Admin Dashboard",
  description: "Admin dashboard for AISAM Social Media Management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${leagueSpartan.className} ${leagueSpartan.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
