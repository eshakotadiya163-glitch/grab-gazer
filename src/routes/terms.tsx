import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — The Woman's Company" },
      { name: "description", content: "Read our terms and conditions." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background py-16 lg:py-24">
      <div className="container-tight max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
          Terms & Conditions
        </h1>
        <p className="mt-6 text-muted-foreground">
          By using this website and purchasing our products, you agree to the following terms and conditions.
        </p>
        <p className="mt-4 text-muted-foreground">
          All product descriptions, prices, and availability are subject to change without notice. We reserve the right to limit quantities or refuse orders at our discretion.
        </p>
        <p className="mt-4 text-muted-foreground">
          For any questions regarding these terms, please contact us at sales@ecosattvastore.com.
        </p>
      </div>
    </main>
  );
}
