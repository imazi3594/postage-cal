import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/components/settings-page";

export const Route = createFileRoute("/settings")({
  component: Settings,
  head: () => ({
    meta: [{ title: "設定 · 郵票計數機" }],
  }),
});

function Settings() {
  return (
    <main className="min-h-dvh bg-bg">
      <SettingsPage />
    </main>
  );
}
