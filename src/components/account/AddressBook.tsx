"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Input";

export type Address = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  is_default: boolean;
};

type FormState = {
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  is_default: boolean;
};

const EMPTY_FORM: FormState = {
  label: "Home",
  full_name: "",
  phone: "",
  address_line: "",
  is_default: false,
};

/**
 * Shared address book: used read/write in /account/addresses, and in
 * "pick one to ship to" mode during checkout (via `selectable`).
 */
export function AddressBook({
  selectable = false,
  selectedId = null,
  onSelect,
  prefill,
}: {
  selectable?: boolean;
  selectedId?: string | null;
  onSelect?: (address: Address) => void;
  prefill?: { full_name?: string; phone?: string };
}) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadAddresses() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("addresses")
      .select("id, label, full_name, phone, address_line, is_default")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });

    const rows = data ?? [];
    setAddresses(rows);
    setLoading(false);

    if (rows.length === 0) {
      setShowForm(true);
      setForm({ ...EMPTY_FORM, full_name: prefill?.full_name ?? "", phone: prefill?.phone ?? "" });
    } else if (selectable && !rows.some((a) => a.id === selectedId)) {
      // Nothing selected yet, or the previously-selected address is gone
      // (e.g. just deleted) — fall back to the first (default-sorted) one.
      onSelect?.(rows[0]);
    }
  }

  function startAdd() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      full_name: prefill?.full_name ?? "",
      phone: prefill?.phone ?? "",
      is_default: addresses.length === 0,
    });
    setShowForm(true);
  }

  function startEdit(address: Address) {
    setEditingId(address.id);
    setForm({
      label: address.label,
      full_name: address.full_name,
      phone: address.phone,
      address_line: address.address_line,
      is_default: address.is_default,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in.");

      // The DB only allows one is_default=true row per user, so clear the
      // old one first whenever this save would set a new default.
      if (form.is_default) {
        await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", user.id)
          .eq("is_default", true);
      }

      if (editingId) {
        const { error: updateError } = await supabase
          .from("addresses")
          .update({
            label: form.label || "Home",
            full_name: form.full_name,
            phone: form.phone,
            address_line: form.address_line,
            is_default: form.is_default,
          })
          .eq("id", editingId);
        if (updateError) throw updateError;
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from("addresses")
          .insert({
            user_id: user.id,
            label: form.label || "Home",
            full_name: form.full_name,
            phone: form.phone,
            address_line: form.address_line,
            is_default: form.is_default,
          })
          .select("id, label, full_name, phone, address_line, is_default")
          .single();
        if (insertError) throw insertError;
        if (selectable && inserted) onSelect?.(inserted);
      }

      setShowForm(false);
      setEditingId(null);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this address.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    await loadAddresses();
  }

  async function handleSetDefault(id: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .eq("is_default", true);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await loadAddresses();
  }

  if (loading) {
    return <p className="text-sm text-slate-500">Loading addresses…</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`rounded-2xl border p-4 text-sm ${
            selectable && selectedId === address.id
              ? "border-brand-500 ring-1 ring-brand-100"
              : "border-slate-200"
          }`}
        >
          <div className="flex items-start gap-3">
            {selectable && (
              <input
                type="radio"
                name="shipping-address"
                className="mt-1"
                checked={selectedId === address.id}
                onChange={() => onSelect?.(address)}
              />
            )}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-slate-900">{address.label}</span>
                {address.is_default && (
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
                    Default
                  </span>
                )}
              </div>
              <p className="mt-1 text-slate-700">{address.full_name} &middot; {address.phone}</p>
              <p className="mt-0.5 whitespace-pre-line text-slate-500">{address.address_line}</p>

              <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => startEdit(address)}
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Edit
                </button>
                {!address.is_default && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address.id)}
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(address.id)}
                  className="font-medium text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {showForm ? (
        <form
          onSubmit={handleSave}
          className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4"
        >
          <div>
            <Label htmlFor="addr-label">Label (e.g. Home, Office)</Label>
            <Input
              id="addr-label"
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addr-name">Full Name</Label>
            <Input
              id="addr-name"
              required
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addr-phone">Phone Number</Label>
            <Input
              id="addr-phone"
              type="tel"
              required
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="addr-line">
              Delivery Address (street, city, state, PIN code)
            </Label>
            <Textarea
              id="addr-line"
              rows={3}
              required
              value={form.address_line}
              onChange={(e) => setForm((f) => ({ ...f, address_line: e.target.value }))}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={form.is_default}
              onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
            />
            Set as default address
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save Changes" : "Save Address"}
            </Button>
            {addresses.length > 0 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      ) : (
        <Button type="button" variant="secondary" onClick={startAdd} className="self-start">
          + Add New Address
        </Button>
      )}
    </div>
  );
}
