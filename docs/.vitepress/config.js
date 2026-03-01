import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Dados & Risas",
  description:
    "Real-time D&D session management — OBS overlays, REST API & Socket.io reference",
  base: "/",

  themeConfig: {
    logo: "/favicon.ico",
    siteTitle: "Dados & Risas",

    nav: [
      { text: "Guide", link: "/index" },
      { text: "API Reference", link: "http://localhost:3000/api-docs", target: "_blank" },
      { text: "GitHub", link: "https://github.com/s0lci700/OVERLAYS", target: "_blank" },
    ],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Overview", link: "/index" },
          { text: "Architecture", link: "/ARCHITECTURE" },
          { text: "Environment & Setup", link: "/ENVIRONMENT" },
          { text: "Bun Migration", link: "/BUN-MIGRATION" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "REST Endpoints", link: "/API-STRUCTURE" },
          { text: "Socket.io Events", link: "/SOCKET-EVENTS" },
        ],
      },
      {
        text: "Design System",
        items: [
          { text: "Design Tokens & Components", link: "/DESIGN-SYSTEM" },
          { text: "Token Pipeline & Theming", link: "/THEMING" },
          { text: "Live Theme Editor", link: "/LIVE-THEME-EDITOR" },
        ],
      },
      {
        text: "Testing",
        items: [{ text: "Playwright & k6 Guide", link: "/testing" }],
      },
      {
        text: "Reference",
        items: [
          { text: "Doc Index", link: "/INDEX" },
          { text: "Developer Handoff", link: "/DEVELOPER-HANDOFF" },
        ],
      },
    ],

    search: { provider: "local" },

    socialLinks: [
      { icon: "github", link: "https://github.com/s0lci700/OVERLAYS" },
    ],

    footer: {
      message: "Dados & Risas — D&D session management system",
    },

    outline: { level: [2, 3], label: "On this page" },
  },

  markdown: {
    lineNumbers: true,
  },
});
