/**
 * Placeholder banner for a RO brand card. Renders when the brand row has no
 * `image_url` set. Deliberately generic — a stylised water-purifier silhouette
 * against a tinted background — so the site does not ship any third-party
 * product photograph. The owner replaces the visual by pasting a real image
 * URL into the admin form.
 *
 * The tint rotates through the theme's chart palette based on the brand's
 * position in the list, so the four seeded brands look visually distinct
 * without hard-coding a colour per brand.
 */
const PALETTES = [
  { bg: "#dcecff", stroke: "#1f4a7a", accent: "#2f6fb5" },
  { bg: "#dff3e6", stroke: "#1f5a35", accent: "#2f8a56" },
  { bg: "#efe8fb", stroke: "#3a2c68", accent: "#6a4fb3" },
  { bg: "#fdefe0", stroke: "#7a4b1a", accent: "#c17b34" },
  { bg: "#e8f1ef", stroke: "#204d47", accent: "#3d8479" },
  { bg: "#f3dee6", stroke: "#651e40", accent: "#a94778" },
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
        className="h-52 w-full rounded-t-2xl object-cover"
      />
    );
  }

  const palette = PALETTES[index % PALETTES.length]!;
  const initials = name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 3);

  return (
    <svg
      viewBox="0 0 800 320"
      role="img"
      aria-label={`${name} — placeholder image`}
      className="h-52 w-full rounded-t-2xl"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id={`bg-${index}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.bg} />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <rect width="800" height="320" fill={`url(#bg-${index})`} />

      {/* Countertop shadow */}
      <ellipse cx="530" cy="288" rx="180" ry="10" fill={palette.stroke} opacity="0.10" />

      {/* Stylised purifier silhouette — generic rounded body + tank stripe */}
      <g transform="translate(400 60)">
        <rect x="0" y="0" width="220" height="220" rx="18" fill="#ffffff" stroke={palette.stroke} strokeWidth="3" />
        <rect x="18" y="18" width="90" height="42" rx="6" fill={palette.accent} opacity="0.15" />
        <rect x="18" y="72" width="90" height="8" rx="4" fill={palette.accent} opacity="0.35" />
        <rect x="18" y="86" width="70" height="6" rx="3" fill={palette.accent} opacity="0.25" />
        <rect x="130" y="18" width="72" height="184" rx="10" fill={palette.accent} opacity="0.18" />
        {/* Tap */}
        <rect x="152" y="200" width="28" height="14" rx="3" fill={palette.stroke} />
        <rect x="160" y="214" width="12" height="12" rx="2" fill={palette.stroke} />
        {/* Water droplet */}
        <path
          d="M166 240 c 6 8 12 14 12 22 a 12 12 0 1 1 -24 0 c 0 -8 6 -14 12 -22 z"
          fill={palette.accent}
        />
      </g>

      {/* Initials monogram on the left */}
      <g transform="translate(80 130)">
        <circle cx="60" cy="30" r="46" fill="#ffffff" stroke={palette.stroke} strokeWidth="2" />
        <text
          x="60"
          y="42"
          textAnchor="middle"
          fontFamily="Outfit, ui-sans-serif, system-ui, sans-serif"
          fontWeight="700"
          fontSize="28"
          fill={palette.stroke}
        >
          {initials || "RO"}
        </text>
        <text
          x="60"
          y="98"
          textAnchor="middle"
          fontFamily="Figtree, ui-sans-serif, system-ui, sans-serif"
          fontSize="12"
          fill={palette.stroke}
          opacity="0.7"
        >
          Placeholder
        </text>
      </g>
    </svg>
  );
}
