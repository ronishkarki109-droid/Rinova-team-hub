"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CreateChannelForm({ onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMsg("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      setMsg("You must be logged in.");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("channels").insert({
      name,
      description,
      created_by: user.id
    });

    if (error) {
      setMsg(error.message);
    } else {
      setName("");
      setDescription("");
      setMsg("Channel created.");
      if (onCreated) onCreated();
    }

    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 style={{ marginTop: 0 }}>Create Channel</h3>
      <div className="field">
        <label>Channel name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="general" required />
      </div>
      <div className="field">
        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Main team discussion" />
      </div>
      <button className="btn" disabled={saving}>{saving ? "Creating..." : "Create"}</button>
      {msg && <p className="small">{msg}</p>}
    </form>
  );
}
