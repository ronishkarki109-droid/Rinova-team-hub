"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import LogoutButton from "@/components/LogoutButton";
import { supabase } from "@/lib/supabase";

export default function ChannelPage() {
  const params = useParams();
  const channelId = params.id;

  const [channels, setChannels] = useState([]);
  const [channel, setChannel] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
const previousMessageCountRef = useRef(0);
const hasInitializedRef = useRef(false);
const audioRef = useRef(null);
  async function loadAll() {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) return;

    const [{ data: allChannels }, { data: oneChannel }, { data: prof }, { data: msgs }] = await Promise.all([
      supabase.from("channels").select("*").order("created_at", { ascending: true }),
      supabase.from("channels").select("*").eq("id", channelId).maybeSingle(),
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("messages").select("*, profiles(full_name, email), attachments(*)").eq("channel_id", channelId).order("created_at", { ascending: true })
    ]);

    setChannels(allChannels || []);
    setChannel(oneChannel || null);
    setProfile(prof || null);
    const newMessages = msgs || [];

setMessages(newMessages);

const newCount = newMessages.length;

if (!hasInitializedRef.current) {
  previousMessageCountRef.current = newCount;
  hasInitializedRef.current = true;
} else if (newCount > previousMessageCountRef.current) {
  const latestMessage = newMessages[newMessages.length - 1];

  if (latestMessage?.user_id !== user.id) {
    audioRef.current?.play().catch(() => {});
  }

  previousMessageCountRef.current = newCount;
} else {
  previousMessageCountRef.current = newCount;
}

  useEffect(() => {
    loadAll();
    const interval = setInterval(loadAll, 4000);
    return () => clearInterval(interval);
  }, [channelId]);

  const filteredMessages = useMemo(() => {
    if (!search.trim()) return messages;
    const q = search.toLowerCase();
    return messages.filter((m) => (m.text || "").toLowerCase().includes(q));
  }, [messages, search]);

 async function handleSend(e) {
  e?.preventDefault();   // ✅ change this
  setSending(true);
  setNotice("");

  // ✅ ADD THIS BLOCK HERE
  if (!text.trim() && !file) {
    setSending(false);
    return;
  }

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    if (!user) {
      setNotice("Please login again.");
      setSending(false);
      return;
    }

    const { data: insertedMessage, error: messageError } = await supabase
      .from("messages")
      .insert({ channel_id: channelId, user_id: user.id, text })
      .select("*")
      .single();

    if (messageError) {
      setNotice(messageError.message);
      setSending(false);
      return;
    }

    if (file) {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("chat-media").upload(filePath, file, { upsert: false });
      if (uploadError) {
        setNotice(uploadError.message);
        setSending(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from("chat-media").getPublicUrl(filePath);

      await supabase.from("attachments").insert({
        message_id: insertedMessage.id,
        file_url: publicUrlData.publicUrl,
        file_type: file.type,
        file_name: file.name
      });
    }

    setText("");
    setFile(null);
    setNotice("Message sent.");
    await loadAll();
    setSending(false);
  }

  function renderAttachment(att) {
    if (!att?.file_url) return null;
    if (att.file_type && att.file_type.startsWith("image/")) {
      return <div className="message-media"><img src={att.file_url} alt={att.file_name || "attachment"} /></div>;
    }
    if (att.file_type && att.file_type.startsWith("video/")) {
      return <div className="message-media"><video src={att.file_url} controls /></div>;
    }
    return <div style={{ marginTop: 10 }}><a href={att.file_url} target="_blank">Open {att.file_name || "file"}</a></div>;
  }

  return (
    <AuthGuard>
      <div className="container">
        <div className="topbar">
          <div>
            <h1 style={{ marginBottom: 6 }}>{channel ? `#${channel.name}` : "Channel"}</h1>
            <div className="small">{profile ? `Logged in as ${profile.full_name || profile.email}` : "Loading..."}</div>
          </div>
          <div className="row">
            <Link href="/dashboard" className="btn secondary">Back</Link>
            <LogoutButton />
          </div>
        </div>

        <div className="layout">
          <aside className="sidebar">
            <h3 style={{ marginTop: 0 }}>Channels</h3>
            {channels.map((ch) => (
              <Link key={ch.id} href={`/dashboard/channel/${ch.id}`} className={`channel-link ${String(ch.id) === String(channelId) ? "active" : ""}`}>
                #{ch.name}
              </Link>
            ))}
          </aside>

          <main className="chat">
            <audio ref={audioRef} src="/notification.mp3" preload="auto" />
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="badge">{channel?.description || "Team discussion"}</span>
              <input
                style={{ maxWidth: 280, width: "100%", background: "#0b1220", color: "#e2e8f0", border: "1px solid #263243", borderRadius: 10, padding: 10 }}
                placeholder="Search messages"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="messages">
              {filteredMessages.length === 0 ? (
                <div className="small">No messages yet.</div>
              ) : (
                filteredMessages.map((message) => (
                  <div key={message.id} className="message">
                    <div className="message-meta">
                      {(message.profiles?.full_name || message.profiles?.email || "Unknown")} · {new Date(message.created_at).toLocaleString()}
                    </div>
                    <div>{message.text}</div>
                    {message.attachments?.map((att) => <div key={att.id}>{renderAttachment(att)}</div>)}
                  </div>
                ))
              )}
            </div>
<form onSubmit={handleSend} className="composer">
  <textarea
    value={text}
    onChange={(e) => setText(e.target.value)}
    placeholder="Write your message..."
   onKeyDown={(e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    e.currentTarget.form?.requestSubmit();
  }
}}
/>
  
  <div className="row">
    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
    <button className="btn" disabled={sending}>
      {sending ? "Sending..." : "Send"}
    </button>
  </div>

  {file && <div className="small">Selected: {file.name}</div>}
  {notice && <div className="small">{notice}</div>}
</form>
          </main>

          <aside className="rightbar">
            <h3 style={{ marginTop: 0 }}>How to use</h3>
            <div className="grid">
              <div className="card"><strong>1. Pick a channel</strong><div className="small">Open design, clients, website, or general.</div></div>
              <div className="card"><strong>2. Send updates</strong><div className="small">Write message and upload photo/video/file.</div></div>
              <div className="card"><strong>3. Search later</strong><div className="small">Use search to find older messages fast.</div></div>
            </div>
          </aside>
        </div>
      </div>
    </AuthGuard>
  );
}
