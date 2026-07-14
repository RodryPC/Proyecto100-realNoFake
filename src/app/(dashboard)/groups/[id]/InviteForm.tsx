"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface InviteFormProps {
  groupId: string;
}

export default function InviteForm({ groupId }: InviteFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleInvite() {
    if (!email) return;
    setLoading(true);

    const res = await fetch(`/api/groups/${groupId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.ok) {
      toast.success("Usuario agregado al grupo");
      setEmail("");
      router.refresh();
    } else {
      const data = await res.json();
      toast.error(data.error || "Error al invitar");
    }
  }

  return (
    <div className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email del usuario"
        className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleInvite}
        disabled={loading || !email}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "..." : "Invitar"}
      </button>
    </div>
  );
}
