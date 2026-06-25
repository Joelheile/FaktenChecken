interface VideoEmbedProps {
  videoId: string;
}

// TikTok's embed iframe is cross-origin: its "Watch now" CTA, caption and music
// row (all rendered below the player) cannot be removed from the DOM. Instead
// the wrapper is a fixed 9:16 portrait box and the iframe fills it, so anything
// the embed lays out below the player falls outside the box and is clipped.
export const VideoEmbed = ({ videoId }: VideoEmbedProps) => (
  <div className="relative mx-auto aspect-[9/16] w-full max-w-[320px] overflow-hidden rounded-xl border border-border bg-card shadow-soft">
    <iframe
      title="TikTok Video"
      src={`https://www.tiktok.com/embed/v2/${videoId}`}
      className="absolute inset-0 h-full w-full"
      allow="autoplay; encrypted-media; fullscreen"
      loading="lazy"
    />
  </div>
);
