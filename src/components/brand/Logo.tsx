import Image from "next/image";

// The official VibeFlow artwork, untouched. Two tiles for light surfaces:
// - LogoMark: the gradient mark on its original black tile (logo.jpeg),
//   cropped to the glyph so it stays visible on light backgrounds.
// - LogoTile: the white mark on a USDC blue gradient tile (the approved
//   treatment for the AI Payment Agent).
// Both crop with CSS only; the artwork files are never redrawn or recolored.

export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[24%] bg-black"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/logo.jpeg"
        alt=""
        width={size * 2}
        height={size * 2}
        unoptimized
        className="absolute left-1/2 top-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 1.45, height: size * 1.45 }}
      />
    </span>
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
