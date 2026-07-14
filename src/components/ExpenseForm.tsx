"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { UserProfile } from "@/types";

interface ExpenseFormProps {
  groupId: string;
  members: UserProfile[];
  onSuccess?: () => void;
}

export default function ExpenseForm({
  groupId,
  members,
  onSuccess,
}: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(
    new Set(members.map((m) => m.id))
  );

  function toggleMember(id: string) {
    const next = new Set(selectedMembers);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMembers(next);
  }

  function toggleAll() {
    if (selectedMembers.size === members.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(members.map((m) => m.id)));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const description = form.get("description") as string;
    const amount = parseFloat(form.get("amount") as string);
    const paidById = form.get("paidById") as string;

    if (selectedMembers.size === 0) {
      toast.error("Selecciona al menos un participante");
      setLoading(false);
      return;
    }

    const res = await fetch(`/api/groups/${groupId}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amount,
        paidById,
        splitAmong: Array.from(selectedMembers),
      }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Gasto registrado");
      if (onSuccess) onSuccess();
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(
        typeof data.error === "string"
          ? data.error
          : "Error al registrar gasto"
      );
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Descripción
        </label>
        <input
          id="description"
          name="description"
          type="text"
          required
          placeholder="Ej: Cena en restaurant"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="amount"
          className="block text-sm font-medium text-gray-700"
        >
          Monto
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          required
          min="0.01"
          step="0.01"
          placeholder="0.00"
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div>
        <label
          htmlFor="paidById"
          className="block text-sm font-medium text-gray-700"
        >
          ¿Quién pagó?
        </label>
        <select
          id="paidById"
          name="paidById"
          required
          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Seleccionar...</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Dividir entre
          </span>
          <button
            type="button"
            onClick={toggleAll}
            className="text-xs text-blue-600 hover:underline"
          >
            {selectedMembers.size === members.length
              ? "Deseleccionar todos"
              : "Seleccionar todos"}
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {members.map((m) => (
            <label
              key={m.id}
              className="flex items-center gap-2 text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={selectedMembers.has(m.id)}
                onChange={() => toggleMember(m.id)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              {m.name}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Registrar gasto"}
      </button>
    </form>
  );
}
