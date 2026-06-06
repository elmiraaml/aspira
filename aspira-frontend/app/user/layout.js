"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserLayout({ children }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    if (!token || !userStr) {
      router.push("/login");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      // The user role could be "masyarakat" or "user", but we know it's NOT admin or superadmin
      if (user.role === "admin" || user.role === "superadmin") {
        router.push("/login");
      } else {
        setIsAuthorized(true);
      }
    } catch (e) {
      router.push("/login");
    }
  }, [router]);

  if (!isAuthorized) return null;

  return <>{children}</>;
}
