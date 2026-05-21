import ResumenPanel from "@/components/resumen-final/ResumenPanel";

interface PageProps {
  searchParams?: {
    id?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  const id = searchParams?.id;
  const publicacionId = id ? Number(id) : null;

  return (
    <main className="min-h-screen bg-[#f5f1eb] px-4 py-6 md:px-8">
      <ResumenPanel publicacionId={publicacionId} />
    </main>
  );
}
