"use client";

import { useEffect, useMemo, useState } from "react";

const menu = [
  ["dashboard.html", "대시보드"],
  ["repolist.html", "저장소"],
  ["timeline.html", "타임라인"],
  ["troubleshooting.html", "트러블슈팅"],
  ["retrospective.html", "회고"],
  ["export.html", "내보내기"],
  ["settings.html", "설정"],
] as const;

const publicPages = new Set(["index.html", "landing.html", "login.html"]);

export default function Home() {
  const [page, setPage] = useState("index.html");
  const showShell = !publicPages.has(page);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type !== "gitfolio:navigate") return;
      const next = String(event.data.href || "").split("/").pop()?.split("?")[0];
      if (next?.endsWith(".html")) setPage(next);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const src = useMemo(() => `/gitfolio/${page}?embedded=1`, [page]);

  return (
    <main className={`app-shell ${showShell ? "app-shell--signed-in" : ""}`}>
      {showShell && (
        <aside className="app-sidebar" aria-label="주 메뉴">
          <button className="app-logo" onClick={() => setPage("dashboard.html")} aria-label="Gitfolio 대시보드">
            <img src="/brand/gitfolio-logo.png" alt="" />
            <span>Gitfolio</span>
          </button>
          <nav className="app-nav">
            {menu.map(([href, label]) => (
              <button
                key={href}
                className={page === href || (href === "retrospective.html" && page === "retrospectivechat.html") ? "is-active" : ""}
                onClick={() => setPage(href)}
              >
                {label}
              </button>
            ))}
          </nav>
          <button className="app-profile" onClick={() => setPage("settings.html")}>
            <span>Y</span>
            <span>yuna-kim</span>
          </button>
        </aside>
      )}
      <iframe key={page} className="design-frame" src={src} title={`Gitfolio - ${page}`} />
    </main>
  );
}
