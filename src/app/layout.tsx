import type { Metadata } from "next";
import { Archivo_Black, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";

const archivoBlack = Archivo_Black({ 
  weight: "400", 
  subsets: ["latin"], 
  variable: "--font-archivo-black" 
});

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["500", "600", "700", "800"],
  variable: "--font-plus-jakarta-sans" 
});

export const metadata: Metadata = {
  title: "HuddleCard Outreach Engine",
  description: "Specialized Lead Management for HuddleCard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.variable} ${archivoBlack.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-7xl px-8 py-8">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

