import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getFiles } from "../../api/admin";
import { FileText, Database, FileUp } from "lucide-react";

export default function Dashboard() {
  const { getAccessToken } = useAuth();
  const [fileCount, setFileCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;
    getFiles(token)
      .then((data) => setFileCount(data.files.length))
      .catch(() => setFileCount(null))
      .finally(() => setLoading(false));
  }, [getAccessToken]);

  const cards = [
    {
      label: "已上传文件",
      value: loading ? "..." : fileCount ?? "N/A",
      icon: FileUp,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "图谱实体数",
      value: "165",
      icon: Database,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "维修文档",
      value: fileCount ?? 0,
      icon: FileText,
      color: "text-green-600 bg-green-100",
    },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">管理仪表盘</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-lg shadow-sm p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${c.color}`}>
              <c.icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{c.value}</div>
              <div className="text-sm text-gray-500">{c.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
