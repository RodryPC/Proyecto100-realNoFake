"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import type { ExpenseWithDetails } from "@/types";

interface ExpenseListProps {
  expenses: ExpenseWithDetails[];
  groupId: string;
}

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ExpenseList({ expenses, groupId }: ExpenseListProps) {
  const router = useRouter();

  async function handleDelete(expenseId: string) {
    if (!confirm("¿Eliminar este gasto?")) return;

    const res = await fetch(
      `/api/groups/${groupId}/expenses/${expenseId}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      toast.success("Gasto eliminado");
      router.refresh();
    } else {
      toast.error("Error al eliminar gasto");
    }
  }

  if (expenses.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hay gastos registrados aún.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => {
         const perPerson =
           expense.shares.length > 0
             ? (expense.amount / 100 / expense.shares.length).toFixed(2)
             : "0.00";

         return (
           <div
             key={expense.id}
             className="rounded-lg border bg-white p-4 shadow-sm"
           >
             <div className="flex items-start justify-between">
               <div>
                 <h4 className="font-medium text-gray-900">
                   {expense.description}
                 </h4>
                 <p className="text-xs text-gray-500">
                   {formatDate(expense.date)} &middot; Pagó{" "}
                   <span className="font-medium">{expense.paidBy.name}</span>
                 </p>
               </div>
               <div className="text-right">
                 <p className="text-lg font-bold text-gray-900">
                   ${(expense.amount / 100).toFixed(2)}
                 </p>
                 <p className="text-xs text-gray-500">
                   ${perPerson} c/u
                 </p>
               </div>
             </div>

             <div className="mt-2 flex flex-wrap gap-1">
               {expense.shares.map((share) => (
                 <span
                   key={share.user.id}
                   className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-700"
                 >
                   {share.user.name}: ${(share.amount / 100).toFixed(2)}
                 </span>
               ))}
             </div>

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => handleDelete(expense.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Eliminar
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
