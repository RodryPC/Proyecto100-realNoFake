import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createExpenseSchema = z.object({
  description: z.string().min(1, "Descripción requerida"),
  amount: z.number().positive("Monto debe ser positivo"),
  date: z.string().optional(),
  paidById: z.string().min(1, "Pagador requerido"),
  splitAmong: z
    .array(z.string())
    .min(1, "Debe haber al menos un participante"),
});

async function getGroupIfMember(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) return null;
  if (!group.members.some((m) => m.userId === userId)) return null;
  return group;
}

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

  const group = await getGroupIfMember(id, userId);
  if (!group) {
    return NextResponse.json(
      { error: "Grupo no encontrado o no autorizado" },
      { status: 404 }
    );
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

  return NextResponse.json(expenses);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const group = await getGroupIfMember(id, userId);
  if (!group) {
    return NextResponse.json(
      { error: "Grupo no encontrado o no autorizado" },
      { status: 404 }
    );
  }

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { description, amount, paidById, splitAmong, date } = parsed.data;

  const isPayerInGroup = group.members.some((m) => m.userId === paidById);
  if (!isPayerInGroup) {
    return NextResponse.json(
      { error: "El pagador no es miembro del grupo" },
      { status: 400 }
    );
  }

  const allParticipantsValid = splitAmong.every((pid) =>
    group.members.some((m) => m.userId === pid)
  );
  if (!allParticipantsValid) {
    return NextResponse.json(
      { error: "Algún participante no es miembro del grupo" },
      { status: 400 }
    );
  }

  const shareAmount = amount / splitAmong.length;

  const expense = await prisma.expense.create({
    data: {
      description,
      amount,
      date: date ? new Date(date) : new Date(),
      paidById,
      groupId: id,
      shares: {
        create: splitAmong.map((participantId) => ({
          userId: participantId,
          amount: shareAmount,
        })),
      },
    },
    include: {
      paidBy: { select: { id: true, name: true, email: true } },
      shares: {
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json(expense, { status: 201 });
}
