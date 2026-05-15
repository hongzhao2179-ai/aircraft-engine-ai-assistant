import { useState } from "react";
import { Search, Network } from "lucide-react";
import { getGraphData } from "../../api/graph";

interface GraphNode {
  node: string;
  relation: string;
  confidence?: string;
}

export default function KnowledgePage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GraphNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await getGraphData(query.trim());
      setResults(resp.data?.records ?? resp.data ?? []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "查询失败");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">知识图谱查询</h1>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="输入实体名称查询（如：风扇叶片）"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          查询
        </button>
      </form>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="text-sm text-gray-400">查询中...</div>
      ) : results.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-100">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Network className="text-purple-400 shrink-0" size={18} />
              <div className="text-sm">
                <span className="font-medium text-gray-800">{r.node}</span>
                <span className="text-gray-400 mx-2">--[{r.relation}]--&gt;</span>
                <span className="text-gray-600">{r.confidence ?? ""}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Network size={48} className="mb-3" />
            <p className="text-sm">输入实体名称查询知识图谱</p>
          </div>
        )
      )}
    </div>
  );
}
