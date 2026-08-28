"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthService } from "@/src/lib/auth";
import AdminDashboard from "./AdminDashboard";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await AuthService.isAuthenticated();

      if (!authenticated) {
        router.push("/admin/login");
      } else {
        setIsAuthenticated(true);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleLogout = async () => {
    await AuthService.logout();
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-300">در حال بررسی دسترسی...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // یا می‌توانید یک spinner نشان دهید
  }

  return <AdminDashboard onLogout={handleLogout} />;
}