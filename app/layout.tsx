import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // This loads your Tailwind CSS across the whole app

// Load a clean, modern font
const inter = Inter({ subsets: ["latin"] });

// This metadata tells Google and social media exactly what your app is
export const metadata: Metadata = {
  title: "Logos Bible Quiz Platform",
  description: "Interactive Malayalam Bible study platform. Test your knowledge chapter by chapter with smart Manglish typing.",
  keywords: [
    "Bible Quiz", 
    "Malayalam Bible Quiz", 
    "Logos Quiz", 
    "Scripture", 
    "Christian study", 
    "Sunday School Kerala"
  ],
  authors: [{ name: "Admin" }],
  openGraph: {
    title: "Logos Bible Quiz Platform",
    description: "Interactive Malayalam Bible study platform.",
    type: "website",
    locale: "ml_IN",
    siteName: "Logos Quiz Builder",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // We set the language to Malayalam (ml) and suppress hydration warnings to prevent extension crashes
    <html lang="ml" suppressHydrationWarning>
      <body className={inter.className}>
        {/* All your pages (Home, Quiz, Admin) will render inside this children prop */}
        {children}
      </body>
    </html>
  );
}