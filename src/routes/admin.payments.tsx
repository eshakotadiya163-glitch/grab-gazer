import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({ component: PaymentsPage });

function PaymentsPage() {
  const qc = useQueryClient();
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders" as never)
        .select("id, order_number, customer_name, customer_email, total, payment_method, payment_status, payment_reference, payment_screenshot_url, created_at, status")
        .eq("payment_method", "UPI")
        .in("payment_status", ["awaiting_verification", "pending_verification"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const decide = useMutation({
    mutationFn: async ({ id, approve }: { id: string; approve: boolean }) => {
      const { error } = await supabase.from("orders" as never).update({
        payment_status: approve ? "paid" : "rejected",
        status: approve ? "confirmed" : "cancelled",
      } as never).eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      toast.success(v.approve ? "Payment approved" : "Payment rejected");
    },
    onError: (e: any) => toast.error(e.message ?? "Update failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">Payment Verification</h1>
        <p className="text-sm text-muted-foreground">Review UPI payments and approve or reject.</p>
      </div>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p>
        : orders.length === 0 ? <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">No pending payments.</p>
        : (
          <div className="grid gap-3">
            {orders.map((o) => <PaymentRow key={o.id} order={o} onDecide={decide.mutate} busy={decide.isPending} />)}
          </div>
        )}
    </div>
  );
}

function PaymentRow({ order, onDecide, busy }: { order: any; onDecide: (v: { id: string; approve: boolean }) => void; busy: boolean }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const viewProof = async () => {
    if (!order.payment_screenshot_url) return;
    const { data, error } = await supabase.storage.from("payment-proofs").createSignedUrl(order.payment_screenshot_url, 300);
    if (error) return toast.error(error.message);
    setSignedUrl(data.signedUrl);
    window.open(data.signedUrl, "_blank");
  };
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold">{order.order_number}</p>
          <p className="text-sm">{order.customer_name} · <span className="text-muted-foreground">{order.customer_email}</span></p>
          <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("en-IN")}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold">₹{order.total}</p>
          <p className="text-xs text-muted-foreground">UPI</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div><span className="text-muted-foreground">UPI/UTR ref:</span> <span className="font-mono">{order.payment_reference || "—"}</span></div>
        <div>
          <span className="text-muted-foreground">Screenshot:</span>{" "}
          {order.payment_screenshot_url
            ? <button onClick={viewProof} className="inline-flex items-center gap-1 text-sage-deep underline">View <ExternalLink className="h-3 w-3" /></button>
            : "—"}
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={() => onDecide({ id: order.id, approve: true })} disabled={busy}
          className="bg-emerald-600 text-white hover:bg-emerald-700"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Approve</Button>
        <Button size="sm" variant="outline" onClick={() => onDecide({ id: order.id, approve: false })} disabled={busy}
          className="text-red-700 border-red-200 hover:bg-red-50"><XCircle className="mr-1.5 h-4 w-4" /> Reject</Button>
      </div>
    </div>
  );
}
