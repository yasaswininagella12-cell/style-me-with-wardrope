"use client";

import { useFormStatus } from "react-dom";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/auth-actions";

export function SignOutButton({ className = "" }: { className?: string }) {
  return (
    <form action={logoutAction}>
      <button type="submit" className={className}>
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </button>
    </form>
  );
}

export function SignOutSpinner() {
  const { pending } = useFormStatus();
  return pending ? "Signing out…" : "Sign out";
}
