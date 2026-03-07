"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  sender_type: "customer" | "artist";
  message: string;
  created_at: string;
}

interface BookingMessagesProps {
  bookingId: string;
  role: "customer" | "artist";
  /** Authenticated fetch function (for artist auth headers) */
  fetchFn?: (url: string, init?: RequestInit) => Promise<Response>;
}

function timeLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "剛剛";
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} 小時前`;

  return d.toLocaleDateString("zh-TW", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function BookingMessages({ bookingId, role, fetchFn }: BookingMessagesProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdsRef = useRef(new Set<string>());

  const doFetch = useCallback(
    (url: string, init?: RequestInit) => (fetchFn ? fetchFn(url, init) : fetch(url, init)),
    [fetchFn]
  );

  const loadMessages = useCallback(async () => {
    try {
      const res = await doFetch(`/api/bookings/${bookingId}/messages`);
      if (res.ok) {
        const data: Message[] = await res.json();
        setMessages(data);
        messageIdsRef.current = new Set(data.map((m) => m.id));
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [bookingId, doFetch]);

  // Initial load
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Supabase Realtime subscription — listen for new inserts on this booking
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`booking-messages:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "booking_messages",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Deduplicate — avoid showing a message we already added optimistically
          if (!messageIdsRef.current.has(newMsg.id)) {
            messageIdsRef.current.add(newMsg.id);
            setMessages((prev) => [...prev, newMsg]);
          }
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    setError(null);

    try {
      const res = await doFetch(`/api/bookings/${bookingId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });

      if (res.ok) {
        const data: Message = await res.json();
        // Add immediately (Realtime will deduplicate via messageIdsRef)
        messageIdsRef.current.add(data.id);
        setMessages((prev) => [...prev, data]);
        setNewMessage("");
      } else {
        const errData = await res.json().catch(() => null);
        setError(errData?.error || "傳送失敗");
      }
    } catch (err) {
      console.error("Send message error:", err);
      setError("網路錯誤，請稍後再試");
    } finally {
      setSending(false);
    }
  };

  const isMine = (msg: Message) => msg.sender_type === role;

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-gray-700">留言討論</h2>
            {realtimeConnected && (
              <span className="inline-block h-2 w-2 rounded-full bg-green-400" title="即時連線中" />
            )}
          </div>
          <button
            onClick={loadMessages}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            重新整理
          </button>
        </div>

        {/* Message List */}
        <div className="mb-3 max-h-72 space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-3">
          {loading ? (
            <p className="py-4 text-center text-sm text-gray-400">載入中...</p>
          ) : messages.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-400">
              尚無留言，開始對話吧
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${isMine(msg) ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 ${
                    isMine(msg)
                      ? "rounded-br-md bg-[var(--brand)] text-white"
                      : "rounded-bl-md bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      isMine(msg) ? "text-white/70" : "text-gray-400"
                    }`}
                  >
                    {isMine(msg) ? "你" : msg.sender_type === "customer" ? "客戶" : "設計師"} · {timeLabel(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="輸入留言..."
            rows={2}
            maxLength={500}
            className="flex-1 resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
            className="self-end bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
            size="sm"
          >
            {sending ? "..." : "送出"}
          </Button>
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        <p className="mt-1 text-[10px] text-gray-400">即時通訊 · 按 Enter 送出，Shift+Enter 換行</p>
      </CardContent>
    </Card>
  );
}
