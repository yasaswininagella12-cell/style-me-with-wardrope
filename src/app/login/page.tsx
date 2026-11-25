import type { Metadata } from "next";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { LoginForm } from "@/components/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to Style Me With Wardrobe.",
};

export default function LoginPage() {
  const googleEnabled =
    Boolean(process.env.GOOGLE_CLIENT_ID) && Boolean(process.env.GOOGLE_CLIENT_SECRET);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-[#FAF7F2] text-[#231815] lg:flex-row">
      <section className="relative flex min-h-[420px] flex-col justify-between overflow-hidden p-8 sm:p-12 lg:min-h-[calc(100vh-4rem)] lg:w-1/2 lg:p-16">
        <div className="absolute inset-0">
          <Image
            src="/login-editorial.jpg"
            alt="Curated minimal fashion styling"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover brightness-[0.96] contrast-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#231815]/90 via-[#231815]/35 to-black/20 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#231815]/40 to-transparent" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/40 bg-white/10 backdrop-blur-md">
            <Sparkles className="size-4 text-[#D4AF37]" aria-hidden="true" />
          </span>
          <span className="text-xs font-medium uppercase tracking-[0.28em] text-white/95">
            Style Me With Wardrobe
          </span>
        </div>

        <div className="relative z-10 mt-auto max-w-lg pt-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] uppercase tracking-widest text-[#D4AF37] backdrop-blur-md">
            <span className="size-1.5 rounded-full bg-[#D4AF37]" />
            Curated Atelier Experience
          </div>
          <h1 className="font-heading text-4xl leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Your wardrobe, <span className="font-light italic text-[#D4AF37]">styled.</span>
          </h1>
          <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-white/80 sm:text-base">
            Rediscover effortless capsule dressing and mindful personal curation, elevated with
            bespoke daily styling notes.
          </p>
        </div>
      </section>

      <section className="relative flex items-center justify-center p-6 sm:p-12 lg:w-1/2 lg:p-16">
        <LoginForm googleEnabled={googleEnabled} />
      </section>
    </div>
  );
}
