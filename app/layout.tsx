import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Loader from "./components/Loader";
import { CartProvider } from "./context/CartContext";
import CartDrawer from "./components/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vamsicrackers.in'),
  title: "Vamsi Crackers | Premium Sivakasi Fireworks Online",
  description: "Buy premium quality Sivakasi crackers online at wholesale prices. Safe, reliable, and authentic fireworks delivered across India from Vamsi Crackers.",
  keywords: "Sivakasi crackers, buy fireworks online, wholesale crackers, Diwali fireworks, Vamsi crackers, safe firecrackers online, Sivakasi fireworks delivery, online crackers shopping",
  authors: [{ name: "Vamsi Crackers", url: "https://vamsicrackers.in" }],
  creator: "Vamsi Crackers",
  publisher: "Vamsi Crackers",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://vamsicrackers.in",
    title: "Vamsi Crackers | Premium Sivakasi Fireworks Online",
    description: "Buy premium quality Sivakasi crackers online at wholesale prices. Safe, reliable, and authentic fireworks delivered across India.",
    siteName: "Vamsi Crackers",
    images: [
      {
        url: "/assets/images/vamsi_crackers_logo_v2.png",
        width: 1200,
        height: 630,
        alt: "Vamsi Crackers - Premium Sivakasi Fireworks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vamsi Crackers | Premium Sivakasi Fireworks",
    description: "Buy premium quality Sivakasi crackers online at wholesale prices. Authentic fireworks delivered across India.",
    images: ["/assets/images/vamsi_crackers_logo_v2.png"],
  },
  icons: {
    icon: "/assets/images/vamsi_crackers_logo_v2.png", // favicon
    apple: "/assets/images/vamsi_crackers_logo_v2.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        {/* Loading animation */}
        <Loader />

        {/* Main Application */}
        <CartProvider>
          <CartDrawer />
          {children}
        </CartProvider>
        
        {/* Local Business Schema for Google SEO & Google Business Profile */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "Vamsi Crackers",
              "image": "https://vamsicrackers.in/assets/images/vamsi_crackers_logo_v2.png",
              "@id": "https://vamsicrackers.in",
              "url": "https://vamsicrackers.in",
              "telephone": "+919080019031",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "D.NO. 177/5/18, Pernaickenpatti, Sithurajapuram",
                "addressLocality": "Virudhunagar",
                "addressRegion": "TN",
                "postalCode": "626189",
                "addressCountry": "IN"
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "09:00",
                "closes": "22:00"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
