import { createFileRoute } from "@tanstack/react-router";
import { StampCalculator } from "@/components/calculator";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="min-h-dvh bg-bg">
      <StampCalculator />
    </main>
  );
}
