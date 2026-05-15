import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import ChatPage from "./pages/ChatPage";
import AdminLayout from "./components/Admin/AdminLayout";
import AdminGuard from "./components/Admin/AdminGuard";
import Dashboard from "./pages/admin/Dashboard";
import FilesPage from "./pages/admin/FilesPage";
import KnowledgePage from "./pages/admin/KnowledgePage";
import { AuthProvider } from "./contexts/AuthContext";
import "./App.css";

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ChatPage />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="files" element={<FilesPage />} />
              <Route path="knowledge" element={<KnowledgePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
