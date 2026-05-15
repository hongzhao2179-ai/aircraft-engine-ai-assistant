import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getFiles, uploadFile, deleteFile } from "../../api/admin";
import { FileText, Trash2, Upload, Loader2 } from "lucide-react";

export default function FilesPage() {
  const { getAccessToken } = useAuth();
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const token = getAccessToken();

  const loadFiles = async () => {
    if (!token) return;
    try {
      const data = await getFiles(token);
      setFiles(data.files);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [getAccessToken]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setError(null);
    try {
      const result = await uploadFile(token, file);
      alert(`文件 ${result.file} 上传成功，提取了 ${result.triplets_extracted} 个三元组`);
      loadFiles();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = async (filename: string) => {
    if (!token) return;
    if (!window.confirm(`确定删除 ${filename}？`)) return;
    try {
      await deleteFile(token, filename);
      setFiles((prev) => prev.filter((f) => f !== filename));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  const supportedTypes = ".txt,.md,.csv,.pdf,.docx";

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">文件管理</h1>

      {/* Upload area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
      >
        <Upload className="mx-auto text-gray-400 mb-2" size={28} />
        <p className="text-sm text-gray-500 mb-1">点击上传维修文档</p>
        <p className="text-xs text-gray-400">
          支持 {supportedTypes} 格式
        </p>
        <input
          ref={fileRef}
          type="file"
          accept={supportedTypes}
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>

      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 mb-4">
          <Loader2 className="animate-spin" size={16} />
          正在解析并提取知识图谱...
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* File list */}
      {loading ? (
        <div className="text-sm text-gray-400">加载中...</div>
      ) : files.length === 0 ? (
        <div className="text-sm text-gray-400">暂无已上传文件</div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {files.map((f) => (
            <div
              key={f}
              className="flex items-center justify-between px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-gray-400" size={18} />
                <span className="text-sm text-gray-700">{f}</span>
              </div>
              <button
                onClick={() => handleDelete(f)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                title="删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
