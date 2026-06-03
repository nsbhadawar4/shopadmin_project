"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (pathname === "/admin/login") {
      if (token) {
        router.replace("/admin/product");
      } else {
        setAuthorized(true);
      }
      return;
    }

    if (!token) {
      router.replace("/admin/login");
    } else {
      setAuthorized(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!authorized) {
    return (
      <div className="flex-1 flex items-center justify-center py-24">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
