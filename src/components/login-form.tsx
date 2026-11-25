"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { loginAction, type AuthState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldError } from "@/components/ui/field-error";
import { GoogleButton } from "@/components/google-button";
import { cn } from "@/lib/utils";

const initialState: AuthState = {};

const inputClass =
  "h-12 rounded-[12px] border-[#EAE4D9] bg-white px-4 py-3 text-sm text-[#231815] shadow-sm placeholder:text-[#5A4A42]/40 focus-visible:border-[#D4AF37] focus-visible:ring-1 focus-visible:ring-[#D4AF37]";

export function LoginForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showResetHelp, setShowResetHelp] = useState(false);

  return (
    <div className="w-full max-w-[440px] py-8">
      <header className="mb-8 text-left">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.22em] text-[#C5A059]">
          Private Member Access
        </p>
        <h2 className="font-heading text-3xl tracking-tight text-[#231815] sm:text-4xl">
          Welcome back
        </h2>
        <p className="mt-2 text-sm font-light text-[#5A4A42]">
          Please enter your credentials to open your digital closet.
        </p>
      </header>

      {googleEnabled && (
        <>
          <GoogleButton
            callbackUrl={callbackUrl}
            className="h-12 rounded-[12px] border-[#EAE4D9] bg-white text-sm font-medium text-[#231815] shadow-sm hover:border-[#C5A059]/50 hover:bg-[#FBF9F5]"
          />
          <div className="relative my-6 flex items-center">
            <div className="grow border-t border-[#EAE4D9]" />
            <span className="mx-4 shrink-0 text-xs font-light uppercase tracking-widest text-[#5A4A42]/60">
              or
            </span>
            <div className="grow border-t border-[#EAE4D9]" />
          </div>
        </>
      )}

      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        {state.error && (
          <div
            className="rounded-[12px] border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            role="alert"
          >
            {state.error}
          </div>
        )}
        {showResetHelp && (
          <div className="rounded-[12px] border border-[#EAE4D9] bg-[#FDF9F0] px-4 py-3 text-xs text-[#5A4A42]">
            Password resets aren&apos;t available yet. Please contact support from the Report page.
          </div>
        )}
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#231815]"
          >
            Email address
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={inputClass}
          />
          {state.fieldErrors?.email && <FieldError messages={state.fieldErrors.email} />}
        </div>
        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-[#231815]"
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={cn(inputClass, "pr-12")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#5A4A42]/50 transition-colors hover:text-[#231815]"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {state.fieldErrors?.password && <FieldError messages={state.fieldErrors.password} />}
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" name="remember" className="accent-[#C5A059]" />
            <label
              htmlFor="remember"
              className="cursor-pointer select-none text-xs font-normal text-[#5A4A42]"
            >
              Remember me
            </label>
          </div>
          <button
            type="button"
            onClick={() => setShowResetHelp(true)}
            className="text-xs font-medium text-[#5A4A42] underline-offset-4 transition-colors hover:text-[#C5A059] hover:underline"
          >
            Forgot password?
          </button>
        </div>
        <div className="pt-2">
          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-[12px] bg-[#231815] py-3.5 text-sm font-medium tracking-wide text-[#FAF7F2] shadow-md transition-all hover:bg-[#1a1210] hover:shadow-lg"
          >
            {pending ? "Signing in…" : "Log in"}
            <ArrowRight className="text-[#D4AF37] transition-transform group-hover/button:translate-x-0.5" />
          </Button>
        </div>
      </form>

      <div className="mt-6 flex items-center justify-between gap-3 rounded-[12px] border border-[#EAE4D9]/80 bg-[#FDF9F0] px-3 py-3 text-xs text-[#5A4A42]">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-[#D4AF37]" />
          <span>
            Demo: <span className="font-medium text-[#231815]">user@example.com</span> / user123
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setEmail("user@example.com");
            setPassword("user123");
          }}
          className="shrink-0 text-[11px] font-medium uppercase tracking-wider text-[#C5A059] underline-offset-2 transition-colors hover:text-[#231815] hover:underline"
        >
          Auto-fill
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs font-light text-[#5A4A42]">
          New to Style Me With Wardrobe?{" "}
          <Link
            href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className="ml-1 font-medium text-[#231815] underline underline-offset-4 transition-colors hover:text-[#C5A059]"
          >
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center gap-4 text-[11px] text-[#5A4A42]/60">
        <Link href="/about" className="transition-colors hover:text-[#231815]">
          About
        </Link>
        <span>·</span>
        <Link href="/how-it-works" className="transition-colors hover:text-[#231815]">
          How it works
        </Link>
        <span>·</span>
        <Link href="/report" className="transition-colors hover:text-[#231815]">
          Support
        </Link>
      </div>
    </div>
  );
}
