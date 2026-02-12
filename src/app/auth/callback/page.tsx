"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Loading from "@/components/ui/Loading";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      try {
        router.replace("/");
      } catch (err) {
        console.error("Error during authentication:", err);
        router.replace("/login");
      }
    };

    handleAuthRedirect();
  }, [router]);

  return <Loading />;
}
