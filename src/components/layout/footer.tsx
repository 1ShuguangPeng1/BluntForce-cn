import { PawPrint } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PawPrint className="h-3.5 w-3.5" />
          <span>BluntForce</span>
        </div>
        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} BluntForce. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
