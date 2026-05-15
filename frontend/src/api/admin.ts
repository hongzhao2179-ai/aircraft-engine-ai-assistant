const BASE = `${import.meta.env.VITE_API_BASE_URL}/admin`;

function headers(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getFiles(token: string) {
  const resp = await fetch(`${BASE}/files`, { headers: headers(token) });
  if (!resp.ok) throw new Error(`获取文件列表失败: ${resp.status}`);
  return resp.json() as Promise<{ files: string[] }>;
}

export async function uploadFile(token: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const resp = await fetch(`${BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!resp.ok) throw new Error(`上传文件失败: ${resp.status}`);
  return resp.json() as Promise<{
    status: string;
    file: string;
    triplets_extracted: number;
  }>;
}

export async function deleteFile(token: string, filename: string) {
  const resp = await fetch(`${BASE}/files/${encodeURIComponent(filename)}`, {
    method: "DELETE",
    headers: headers(token),
  });
  if (!resp.ok) throw new Error(`删除文件失败: ${resp.status}`);
  return resp.json() as Promise<{ status: string; file: string }>;
}
