"use client";

import { useState, type ReactNode } from "react";
import { Footer } from "@/components/landing/footer";
import { PrimaryHeader } from "@/components/landing/primary-header";
import "./auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-100">
      <PrimaryHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onSearchSubmit={setSearchTerm}
        searchSuggestions={[]}
      />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4">
        <div className="mt-10 pb-12 md:mt-12">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
