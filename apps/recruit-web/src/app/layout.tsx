import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import { AuthProvider } from "../context/auth-context";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Orvexa Recruit | All-in-One Recruitment Software for HR & Staffing",
  description: "Reduce time to hire with Orvexa Recruit, an AI-powered ATS and recruitment CRM for Corporate HRs and Staffing Agencies. Source, track, and hire the right talent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#F8FAFC] dark:bg-[#0B1220] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Orvexa Recruit",
              "operatingSystem": "All",
              "applicationCategory": "BusinessApplication",
              "description": "Reduce time to hire with Orvexa Recruit, an AI-powered ATS and recruitment CRM for Corporate HRs and Staffing Agencies. Source, track, and hire the right talent.",
              "offers": {
                "@type": "Offer",
                "price": "99.00",
                "priceCurrency": "USD"
              }
            })
          }}
        />
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
