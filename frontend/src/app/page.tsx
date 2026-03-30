import ProfileCard from "@/components/profile/ProfileCard";

export default function ProfilePage() {
    return (
        // Usamos min-h-screen y un fondo claro para que la tarjeta resalte
        <main className="min-h-screen bg-gray-50 p-4 md:p-10 flex justify-center items-start">
            <div className="w-full max-w-5xl">
                <ProfileCard />
            </div>
        </main>
    );
}