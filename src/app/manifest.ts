import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: site.name,
    short_name: "Badminton",
    description: site.description,
    start_url: "/?source=app",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0c",
    theme_color: "#0b0b0c",
    categories: ["sports", "lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My classes", url: "/portal", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Enrol in a class", url: "/portal/classes", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Court hire", url: "/court-hire", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
