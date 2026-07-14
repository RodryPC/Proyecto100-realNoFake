import Link from "next/link";

interface GroupCardProps {
  id: string;
  name: string;
  description: string | null;
  memberCount: number;
}

export default function GroupCard({
  id,
  name,
  description,
  memberCount,
}: GroupCardProps) {
  return (
    <Link
      href={`/groups/${id}`}
      className="block rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-600">{description}</p>
      )}
      <p className="mt-3 text-xs text-gray-500">
        {memberCount} {memberCount === 1 ? "miembro" : "miembros"}
      </p>
    </Link>
  );
}
