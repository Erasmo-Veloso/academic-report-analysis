"use client";

import { useChat } from "@/lib/chat-context";
import { ChatSidebar } from "./chat-sidebar";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const { mobileMenuOpen, setMobileMenuOpen } = useChat();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <ChatSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex flex-col flex-1 min-w-0">{children}</div>
    </div>
  );
}
