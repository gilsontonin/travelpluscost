"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authBrowser } from "@/lib/auth";

interface Profile {
  email: string | null;
  founding_member: boolean;
  member_no: number | null;
  membership_status: string;
}

const PERKS = [
  { icon: "💰", title: "The member price", body: "Book at what the hotel charges us plus one small fee — typically 20–35% below the public rate, the same for everyone." },
  { icon: "🔒", title: "Founding rate, locked", body: "You keep the lowest membership rate we ever offer. Free now; it stays your rate when paid plans begin." },
  { icon: "🛡️", title: "No surveillance pricing", body: "Your price is never set from your device, location, or history. One honest number, every fee shown up front." },
];

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const sb = authBrowser();
    (async () => {
      const { data } = await sb.auth.getUser();
      if (!data.user) {
        router.replace("/join");
        return;
      }
      setEmail(data.user.email ?? null);
      const { data: p } = await sb.from("profiles").select("email,founding_member,member_no,membership_status").eq("id", data.user.id).maybeSingle();
      setProfile((p as Profile) ?? null);
      setLoading(false);
    })();
  }, [router]);

  async function signOut() {
    await authBrowser().auth.signOut();
    router.replace("/");
  }

  if (loading) return <div className="mx-auto max-w-2xl px-4 py-16 text-black/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Your membership</h1>

      {/* Status card */}
      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-tint p-5">
        <p className="font-semibold text-accent">
          {profile?.founding_member ? "✓ Founding member" : "Member"}
          {profile?.member_no ? ` · #${profile.member_no}` : ""}
        </p>
        <p className="mt-1 text-sm text-black/60">{email}</p>
        <p className="mt-3 text-sm text-black/80">
          You&apos;re in early — among the first to lock in the founding rate. Free until booking launches.
        </p>
      </div>

      {/* Perks */}
      <h2 className="mt-10 text-lg font-semibold">What your membership unlocks</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {PERKS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-black/10 p-4">
            <div className="text-xl">{p.icon}</div>
            <p className="mt-2 font-medium text-sm">{p.title}</p>
            <p className="mt-1 text-xs text-black/60 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>

      {/* What's next */}
      <div className="mt-8 rounded-2xl border border-black/10 bg-black/[0.02] p-5">
        <p className="font-medium text-sm">What&apos;s next</p>
        <p className="mt-1 text-sm text-black/70">
          Booking opens soon. We&apos;ll email you the moment members can book at the member price — your founding
          rate is already locked in. Until then, browse and save the stays you like.
        </p>
        <Link href="/hotels/honolulu" className="mt-3 inline-block text-accent font-medium text-sm hover:underline">
          Browse hotels →
        </Link>
      </div>

      <button onClick={signOut} className="mt-8 text-sm text-black/45 hover:text-black/80">
        Sign out
      </button>
    </div>
  );
}
