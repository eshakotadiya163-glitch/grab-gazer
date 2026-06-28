import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — The Woman's Company" },
      { name: "description", content: "Read our privacy policy." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background py-16 lg:py-24">
      <div className="container-tight max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">Privacy Policy</h1>
        <p className="mt-6 text-muted-foreground">
          Your privacy is important to us. This page outlines how we collect, use, and protect your personal information.
        </p>
        <p className="mt-4 text-muted-foreground">
          We collect information you provide when placing orders, subscribing to newsletters, or contacting us. This data is used solely to fulfill your requests and improve our services.
        </p>
        <p className="mt-4 text-muted-foreground">
          We do not sell your personal information. For any questions, please contact us at sales@ecosattvastore.com.
        </p>
      </div>
    </main>
  );
}
