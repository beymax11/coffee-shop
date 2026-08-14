import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://agshop.lat";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*", "/api/*", "/auth/*"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
