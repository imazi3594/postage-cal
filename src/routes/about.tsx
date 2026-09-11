import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/about-page";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [{ title: "關於 · 郵票組合計數機" }],
  }),
});

function About() {
  return (
    <main className="min-h-dvh bg-bg">
      <AboutPage />
    </main>
  );
}