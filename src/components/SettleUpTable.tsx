import type { Balance, Settlement } from "@/types";

interface SettleUpTableProps {
  balances: Balance[];
  settlements: Settlement[];
}

export default function SettleUpTable({
  balances,
  settlements,
}: SettleUpTableProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Miembro
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Pagó
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Consumió
              </th>
              <th className="px-4 py-3 text-right font-medium text-gray-700">
                Saldo
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {balances.map((b) => (
              <tr key={b.user.id}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {b.user.name}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  ${b.paid.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-gray-700">
                  ${b.spent.toFixed(2)}
                </td>
                <td
                  className={`px-4 py-3 text-right font-medium ${
                    b.balance >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {b.balance >= 0 ? "+" : ""}${b.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {settlements.length > 0 && (
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Liquidaciones
          </h3>
          <div className="space-y-2">
            {settlements.map((s, i) => (
              <div
                key={i}
                className="rounded-lg bg-gray-50 px-4 py-3 text-sm"
              >
                <span className="font-medium text-red-600">{s.from.name}</span>{" "}
                debe pagar{" "}
                <span className="font-bold text-gray-900">
                  ${s.amount.toFixed(2)}
                </span>{" "}
                a{" "}
                <span className="font-medium text-green-600">{s.to.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {settlements.length === 0 && balances.length > 0 && (
        <p className="text-center text-sm text-gray-500">
          Todos están al día. No hay deudas pendientes.
        </p>
      )}
    </div>
  );
}
