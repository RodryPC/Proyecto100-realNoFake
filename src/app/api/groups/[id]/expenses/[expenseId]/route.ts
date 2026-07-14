import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; expenseId: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: groupId, expenseId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
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

  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
  });

  if (!expense || expense.groupId !== groupId) {
    return NextResponse.json(
      { error: "Gasto no encontrado" },
      { status: 404 }
    );
  }

  await prisma.expense.delete({ where: { id: expenseId } });

  return NextResponse.json({ message: "Gasto eliminado" });
}
