import type { Metadata } from "next";
import { RegisterForm } from "@/components/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create your Style Me With Wardrobe account.",
};

export default function RegisterPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <RegisterForm googleEnabled={googleEnabled} />
    </div>
  );
}
