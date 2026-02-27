import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/sonner";
import { ChatProvider } from "@/lib/chat-context";
import { ResponsiveLayout } from "@/components/responsive-layout";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Analisador de Relatórios Acadêmicos",
  description:
    "Análise de relatórios acadêmicos com inteligência artificial - Feedback detalhado, configurações únicas e suporte para PDF, DOCX e TXT\nFeito por: Grupo d' luxo de PT 12.ª, turma A1, 2026, ITEL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ChatProvider>
          <ResponsiveLayout>{children}</ResponsiveLayout>
          <Toaster />
        </ChatProvider>
        <Analytics />
      </body>
    </html>
  );
}
