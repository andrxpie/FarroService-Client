"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/"); return; }
    if (user.role === "Master") router.replace("/dashboard/schedule");
    else router.replace("/dashboard/bookings");
  }, [user, isLoading, router]);

  return null;
}
