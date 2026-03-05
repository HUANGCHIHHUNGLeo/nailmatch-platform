"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface QuoteCardProps {
  artist: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    studioAddress?: string;
    instagramHandle?: string;
    styles: string[];
  };
  quote: {
    id: string;
    quotedPrice: number;
    message?: string;
    availableTime: string;
  };
  portfolioImages: string[];
  onViewPortfolio: (artistId: string) => void;
  onBook: (quoteId: string) => void;
}

export function QuoteCard({
  artist,
  quote,
  portfolioImages,
  onViewPortfolio,
  onBook,
}: QuoteCardProps) {
  return (
    <Card className="overflow-hidden">
      {/* Portfolio Preview (horizontal scroll) */}
      {portfolioImages.length > 0 && (
        <div className="flex gap-1 overflow-x-auto p-1">
          {portfolioImages.slice(0, 4).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`${artist.displayName} 作品 ${i + 1}`}
              className="h-32 w-32 flex-shrink-0 rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      <CardContent className="p-4">
        {/* Artist Info */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={artist.avatarUrl} />
              <AvatarFallback className="bg-[var(--brand-light)] text-[var(--brand-dark)]">
                {artist.displayName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {artist.displayName}
              </h3>
              {artist.studioAddress && (
                <p className="text-sm text-gray-500">{artist.studioAddress}</p>
              )}
              {artist.instagramHandle && (
                <p className="text-xs text-gray-400">
                  @{artist.instagramHandle}
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--brand)]">
              NT${quote.quotedPrice.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">預估報價</p>
          </div>
        </div>

        {/* Styles */}
        <div className="mt-3 flex flex-wrap gap-1">
          {artist.styles.map((style) => (
            <Badge key={style} variant="secondary" className="text-xs">
              {style}
            </Badge>
          ))}
        </div>

        {/* Available Time */}
        <div className="mt-3 rounded-lg bg-[var(--brand-bg)] p-2">
          <p className="text-sm text-gray-600">
            <span className="font-medium">可預約時段：</span>
            {quote.availableTime}
          </p>
        </div>

        {/* Message */}
        {quote.message && (
          <p className="mt-2 text-sm text-gray-600 italic">
            &ldquo;{quote.message}&rdquo;
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => onViewPortfolio(artist.id)}
          >
            查看作品集
          </Button>
          <Button
            className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
            onClick={() => onBook(quote.id)}
          >
            想預約此方案
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
