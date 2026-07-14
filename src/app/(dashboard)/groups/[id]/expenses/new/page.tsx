import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExpenseForm from "@/components/ExpenseForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewExpensePage({ params }: Props) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

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

  const members = group.members.map((m) => m.user);

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">
        Nuevo gasto en {group.name}
      </h1>

      <div className="rounded-xl bg-white p-6 shadow-sm">
        <ExpenseForm groupId={id} members={members} />
      </div>
    </div>
  );
}
