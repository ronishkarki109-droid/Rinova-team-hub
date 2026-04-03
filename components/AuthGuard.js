"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push("/login");
      } else if (mounted) {
        setReady(true);
      }
    });
    return () => { mounted = false; };
  }, [router]);

  if (!ready) return <div className="container">Loading...</div>;
  return children;
}
