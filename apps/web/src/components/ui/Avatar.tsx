"use client";

/**
 * Avatar — circular avatar with graceful fallback. Shows the remote image when
 * the URL loads, otherwise a personalized monogram (first letter of the gamer
 * tag) on a brand gradient. Used by the dashboard, public profile header and
 * the identity form preview. Sizes: sm (36), md (44), lg (64), xl (96).
 */
const SIZES = { sm: 36, md: 44, lg: 64, xl: 96 } as const;

export function Avatar({
  url,
  gamerTag,
  size = "md",
  className = "",
}: {
  url?: string;
  gamerTag?: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const px = SIZES[size];
  const monogram = (gamerTag?.trim()?.[0] ?? "?").toUpperCase();
  const fontSize = size === "xl" ? "text-3xl" : size === "lg" ? "text-xl" : size === "md" ? "text-base" : "text-sm";
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 ${className}`}
      style={{ width: px, height: px }}
      aria-hidden
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={(e) => {
            // Hide the broken image so the gradient monogram shows through.
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <span
        className={`absolute inset-0 grid place-items-center font-black text-white ${fontSize}`}
        // Rendered behind the image; only visible when there's no/failed image.
        style={url ? { zIndex: 0 } : undefined}
      >
        {monogram}
      </span>
    </div>
  );
}
