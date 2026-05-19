"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BlogCreateForm from "@/components/blog/BlogCreateForm";

const REDIRECT_AFTER_LOGIN_KEY = "redirectAfterLogin";
const TOKEN_STORAGE_KEY = "token";

export default function CreatePostPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!token) {
      localStorage.setItem(REDIRECT_AFTER_LOGIN_KEY, "/blog/create");
      router.replace("/sign-in");
      return;
    }

    setIsChecking(false);
  }, [router]);

  if (isChecking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]/50 dark:bg-black py-12 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BlogCreateForm />
      </div>
    </div>
  );
}
