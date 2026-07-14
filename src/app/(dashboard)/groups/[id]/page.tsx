import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExpenseList from "@/components/ExpenseList";
import SettleUpTable from "@/components/SettleUpTable";
import ExpenseChart from "@/components/ExpenseChart";
import InviteForm from "./InviteForm";
import type { Balance, Settlement, UserProfile } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupDetailPage({ params }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  if (!group || !group.members.some((m) => m.userId === userId)) {
    notFound();
  }

  const expenses = await prisma.expense.findMany({
    where: { groupId: id },
    include: {
      paidBy: { select: { id: true, name: true, email: true } },
      shares: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: { date: "desc" },
  });

  const members: UserProfile[] = group.members.map((m) => m.user);

  const balancesMap = new Map<string, Balance>();

  for (const member of members) {
    balancesMap.set(member.id, {
      user: member,
      paid: 0,
      spent: 0,
      balance: 0,
    });
  }

  for (const expense of expenses) {
    const bal = balancesMap.get(expense.paidById);
    if (bal) bal.paid += expense.amount;

    for (const share of expense.shares) {
      const sb = balancesMap.get(share.userId);
      if (sb) sb.spent += share.amount;
    }
  }

  for (const balance of balancesMap.values()) {
    balance.balance = Math.round((balance.paid - balance.spent) * 100) / 100;
  }

  const balances = Array.from(balancesMap.values());

  const creditors = balances
    .filter((b) => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
  const debtors = balances
    .filter((b) => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance);

  const settlements: Settlement[] = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > 0) {
      settlements.push({
        from: debtor.user,
        to: creditor.user,
        amount: rounded,
      });
    }

    creditor.balance -= rounded;
    debtor.balance += rounded;

    if (creditor.balance < 0.01) ci++;
    if (Math.abs(debtor.balance) < 0.01) di++;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
        {group.description && (
          <p className="mt-1 text-gray-600">{group.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          {members.map((m) => (
            <span
              key={m.id}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
            >
              {m.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Miembros</h2>
          <InviteForm groupId={id} />
        </div>
        <div className="mt-3 space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-gray-700">{m.name}</span>
              <span className="text-gray-500">{m.email}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Gastos</h2>
          <a
            href={`/groups/${id}/expenses/new`}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Nuevo gasto
          </a>
        </div>
        <ExpenseList expenses={expenses as any} groupId={id} />
      </div>

      <div className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Resumen</h2>
        <SettleUpTable balances={balances} settlements={settlements} />
      </div>

      <div className="mb-6">
        <ExpenseChart balances={balances} />
      </div>
    </div>
  );
}
