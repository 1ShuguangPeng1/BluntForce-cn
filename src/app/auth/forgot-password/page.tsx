"use client";

import { useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PawPrint, Mail, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("请输入邮箱地址");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "发送失败，请重试";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-sm items-center px-4">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10">
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            找回密码
          </h1>
          <p className="text-sm text-muted-foreground">
            {sent ? "邮件已发送，请查收" : "输入邮箱地址，我们将发送重置链接"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          {sent ? (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10">
                <Mail className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                密码重置链接已发送至 <span className="font-medium text-foreground">{email}</span>
              </p>
              <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                <ArrowLeft className="h-3.5 w-3.5" />
                返回登录
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  邮箱
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "发送中..." : "发送重置链接"}
              </Button>
              <p className="text-center">
                <Link href="/auth/login" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  返回登录
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
