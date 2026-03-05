"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
  return `${d.getMonth() + 1}/${d.getDate()} (${weekdays[d.getDay()]})`;
}

function formatTime(timeStr: string) {
  return timeStr.slice(0, 5);
}

export default function AvailabilityPage() {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newStart, setNewStart] = useState("10:00");
  const [newEnd, setNewEnd] = useState("18:00");

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await authFetch(`/api/availability?from=${today}`);
      if (res.ok) {
        setSlots(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch slots:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newDate || !newStart || !newEnd) return;
    if (newStart >= newEnd) {
      alert("結束時間必須晚於開始時間");
      return;
    }
    setAdding(true);

    try {
      const res = await authFetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          start_time: newStart,
          end_time: newEnd,
        }),
      });

      if (res.ok) {
        const slot = await res.json();
        setSlots([...slots, slot].sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)));
        setShowForm(false);
        setNewDate("");
        setNewStart("10:00");
        setNewEnd("18:00");
      } else {
        alert("新增失敗");
      }
    } catch (e) {
      console.error("Add slot error:", e);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await authFetch(`/api/availability?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSlots(slots.filter((s) => s.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || "刪除失敗");
      }
    } catch (e) {
      console.error("Delete error:", e);
    } finally {
      setDeleting(null);
    }
  };

  // Quick add: add a whole week of slots
  const handleQuickAdd = async () => {
    setAdding(true);
    try {
      const today = new Date();
      const promises = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        // Skip if slot already exists for this date
        if (slots.some((s) => s.date === dateStr)) continue;
        promises.push(
          authFetch("/api/availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ date: dateStr, start_time: "10:00", end_time: "18:00" }),
          }).then((r) => (r.ok ? r.json() : null))
        );
      }
      const results = (await Promise.all(promises)).filter(Boolean);
      if (results.length > 0) {
        setSlots(
          [...slots, ...results].sort(
            (a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time)
          )
        );
      }
    } catch (e) {
      console.error("Quick add error:", e);
    } finally {
      setAdding(false);
    }
  };

  // Group slots by date
  const grouped = slots.reduce<Record<string, Slot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {});

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
          <h1 className="text-lg font-semibold text-[var(--brand)]">時段管理</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        <div className="flex gap-2">
          <Button size="sm" className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" /> 新增時段
          </Button>
          <Button size="sm" variant="outline" onClick={handleQuickAdd} disabled={adding}>
            <Clock className="mr-1 h-4 w-4" /> 快速新增 7 天
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <Card>
            <CardContent className="space-y-4 p-4">
              <h3 className="font-semibold">新增可預約時段</h3>
              <div>
                <Label>日期 *</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>開始時間</Label>
                  <Input type="time" value={newStart} onChange={(e) => setNewStart(e.target.value)} />
                </div>
                <div>
                  <Label>結束時間</Label>
                  <Input type="time" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  取消
                </Button>
                <Button
                  className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                  onClick={handleAdd}
                  disabled={adding || !newDate}
                >
                  {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  新增
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Slots List */}
        {Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-400">
              <p>還沒有設定可預約時段</p>
              <p className="mt-1 text-sm">新增時段後，客戶才能看到你的可預約時間</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([date, dateSlots]) => (
            <Card key={date}>
              <CardContent className="p-4">
                <h3 className="mb-3 font-semibold">{formatDate(date)}</h3>
                <div className="space-y-2">
                  {dateSlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">
                          {formatTime(slot.start_time)} — {formatTime(slot.end_time)}
                        </span>
                        {slot.is_booked && (
                          <Badge className="bg-green-100 text-green-800">已預約</Badge>
                        )}
                      </div>
                      {!slot.is_booked && (
                        <button
                          onClick={() => handleDelete(slot.id)}
                          disabled={deleting === slot.id}
                          className="text-gray-400 hover:text-red-500"
                        >
                          {deleting === slot.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </main>
    </div>
  );
}
