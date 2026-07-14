import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Balance, Settlement } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const group = await prisma.group.findUnique({
    where: { id },
    include: { members: true },
  });

  if (!group) {
    return NextResponse.json(
      { error: "Grupo no encontrado" },
      { status: 404 }
    );
  }

  if (!group.members.some((m) => m.userId === userId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
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
  });

  const balancesMap = new Map<string, Balance>();

  for (const member of group.members) {
    const user = await prisma.user.findUnique({
      where: { id: member.userId },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      balancesMap.set(member.userId, {
        user,
        paid: 0,
        spent: 0,
        balance: 0,
      });
    }
  }

  for (const expense of expenses) {
    const paidBy = expense.paidBy;

    if (balancesMap.has(paidBy.id)) {
      balancesMap.get(paidBy.id)!.paid += expense.amount;
    }

    for (const share of expense.shares) {
      if (balancesMap.has(share.userId)) {
        balancesMap.get(share.userId)!.spent += share.amount;
      }
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

  return NextResponse.json({ balances, settlements });
}
