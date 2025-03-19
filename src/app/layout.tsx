import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const IBM_PLEX = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex",
});

export const metadata: Metadata = {
  title: "Pixel Genie",
  description: "AI powered image generator with tools for background removal, image enhancement, object removal, generative fill, and object recoloring",
  keywords: ["AI image generator", "background removal", "image enhancement", "object removal", "generative fill", "object recoloring"],
  authors: [{ name: "Pixel Genie" }],
  creator: "Pixel Genie",
  publisher: "Pixel Genie",
  openGraph: {
    title: "Pixel Genie - AI Image Manipulation Tool",
    description: "Transform your images with AI-powered tools for background removal, enhancement, object removal, and more",
    images: [
      {
        url: "/assets/images/meta-image.png",
        width: 1200,
        height: 630,
        alt: "Pixel Genie Preview",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "Pixel Genie",
    url: "https://pixel-geniee.vercel.app/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixel Genie - AI Image Manipulation Tool",
    description: "Transform your images with AI-powered tools for background removal, enhancement, object removal, and more",
    images: ["/assets/images/meta-image.png"],
    creator: "@pixelgenie",
  },
  icons: {
    icon: ["/favicon.ico"],
  },
  metadataBase: new URL("https://pixel-geniee.vercel.app/"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      variables: {
        colorPrimary: "#624cf5",
      },
    }}>
      <html lang="en">
        <body className={cn(IBM_PLEX.variable, "font-ibm-plex antialiased")}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
