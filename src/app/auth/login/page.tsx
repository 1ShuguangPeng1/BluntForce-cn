import { LoginForm } from "@/components/auth/login-form";
import { PawPrint } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-sm items-center px-4">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10">
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            登录 BluntForce
          </h1>
          <p className="text-sm text-muted-foreground">
            欢迎回来，记录宠物的每一天
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
