import Image from "next/image";

const logos = {
  /** Red emblem, white text: for dark backgrounds (default). */
  dark: { src: "/logos/logo-full-white.png", width: 1072, height: 259 },
  /** Red emblem, black text: for light backgrounds. */
  light: { src: "/logos/logo-full-color.png", width: 1078, height: 259 },
  /** All white: for photos and brand-red backgrounds. */
  mono: { src: "/logos/logo-mono-white.png", width: 1079, height: 259 },
} as const;

export function Logo({
  variant = "dark",
  className = "h-9 w-auto",
  priority = false,
}: {
  variant?: keyof typeof logos;
  className?: string;
  priority?: boolean;
}) {
  const l = logos[variant];
  return <Image src={l.src} width={l.width} height={l.height} alt="Brisbane Badminton" className={className} priority={priority} />;
}
