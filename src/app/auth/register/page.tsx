import { RegisterForm } from "@/components/auth/register-form";
import { PawPrint } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-sm items-center px-4">
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary/10">
            <PawPrint className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            注册 BluntForce
          </h1>
          <p className="text-sm text-muted-foreground">
            加入宠物主人们的温暖社区
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-apple">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
