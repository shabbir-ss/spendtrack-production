import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  name: string;
  type: string; // bank | wallet | credit_card | cash
  balance: string | number;
  institution?: string | null;
  last4?: string | null;
}

export default function AccountsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch accounts
  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["/api/accounts"],
    queryFn: () => api.get("/accounts"),
  });

  // Create account
  const createMutation = useMutation({
    mutationFn: (data: Partial<Account>) => api.post("/accounts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({ title: "Success", description: "Account created" });
      setForm({ name: "", type: "bank", balance: "0.00", institution: "", last4: "" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to create account" }),
  });

  // Update account
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Account> & { id: string }) => api.put(`/accounts/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({ title: "Updated", description: "Account updated" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to update account" }),
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/accounts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/summary"] });
      toast({ title: "Deleted", description: "Account deleted" });
    },
    onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to delete account" }),
  });

  // Local form
  const [form, setForm] = useState({ name: "", type: "bank", balance: "0.00", institution: "", last4: "" });

  const onCreate = () => {
    if (!form.name.trim()) return toast({ variant: "destructive", title: "Name required" });
    createMutation.mutate(form);
  };

  // Simple inline edit for balance (manual adjustments supported)
  const onInlineUpdate = (acc: Account, patch: Partial<Account>) => {
    updateMutation.mutate({ id: acc.id, ...patch });
  };

  const totalByType = useMemo(() => {
    const res: Record<string, number> = {};
    accounts.forEach(a => {
      const bal = typeof a.balance === "string" ? parseFloat(a.balance) : a.balance;
      res[a.type] = (res[a.type] || 0) + (bal || 0);
    });
    return res;
  }, [accounts]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Account</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm(s => ({ ...s, name: e.target.value }))} />
          <Select value={form.type} onValueChange={(v) => setForm(s => ({ ...s, type: v }))}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="wallet">Wallet</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
          <Input type="number" step="0.01" placeholder="Balance" value={form.balance} onChange={(e) => setForm(s => ({ ...s, balance: e.target.value }))} />
          <Input placeholder="Institution (optional)" value={form.institution} onChange={(e) => setForm(s => ({ ...s, institution: e.target.value }))} />
          <div className="flex gap-2">
            <Input placeholder="Last 4 (optional)" value={form.last4} onChange={(e) => setForm(s => ({ ...s, last4: e.target.value }))} />
            <Button className="whitespace-nowrap" onClick={onCreate} disabled={createMutation.isPending}>Add</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const bal = typeof acc.balance === "string" ? parseFloat(acc.balance) : acc.balance;
          const isCredit = acc.type === "credit_card";
          return (
            <Card key={acc.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{acc.name} <span className="text-xs text-gray-500">({acc.type})</span></span>
                  <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(acc.id)}>Delete</Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-semibold">{isCredit ? `Owed: ₹${bal.toFixed(2)}` : `₹${bal.toFixed(2)}`}</div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    value={bal}
                    onChange={(e) => onInlineUpdate(acc, { balance: e.target.value })}
                  />
                  <Button variant="secondary" onClick={() => onInlineUpdate(acc, { name: acc.name + "" })}>Save</Button>
                </div>
                <div className="text-sm text-gray-500">{acc.institution || ""} {acc.last4 ? `• ${acc.last4}` : ""}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Totals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(totalByType).map(([t, v]) => (
              <div key={t} className="p-3 rounded bg-gray-50 dark:bg-gray-800">
                <div className="text-xs uppercase text-gray-500">{t}</div>
                <div className="text-lg font-semibold">₹{v.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}