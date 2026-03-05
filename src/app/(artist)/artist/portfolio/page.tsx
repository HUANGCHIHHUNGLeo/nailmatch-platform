"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { STYLES } from "@/lib/utils/constants";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

interface PortfolioWork {
  id: string;
  image_url: string;
  title: string | null;
  style: string | null;
  price_hint: number | null;
  sort_order: number;
  source: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [works, setWorks] = useState<PortfolioWork[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // New work form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newStyle, setNewStyle] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      const res = await authFetch("/api/portfolio");
      if (res.ok) {
        setWorks(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch portfolio:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);

    try {
      // 1. Upload image
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("bucket", "portfolio-images");

      const uploadRes = await authFetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) {
        alert("圖片上傳失敗");
        return;
      }
      const { url } = await uploadRes.json();

      // 2. Create portfolio work
      const createRes = await authFetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url: url,
          title: newTitle || null,
          style: newStyle || null,
          price_hint: newPrice ? Number(newPrice) : null,
        }),
      });

      if (createRes.ok) {
        const newWork = await createRes.json();
        setWorks([...works, newWork]);
        resetForm();
      } else {
        alert("新增作品失敗");
      }
    } catch (e) {
      console.error("Upload error:", e);
      alert("發生錯誤");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個作品嗎？")) return;
    setDeleting(id);

    try {
      const res = await authFetch(`/api/portfolio?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setWorks(works.filter((w) => w.id !== id));
      } else {
        alert("刪除失敗");
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setNewTitle("");
    setNewStyle("");
    setNewPrice("");
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-[var(--brand)]">管理作品集</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">共 {works.length} 件作品</p>
          <Button size="sm" className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> 新增作品
          </Button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <Card>
            <CardContent className="space-y-4 p-4">
              <h3 className="font-semibold">新增作品</h3>

              <div>
                <Label>照片 *</Label>
                <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileSelect} />
                {preview && (
                  <div className="relative mt-2 inline-block">
                    <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                      <Image src={preview} alt="Preview" fill className="object-cover" />
                    </div>
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                      onClick={() => {
                        URL.revokeObjectURL(preview);
                        setPreview(null);
                        setSelectedFile(null);
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <Label>標題</Label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例：日式暈染凝膠"
                />
              </div>

              <div>
                <Label>風格</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {STYLES.map((s) => (
                    <Badge
                      key={s}
                      variant={newStyle === s ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setNewStyle(newStyle === s ? "" : s)}
                    >
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>參考價格 (NT$)</Label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="選填"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={resetForm}>
                  取消
                </Button>
                <Button
                  className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 上傳中...
                    </>
                  ) : (
                    "上傳"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Works Grid */}
        {works.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-400">
              <p>還沒有作品</p>
              <p className="mt-1 text-sm">上傳你的美甲作品，讓客戶看到你的實力</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {works.map((work) => (
              <Card key={work.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image
                    src={work.image_url}
                    alt={work.title || "作品"}
                    fill
                    className="object-cover"
                  />
                  <button
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                    onClick={() => handleDelete(work.id)}
                    disabled={deleting === work.id}
                  >
                    {deleting === work.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <CardContent className="p-3">
                  {work.title && <p className="text-sm font-medium">{work.title}</p>}
                  <div className="mt-1 flex items-center justify-between">
                    {work.style && (
                      <Badge variant="secondary" className="text-xs">
                        {work.style}
                      </Badge>
                    )}
                    {work.price_hint && (
                      <span className="text-xs text-[var(--brand)]">NT${work.price_hint.toLocaleString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
