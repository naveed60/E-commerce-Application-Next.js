import { ReactNode } from "react";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export const metadata = {
  title: "NextShop Admin",
};

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const adminTheme = cookieStore.get("nextshop-admin-theme")?.value === "dark" ? "dark" : "light";
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AdminShell
      user={{
        name: session.user?.name ?? null,
        email: session.user?.email ?? null,
        role: session.user?.role ?? "ADMIN",
      }}
      initialTheme={adminTheme}
    >
      {children}
    </AdminShell>
  );
}
