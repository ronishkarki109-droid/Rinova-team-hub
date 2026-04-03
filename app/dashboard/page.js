"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import CreateChannelForm from "@/components/CreateChannelForm";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [channels, setChannels] = useState([]);
  const [profile, setProfile] = useState(null);

  async function loadData() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (user) {
      const [{ data: ch }, { data: prof }] = await Promise.all([
        supabase.from("channels").select("*").order("created_at", { ascending: true }),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      ]);
      setChannels(ch || []);
      setProfile(prof || null);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <AuthGuard>
      <div className="container">
        <div className="topbar">
          <div>
            <h1 style={{ marginBottom: 6 }}>Rinova Team Hub</h1>
            <div className="small">{profile ? `Logged in as ${profile.full_name || profile.email}` : "Loading profile..."}</div>
          </div>
          <LogoutButton />
        </div>

        <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
          <div className="card">
            <h2 style={{ marginTop: 0 }}>Channels</h2>
            {channels.length === 0 ? (
              <p className="small">No channels yet. Create your first one.</p>
            ) : (
              <div className="grid">
                {channels.map((channel) => (
                  <Link key={channel.id} href={`/dashboard/channel/${channel.id}`} className="channel-link">
                    <strong>#{channel.name}</strong>
                    <div className="small">{channel.description || "No description"}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <CreateChannelForm onCreated={loadData} />
        </div>
      </div>
    </AuthGuard>
  );
}
