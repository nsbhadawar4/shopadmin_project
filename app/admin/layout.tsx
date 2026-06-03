import AuthGuard from "./components/AuthGuard";
import AdminNav from "./components/AdminNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AdminNav />
      {children}
    </AuthGuard>
  );
}
