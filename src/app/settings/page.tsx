"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { updateProfile, getCurrentUserProfile } from "@/lib/actions/user";
import { UserAvatar } from "@/components/user/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login?redirect=/settings");
      return;
    }
    if (!user) return;

    let active = true;
    void getCurrentUserProfile().then((profile) => {
      if (!active || !profile) return;
      setUsername(profile.username);
      setBio(profile.bio ?? "");
      setAvatarUrl(profile.avatar_url);
    });
    return () => {
      active = false;
    };
  }, [user, loading, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      await updateProfile({ username, bio });
      setMessage("保存成功");
    } catch {
      setMessage("保存失败");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">设置</h1>
          <p className="text-sm text-muted-foreground">编辑你的个人资料</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <UserAvatar
              url={avatarUrl}
              fallback={user.email?.charAt(0).toUpperCase() ?? "U"}
              editable
              size="lg"
            />
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">用户名</label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="你的用户名"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">简介</label>
            <Input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下自己..."
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">邮箱</label>
            <Input value={user.email ?? ""} disabled className="text-muted-foreground" />
          </div>

          {message && (
            <p className={`text-sm ${message.includes("成功") ? "text-emerald-500" : "text-destructive"}`}>
              {message}
            </p>
          )}

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>
    </div>
  );
}
