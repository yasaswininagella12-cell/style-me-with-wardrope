import type { Metadata } from "next";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Style Me With Wardrobe.",
};

export default function LoginPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <LoginForm googleEnabled={googleEnabled} />
    </div>
  );
}
