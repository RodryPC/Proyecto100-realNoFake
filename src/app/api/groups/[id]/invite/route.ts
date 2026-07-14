import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Email inválido"),
});

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

  const isMember = group.members.some((m) => m.userId === userId);
  if (!isMember) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = inviteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Usuario no encontrado con ese email" },
      { status: 404 }
    );
  }

  const alreadyMember = group.members.some((m) => m.userId === user.id);
  if (alreadyMember) {
    return NextResponse.json(
      { error: "El usuario ya es miembro del grupo" },
      { status: 409 }
    );
  }

  await prisma.groupMember.create({
    data: { userId: user.id, groupId: id },
  });

  return NextResponse.json({ message: "Usuario agregado al grupo" });
}
