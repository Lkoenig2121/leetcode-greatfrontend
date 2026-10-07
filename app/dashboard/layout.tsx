import { AuthProvider } from "@/components/AuthProvider";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <AuthProvider requireAuth>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </AuthProvider>
  );
}
