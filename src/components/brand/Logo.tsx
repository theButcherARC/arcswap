import Image from "next/image";

// The official VibeFlow artwork, untouched. Two treatments:
// - LogoMark: the big gradient mark from the official brand sheet with the
//   background removed (public/logo-mark.svg, transparent). This is the
//   primary mark on light surfaces: sidebar, headers.
// - LogoTile: the white mark on a USDC blue gradient tile (the approved
//   treatment for the AI Payment Agent), CSS-cropped from logo.png.
// The artwork itself is never redrawn or recolored.

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <Image
      src="/logo-mark.svg"
      alt=""
      width={Math.round(size * 1.65)}
      height={size}
      unoptimized
      aria-hidden="true"
      className="shrink-0"
    />
  );
}

export function LogoTile({ size = 28 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[24%] bg-gradient-to-br from-[#38BDF8] to-[#2775CA]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/logo.png"
        alt=""
        width={size * 2}
        height={size * 2}
        unoptimized
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 1.6, height: size * 1.6 }}
      />
    </span>
  );
}
