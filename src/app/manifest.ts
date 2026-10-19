import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PLANdeC Campo",
    short_name: "PLANdeC",
    description: "Aplicación móvil para gestión territorial de campañas PLANdeC.",
    start_url: "/campana/campo",
    display: "standalone",
    background_color: "#EEE3F3",
    theme_color: "#5A2D82",
    orientation: "portrait",
    icons: [
      { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
