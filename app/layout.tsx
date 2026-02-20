import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { StoreInitializer } from "@/components/providers/StoreInitializer";
import { AppLayout } from "@/components/layout/AppLayout";
import "./globals.css";

const fontOutfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dépense-Man",
  description: "Gérez vos finances mensuelles facilement",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Dépense-Man",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Dépense-Man",
    title: "Dépense-Man",
    description: "Gérez vos finances mensuelles facilement",
  },
  twitter: {
    card: "summary",
    title: "Dépense-Man",
    description: "Gérez vos finances mensuelles facilement",
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#0a0a0b",
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="D-Man" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#0a0a0b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="mask-icon" href="/web-app-manifest-192x192.png" color="#0a0a0b" />
      </head>
      <body className={`${fontOutfit.variable} antialiased`}>
        <StoreInitializer>
          <AppLayout>
            {children}
          </AppLayout>
        </StoreInitializer>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) {
                      // Vérifier les mises à jour toutes les 60s
                      setInterval(function() { reg.update(); }, 60000);

                      reg.addEventListener('updatefound', function() {
                        var newWorker = reg.installing;
                        if (!newWorker) return;
                        newWorker.addEventListener('statechange', function() {
                          if (newWorker.state === 'activated' && navigator.serviceWorker.controller) {
                            // Nouvelle version activée — reload automatique
                            window.location.reload();
                          }
                        });
                      });
                    })
                    .catch(function(err) {
                      console.log('SW registration failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
