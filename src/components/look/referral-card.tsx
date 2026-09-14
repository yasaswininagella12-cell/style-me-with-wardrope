"use client";

import { useState } from "react";
import { Check, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { referralCardImage, referralCardSvg } from "@/lib/referral-card";

export function ReferralCard({ outfitId }: { outfitId?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const link = `${window.location.origin}/looks/${outfitId ?? ""}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the link. Try again or copy it manually.");
    }
  }

  function download() {
    const blob = new Blob([referralCardSvg()], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refer-a-friend.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={referralCardImage()}
        alt="Refer a friend - share a look and you both earn a style credit"
        className="w-full max-w-[400px] rounded-3xl shadow-sm ring-1 ring-border"
      />
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={copyLink}>
          {copied ? (
            <Check className="mr-2 size-4" aria-hidden="true" />
          ) : (
            <Copy className="mr-2 size-4" aria-hidden="true" />
          )}
          {copied ? "Link copied" : "Copy referral link"}
        </Button>
        <Button type="button" variant="outline" onClick={download}>
          <Download className="mr-2 size-4" aria-hidden="true" />
          Download card
        </Button>
      </div>
    </div>
  );
}