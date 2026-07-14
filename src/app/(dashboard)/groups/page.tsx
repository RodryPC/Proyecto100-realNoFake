import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GroupCard from "@/components/GroupCard";

export default async function GroupsPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const groups = await prisma.group.findMany({
    where: {
      members: { some: { userId } },
    },
    include: {
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mis grupos</h1>
        <Link
          href="/groups/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo grupo
        </Link>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
          <p className="text-gray-500">
            No tienes grupos aún. Crea tu primer grupo para empezar.
          </p>
          <Link
            href="/groups/new"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Crear grupo
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <GroupCard
              key={group.id}
              id={group.id}
              name={group.name}
              description={group.description}
              memberCount={group._count.members}
            />
          ))}
        </div>
      )}
    </div>
  );
}
