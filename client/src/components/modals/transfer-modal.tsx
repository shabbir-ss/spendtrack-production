import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Account { id: string; name: string; type: string; }

export default function TransferModal({ children }: { children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accounts = [] } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    queryFn: () => api.get("/accounts"),
  });

  const [form, setForm] = useState<{ fromId: string; toId: string; amount: string }>({ fromId: "", toId: "", amount: "" });

  const mutate = useMutation({
    // Server-side transfer for consistency
    mutationFn: async ({ fromId, toId, amount }: { fromId: string; toId: string; amount: string }) => {
      const amt = parseFloat(amount);
      return api.post("/accounts/transfer", { fromId, toId, amount: amt });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      setOpen(false);
      setForm({ fromId: "", toId: "", amount: "" });
    },
    onError: async (err: any) => {
      const msg = err?.message || 'Transfer failed';
      // TODO: replace with toast when available globally here
      // For now, show a gentle alert-like toast fallback using window.alert
      alert(msg);
    }
  });

  const canSubmit = form.fromId && form.toId && form.fromId !== form.toId && parseFloat(form.amount) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="secondary">Transfer</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transfer Between Accounts</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <FormLabel>From</FormLabel>
            <Select value={form.fromId} onValueChange={(v) => setForm(s => ({ ...s, fromId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FormLabel>To</FormLabel>
            <Select value={form.toId} onValueChange={(v) => setForm(s => ({ ...s, toId: v }))}>
              <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.name} ({a.type})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <FormLabel>Amount</FormLabel>
            <Input type="number" step="0.01" value={form.amount} onChange={(e) => setForm(s => ({ ...s, amount: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={() => mutate.mutate(form)} disabled={!canSubmit || mutate.isPending}>Transfer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}