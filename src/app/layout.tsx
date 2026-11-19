import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import "../styles.css";

export const metadata: Metadata = {
  title: "JAY — Premium Automotive Marketplace",
  description:
    "Explore the JAY collection, compare vehicle details, and connect with a specialist.",
  openGraph: {
    title: "JAY — Premium Automotive Marketplace",
    description: "Browse the latest JAY vehicles and discover your next drive.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,400;6..96,500&family=Bebas+Neue&family=Barlow:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
