import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileUp,
  Network,
  MessageSquare,
  LogOut,
  Shield,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const navItems = [
  { to: "/admin", label: "仪表盘", icon: LayoutDashboard, end: true },
  { to: "/admin/files", label: "文件管理", icon: FileUp, end: false },
  { to: "/admin/knowledge", label: "知识图谱", icon: Network, end: false },
];

export default function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-600" size={20} />
          <span className="font-semibold text-gray-800">AeroMaint Admin</span>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-gray-500">{user.email}</span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            退出
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            <div className="border-t border-gray-200 my-2" />
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <MessageSquare size={18} />
              返回聊天
            </NavLink>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
