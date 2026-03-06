"use client"

import { useRef, useState, useCallback, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Loader2 } from "lucide-react"

interface ReelItem {
  id: string
  type: "p" | "reel"
  username: string
}

interface PostMeta {
  author_name: string
  title: string
  thumbnail_url: string
}

// Instagram 貼文 / Reels — 合作網紅 & 設計師投稿
const REELS: ReelItem[] = [
  { id: "DUM7TcKEdi9", type: "p", username: "kai_chi77" },
  { id: "DUA5dcvkXPd", type: "p", username: "kai_chi77" },
  { id: "DT-SPnrEZxO", type: "p", username: "kai_chi77" },
  { id: "DTp2W-EEUlq", type: "p", username: "kai_chi77" },
  { id: "DTj2E06EboD", type: "p", username: "kai_chi77" },
  { id: "DTU43BSCXCw", type: "p", username: "kai_chi77" },
  { id: "DTaIQpsk88v", type: "p", username: "kai_chi77" },
  { id: "DTK79yok13-", type: "p", username: "kai_chi77" },
  { id: "DTM3jowCUph", type: "p", username: "kai_chi77" },
  { id: "DTdKK3dAURf", type: "p", username: "kai_chi77" },
]

const IG_ICON_PATH =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"

export default function InstagramReelsCarousel() {
  const [selectedReel, setSelectedReel] = useState<ReelItem | null>(null)
  const [postMeta, setPostMeta] = useState<PostMeta | null>(null)
  const [metaLoading, setMetaLoading] = useState(false)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const scrollRef = useRef<HTMLDivElement>(null)
  const metaCache = useRef<Record<string, PostMeta>>({})

  const isDragging = useRef(false)
  const dragStartX = useRef(0)
  const dragScrollLeft = useRef(0)
  const hasDragged = useRef(false)

  // Preload all thumbnails
  useEffect(() => {
    const fetchAll = async () => {
      const entries = await Promise.all(
        REELS.map(async (reel) => {
          try {
            const res = await fetch(`/api/instagram-meta?id=${reel.id}&type=${reel.type}`)
            const data = await res.json()
            if (!data.error && data.thumbnail_url) {
              metaCache.current[reel.id] = data
              return [reel.id, data.thumbnail_url] as const
            }
          } catch { /* ignore */ }
          return [reel.id, ""] as const
        })
      )
      setThumbnails(Object.fromEntries(entries.filter(([, url]) => url)))
    }
    fetchAll()
  }, [])

  // Fetch post meta when selected
  useEffect(() => {
    if (!selectedReel) {
      setPostMeta(null)
      return
    }

    const cached = metaCache.current[selectedReel.id]
    if (cached) {
      setPostMeta(cached)
      return
    }

    setMetaLoading(true)
    setPostMeta(null)

    fetch(`/api/instagram-meta?id=${selectedReel.id}&type=${selectedReel.type}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          metaCache.current[selectedReel.id] = data
          setPostMeta(data)
        }
      })
      .catch(() => {})
      .finally(() => setMetaLoading(false))
  }, [selectedReel])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -220 : 220,
      behavior: "smooth",
    })
  }

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    hasDragged.current = false
    dragStartX.current = e.pageX
    dragScrollLeft.current = scrollRef.current?.scrollLeft ?? 0
  }, [])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return
    e.preventDefault()
    const dx = e.pageX - dragStartX.current
    if (Math.abs(dx) > 5) hasDragged.current = true
    if (scrollRef.current) scrollRef.current.scrollLeft = dragScrollLeft.current - dx
  }, [])

  const onMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  const onCardClick = useCallback((reel: ReelItem) => {
    if (!hasDragged.current) setSelectedReel(reel)
  }, [])

  if (REELS.length === 0) return null

  return (
    <>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="mb-4 overflow-hidden">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Play className="h-5 w-5 text-[var(--brand)]" />
          美甲美睫精選影片
        </h2>

        <div className="group/carousel relative">
          {/* Left arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 shadow-md opacity-0 backdrop-blur-sm transition-opacity group-hover/carousel:opacity-100"
            onClick={() => scroll("left")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Scrollable container */}
          <div
            ref={scrollRef}
            className="hide-scrollbar flex cursor-grab gap-2 overflow-x-auto pb-3 select-none active:cursor-grabbing sm:gap-4"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {REELS.map((reel) => (
              <div
                key={reel.id}
                className="group relative h-[50vw] w-[28vw] flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-black sm:h-[355px] sm:w-[200px]"
                onClick={() => onCardClick(reel)}
              >
                {thumbnails[reel.id] ? (
                  <img
                    src={thumbnails[reel.id]}
                    alt=""
                    className="h-full w-full object-cover"
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const img = e.currentTarget
                      const proxyUrl = `/api/instagram-thumb?url=${encodeURIComponent(thumbnails[reel.id])}`
                      if (!img.src.includes("/api/instagram-thumb")) {
                        img.src = proxyUrl
                      }
                    }}
                  />
                ) : (
                  <div className="h-full w-full animate-pulse bg-gray-800" />
                )}

                {/* Play button */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-lg backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-0 sm:h-12 sm:w-12">
                    <Play className="ml-0.5 h-5 w-5 fill-gray-800 text-gray-800 sm:h-6 sm:w-6" />
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 transition-all duration-300 group-hover:bg-black/30 group-hover:backdrop-blur-[2px]">
                  <svg
                    className="h-8 w-8 text-white opacity-0 drop-shadow-lg transition-opacity duration-300 group-hover:opacity-100"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d={IG_ICON_PATH} />
                  </svg>
                  <span className="text-sm font-semibold text-white opacity-0 drop-shadow-lg transition-opacity duration-300 group-hover:opacity-100">
                    @{reel.username}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Right arrow */}
          <Button
            variant="outline"
            size="icon"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 shadow-md opacity-0 backdrop-blur-sm transition-opacity group-hover/carousel:opacity-100"
            onClick={() => scroll("right")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Dialog — mobile: top video / bottom text, desktop: left video / right text */}
        <Dialog open={!!selectedReel} onOpenChange={() => setSelectedReel(null)}>
          <DialogContent className="max-h-[80vh] max-w-[950px] overflow-hidden p-0 md:max-h-[85vh]">
            <DialogTitle className="sr-only">Instagram Post</DialogTitle>
            {selectedReel && (
              <div className="flex h-[70vh] flex-col md:h-[80vh] md:flex-row">
                {/* Video embed */}
                <div className="h-[35vh] min-w-0 shrink-0 bg-black md:h-auto md:flex-1">
                  <iframe
                    src={`https://www.instagram.com/${selectedReel.type}/${selectedReel.id}/embed/`}
                    width="100%"
                    height="100%"
                    className="border-0"
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  />
                </div>

                {/* Caption panel */}
                <div className="flex flex-1 flex-col overflow-hidden bg-white md:w-95 md:flex-none md:border-l">
                  {/* Account header */}
                  <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2">
                    <svg
                      className="h-5 w-5 text-pink-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d={IG_ICON_PATH} />
                    </svg>
                    <a
                      href={`https://www.instagram.com/${selectedReel.username}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-gray-900 hover:underline"
                    >
                      @{selectedReel.username}
                    </a>
                  </div>

                  {/* Caption */}
                  <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-3">
                    {metaLoading ? (
                      <div className="flex h-20 items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : postMeta?.title ? (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-gray-800">
                        {postMeta.title}
                      </p>
                    ) : (
                      <p className="py-4 text-center text-sm text-gray-400">
                        無法載入貼文內文
                      </p>
                    )}
                  </div>

                  {/* Footer link */}
                  <div className="shrink-0 border-t px-4 py-2 text-center">
                    <a
                      href={`https://www.instagram.com/${selectedReel.type}/${selectedReel.id}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-500 hover:text-blue-600"
                    >
                      到 Instagram 查看完整貼文 →
                    </a>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
