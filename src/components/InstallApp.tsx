"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, MoreVertical, PlusSquare, Share } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type Platform = "ios" | "android" | "desktop";

/** Install button where the browser supports it, otherwise step-by-step instructions for the visitor's device. */
export function InstallApp() {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [installed, setInstalled] = useState(false);
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
    setPlatform(ios ? "ios" : /Android/.test(ua) ? "android" : "desktop");
    setInstalled(
      window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true,
    );
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPrompt(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="flex items-center gap-2 text-emerald-300">
        <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> You&apos;re using the app. Nice!
      </p>
    );
  }

  if (prompt) {
    return (
      <button
        type="button"
        onClick={async () => {
          await prompt.prompt();
          await prompt.userChoice;
          setPrompt(null);
        }}
        className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-600"
      >
        <Download className="h-5 w-5" aria-hidden="true" /> Install the app
      </button>
    );
  }

  const steps: Record<Platform, { title: string; items: React.ReactNode[] }> = {
    ios: {
      title: "On iPhone or iPad (Safari)",
      items: [
        <>
          Tap the <Share className="inline h-4 w-4 align-[-2px]" aria-label="Share" /> <strong>Share</strong> button at the bottom of Safari.
        </>,
        <>
          Scroll down and tap <PlusSquare className="inline h-4 w-4 align-[-2px]" aria-hidden="true" /> <strong>Add to Home Screen</strong>.
        </>,
        <>
          Tap <strong>Add</strong>. The Brisbane Badminton icon appears on your home screen.
        </>,
      ],
    },
    android: {
      title: "On Android (Chrome)",
      items: [
        <>
          Tap the <MoreVertical className="inline h-4 w-4 align-[-2px]" aria-label="menu" /> menu at the top right of Chrome.
        </>,
        <>
          Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.
        </>,
        <>
          Tap <strong>Install</strong>. The app appears with your other apps.
        </>,
      ],
    },
    desktop: {
      title: "On your phone",
      items: [
        <>Open this page on your phone.</>,
        <>
          <strong>iPhone:</strong> in Safari, tap Share, then <strong>Add to Home Screen</strong>.
        </>,
        <>
          <strong>Android:</strong> in Chrome, tap the menu, then <strong>Install app</strong>.
        </>,
      ],
    },
  };
  const s = steps[platform];

  return (
    <div>
      <h3 className="text-lg font-bold">{s.title}</h3>
      <ol className="mt-3 space-y-3">
        {s.items.map((item, i) => (
          <li key={i} className="flex gap-3 text-zinc-300">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">{i + 1}</span>
            <span className="pt-0.5">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
