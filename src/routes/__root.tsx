import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

const APP_NAME = "郵票組合計數機";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content" },
      { title: APP_NAME },
      {
        name: "description",
        content: "以香港郵票面值組合出最簡便的郵費貼法，開啟即可使用，無需安裝。",
      },
      { name: "theme-color", content: "#009247" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "郵票計數機" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
    ],
    links: [
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32.png" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icon-192.png" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Sans+HK:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  component: () => (
    <html lang="zh-Hant-HK" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("stamp-calc-theme")==="dark"){document.documentElement.classList.add("dark");document.documentElement.style.colorScheme="dark"}var s=JSON.parse(localStorage.getItem("stamp-calc-v2")||"{}");if(s.mode==="types")document.documentElement.classList.add("types")}catch(e){}
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();window.__pwaDeferred=e;});
if("serviceWorker"in navigator){navigator.serviceWorker.register(new URL("sw.js",document.baseURI).href).catch(function(){});}
(function(){function editable(t){return t&&t.closest&&t.closest("input,textarea,[contenteditable=true]");}function block(e){if(!editable(e.target))e.preventDefault();}document.addEventListener("selectstart",block);document.addEventListener("copy",block);document.addEventListener("cut",block);document.addEventListener("contextmenu",block);})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
