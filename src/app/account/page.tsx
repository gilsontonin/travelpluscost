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
      // RLS lets a member read only their own row (anon key + self-read policy).
      const { data: p } = await sb.from("profiles").select("email,founding_member,member_no,membership_status").eq("id", data.user.id).maybeSingle();
      setProfile((p as Profile) ?? null);
      setLoading(false);
    })();
  }, [router]);

  async function signOut() {
    await authBrowser().auth.signOut();
    router.replace("/");
  }

  if (loading) return <div className="mx-auto max-w-xl px-4 py-16 text-black/50">Loading…</div>;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Your membership</h1>

      <div className="mt-6 rounded-2xl border border-accent/30 bg-accent-tint p-5">
        <p className="font-semibold text-accent">
          {profile?.founding_member ? "✓ Founding member" : "Member"}
          {profile?.member_no ? ` · #${profile.member_no}` : ""}
        </p>
        <p className="mt-1 text-sm text-black/70">{email}</p>
        <p className="mt-3 text-sm text-black/80">
          You&apos;ve locked in the founding rate. When booking launches, members book at our cost plus one small
          fee — typically <b>20–35% below the public rate</b>. Free until then.
        </p>
      </div>

      <div className="mt-6 flex items-center gap-4 text-sm">
        <Link href="/hotels/honolulu" className="text-accent font-medium hover:underline">
          Browse hotels →
        </Link>
        <button onClick={signOut} className="text-black/50 hover:text-black/80">
          Sign out
        </button>
      </div>
    </div>
  );
}
