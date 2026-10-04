/**
 * Placeholder banner for a RO brand card. Renders when the brand row has no
 * `image_url` set. Deliberately generic — a centred monogram against a soft
 * gradient, decorated with a few water drops — so the site does not ship any
 * third-party product photograph. The owner replaces the visual by pasting a
 * real image URL into the admin form.
 *
 * The tint rotates through a small palette based on the brand's position in
 * the list, so the seeded brands look visually distinct without hard-coding a
 * colour per brand. Composition is centred so `xMidYMid slice` cropping at
 * narrow card widths never cuts off the visible text.
 */
const PALETTES = [
  { bg: "#e3edff", stroke: "#1f4a7a", accent: "#2f6fb5" },
  { bg: "#e2f4e9", stroke: "#1f5a35", accent: "#2f8a56" },
  { bg: "#efe6fa", stroke: "#3a2c68", accent: "#6a4fb3" },
  { bg: "#fceedf", stroke: "#7a4b1a", accent: "#c17b34" },
  { bg: "#e7f2ef", stroke: "#204d47", accent: "#3d8479" },
  { bg: "#f7e0e8", stroke: "#651e40", accent: "#a94778" },
] as const;

interface BrandVisualProps {
  /** Brand image URL from Supabase. When set, the real image is shown instead. */
  imageUrl?: string | null;
  /** Alt text — the brand name. */
  name: string;
  /** Index into the brand list, used to rotate the placeholder tint. */
  index: number;
}

export function BrandVisual({ imageUrl, name, index }: BrandVisualProps) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        loading="lazy"
        decoding="async"
        className="aspect-video w-full rounded-t-2xl object-cover"
      />
    );
  }

  const palette = PALETTES[index % PALETTES.length]!;
  const initials =
    name
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "RO";

  return (
    <svg
      viewBox="0 0 640 360"
      role="img"
      aria-label={`${name} — placeholder image`}
      className="aspect-video w-full rounded-t-2xl"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${index}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.bg} />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="640" height="360" fill={`url(#bg-${index})`} />

      {/* Soft water-drop confetti — decorative, kept away from the centre so
          it survives any aspect-ratio crop. */}
      <g fill={palette.accent} opacity="0.14">
        <circle cx="72" cy="72" r="26" />
        <circle cx="560" cy="90" r="34" />
        <circle cx="590" cy="290" r="22" />
        <circle cx="90" cy="300" r="18" />
        <circle cx="130" cy="200" r="10" />
        <circle cx="510" cy="200" r="12" />
      </g>

      {/* Centred monogram — big circle + initials on top, brand name below. */}
      <g transform="translate(320 180)">
        <circle
          cx="0"
          cy="-24"
          r="58"
          fill="#ffffff"
          stroke={palette.stroke}
          strokeWidth="2"
          opacity="0.95"
        />
        <text
          x="0"
          y="-9"
          textAnchor="middle"
          fontFamily="Outfit, ui-sans-serif, system-ui, sans-serif"
          fontWeight="700"
          fontSize="42"
          fill={palette.stroke}
        >
          {initials}
        </text>
        <text
          x="0"
          y="72"
          textAnchor="middle"
          fontFamily="Figtree, ui-sans-serif, system-ui, sans-serif"
          fontWeight="600"
          fontSize="22"
          fill={palette.stroke}
        >
          {name}
        </text>
      </g>
    </svg>
  );
}
