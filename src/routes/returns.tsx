import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Returns & Exchanges — The Woman's Company" },
      { name: "description", content: "Read our returns and exchanges policy." },
    ],
  }),
  component: ReturnsPage,
});

function ReturnsPage() {
  return (
    <main className="min-h-screen bg-background py-16 lg:py-24">
      <div className="container-tight max-w-3xl">
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold text-foreground">
          Returns & Exchanges
        </h1>
        <p className="mt-6 text-muted-foreground">
          We want you to be happy with your purchase. If something is not right, we are here to help.
        </p>
        <p className="mt-4 text-muted-foreground">
          Due to the intimate nature of our products, opened or used items cannot be returned for hygiene reasons. Unopened products in original packaging may be returned within 7 days of delivery.
        </p>
        <p className="mt-4 text-muted-foreground">
          To initiate a return or exchange, please contact us at sales@ecosattvastore.com with your order details.
        </p>
      </div>
    </main>
  );
}
