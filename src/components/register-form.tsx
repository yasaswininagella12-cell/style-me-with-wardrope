"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { registerAction, type AuthState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field-error";
import { GoogleButton } from "@/components/google-button";

const initialState: AuthState = {};

export function RegisterForm({ googleEnabled = false }: { googleEnabled?: boolean }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/onboarding";
  const [state, formAction, pending] = useActionState(registerAction, initialState);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Create your account</CardTitle>
        <CardDescription>
          Join free and start styling your wardrobe in minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {googleEnabled && (
          <>
            <GoogleButton callbackUrl={callbackUrl} />
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider text-muted-foreground">
                <span className="bg-background px-2">or</span>
              </div>
            </div>
          </>
        )}
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {state.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" placeholder="Your name" />
            {state.fieldErrors?.name && <FieldError messages={state.fieldErrors.name} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" />
            {state.fieldErrors?.email && <FieldError messages={state.fieldErrors.email} />}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
            {state.fieldErrors?.password && <FieldError messages={state.fieldErrors.password} />}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Creating account…" : "Create account"}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-medium text-primary hover:underline"
            >
              Log in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
