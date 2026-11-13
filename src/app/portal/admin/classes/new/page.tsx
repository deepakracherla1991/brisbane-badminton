import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/portal/auth";
import { ClassForm } from "@/components/portal/ClassForm";
import type { Term } from "@/lib/portal/types";

export const metadata: Metadata = { title: "New class" };

export default async function NewClassPage({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  await requireAdmin();
  const { term } = await searchParams;
  const supabase = await createClient();
  const { data: terms } = await supabase.from("terms").select("*").order("starts_on", { ascending: false }).returns<Term[]>();

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/portal/admin" className="text-sm text-zinc-400 hover:text-white">
        ← All classes
      </Link>
      <h1 className="mt-3 mb-6 text-4xl font-bold">New class</h1>
      {terms?.length ? (
        <div className="card p-6">
          <ClassForm terms={terms} defaultTermId={term} />
        </div>
      ) : (
        <p className="text-zinc-400">Create a term first on the admin page.</p>
      )}
    </div>
  );
}
