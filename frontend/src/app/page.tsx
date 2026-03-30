import Link from "next/link";

export default function Home() {
    return (
        <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
            <h1 className="text-3xl font-bold text-blue-600">PropBol</h1>
            <p className="mt-4 text-gray-600">Página principal temporal</p>

            <Link
                href="/profile"
                className="mt-6 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700"
            >
                Ir a perfil
            </Link>
        </main>
    );
}
