import ProfileCard from "@/components/profile/ProfileCard";

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-gray-50 flex items-start justify-center p-4 md:p-10">
            <div className="w-full max-w-5xl">
                <ProfileCard />
            </div>
        </main>
    );
}