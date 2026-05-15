import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import AdminLogin from "./AdminLogin";
import { AlertTriangle } from "lucide-react";
import type { User } from "@supabase/supabase-js";

function isAdmin(user: User): boolean {
  return user.app_metadata?.role === "admin";
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [loginKey, setLoginKey] = useState(0); // force re-mount login after error

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Not logged in — show admin login
  if (!user) {
    return <AdminLogin key={loginKey} onLogin={() => setLoginKey((k) => k + 1)} />;
  }

  // Logged in but not admin
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="text-red-500" size={24} />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">权限不足</h2>
          <p className="text-sm text-gray-500 mb-4">
            当前账号 <strong>{user.email}</strong> 没有管理员权限。
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            返回聊天
          </a>
        </div>
      </div>
    );
  }

  // Admin — show children
  return <>{children}</>;
}
