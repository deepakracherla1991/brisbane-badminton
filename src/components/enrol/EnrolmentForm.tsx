"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronLeft, ChevronRight, Copy, FileText, Loader2, Upload, X } from "lucide-react";
import {
  advancedSession,
  bankDetails,
  enrolmentTerm,
  familyDiscountNote,
  importantNotes,
  kidsSessions,
  paymentMethods,
  paymentReference,
  playerOptions,
  plans,
  programs,
  siblingOptions,
  uploadLimits,
  type ProgramId,
} from "@/content/enrolment";
import { ageOn, emptyEnrolment, normalise, plansFor, sessionLabel, STEPS, validateStep, type EnrolmentInput, type Errors } from "@/lib/enrolment/validate";
import { createClient } from "@/lib/supabase/client";
import { submitEnrolment, type SubmitResult } from "@/app/academy/enrol/actions";

const DRAFT_KEY = "bb-enrol-draft-v1";
const money = (cents: number) => `$${(cents / 100).toLocaleString("en-AU", { minimumFractionDigits: cents % 100 ? 2 : 0 })}`;

const input =
  "mt-1.5 w-full rounded-lg border bg-ink px-3.5 py-2.5 text-white placeholder:text-zinc-500 focus:border-brand-300 focus:outline-none";
const border = (err?: string) => (err ? "border-brand" : "border-line");

type UploadItem = { key: string; name: string; size: number; path?: string; status: "uploading" | "done" | "error"; error?: string };

function Field({ label, hint, error, required, children }: { label: string; hint?: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-zinc-200">
        {label}
        {required && <span className="text-brand-300"> *</span>}
      </span>
      {hint && <span className="mt-0.5 block text-xs text-zinc-500">{hint}</span>}
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-300">{error}</span>}
    </label>
  );
}

function Select({ value, onChange, options, placeholder, error }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; placeholder: string; error?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`${input} ${border(error)}`} aria-invalid={!!error}>
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-white/10 hover:text-white"
      aria-label={`Copy ${text}`}
    >
      {done ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {done ? "Copied" : "Copy"}
    </button>
  );
}

function BankDetails({ playerName }: { playerName: string }) {
  const rows = [
    ["Account name", bankDetails.accountName],
    ["BSB", bankDetails.bsb],
    ["Account number", bankDetails.accountNumber],
    ["Reference", paymentReference(playerName)],
  ];
  return (
    <dl className="divide-y divide-line rounded-xl border border-line bg-ink">
      {rows.map(([k, val]) => (
        <div key={k} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
          <dt className="text-zinc-400">{k}</dt>
          <dd className="flex items-center gap-2 text-right font-medium text-white">
            {val}
            <CopyButton text={val} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function EnrolmentForm({ prefill }: { prefill?: { name: string; email: string; phone: string } }) {
  const [v, setV] = useState<EnrolmentInput>(emptyEnrolment);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Errors>({});
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [result, setResult] = useState<Extract<SubmitResult, { ok: true }> | null>(null);
  const [website, setWebsite] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  // Restore a saved draft (without files) and start a fresh upload folder.
  useEffect(() => {
    let draft: Partial<EnrolmentInput> = {};
    try {
      draft = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "{}");
    } catch {}
    setV((cur) => ({
      ...cur,
      ...draft,
      player: { ...cur.player, ...draft.player },
      parent: {
        ...cur.parent,
        ...(prefill ? { name: prefill.name, email: prefill.email, mobile: prefill.phone } : {}),
        ...Object.fromEntries(Object.entries(draft.parent ?? {}).filter(([, val]) => val)),
      },
      uploadId: crypto.randomUUID(),
      files: [],
      agree: false,
    }));
    loaded.current = true;
  }, [prefill]);

  useEffect(() => {
    if (!loaded.current || result) return;
    try {
      const { files, uploadId, agree, ...draft } = v;
      void files;
      void uploadId;
      void agree;
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [v, result]);

  const set = <K extends keyof EnrolmentInput>(key: K, value: EnrolmentInput[K]) => {
    setV((cur) => ({ ...cur, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const setPlayer = (key: keyof EnrolmentInput["player"], value: string) => {
    setV((cur) => ({ ...cur, player: { ...cur.player, [key]: value } }));
    setErrors((e) => ({ ...e, [`player.${key}`]: undefined }));
  };
  const setParent = (key: keyof EnrolmentInput["parent"], value: string) => {
    setV((cur) => ({ ...cur, parent: { ...cur.parent, [key]: value } }));
    setErrors((e) => ({ ...e, [`parent.${key}`]: undefined }));
  };

  const { planId, sessions, price } = useMemo(() => normalise(v), [v]);
  const plan = plans.find((p) => p.id === planId);
  const age = ageOn(v.player.dob);
  const method = paymentMethods.find((m) => m.id === v.paymentMethod);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  function next() {
    const e = validateStep(step, v);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    scrollTop();
  }

  async function onFiles(list: FileList | null) {
    if (!list) return;
    const room = uploadLimits.maxFiles - uploads.filter((u) => u.status !== "error").length;
    const files = [...list].slice(0, Math.max(0, room));
    const supabase = createClient();
    for (const file of files) {
      const key = crypto.randomUUID();
      const okType = uploadLimits.accept.includes(file.type) || /\.(heic|heif)$/i.test(file.name);
      if (!okType || file.size > uploadLimits.maxBytes) {
        setUploads((u) => [...u, { key, name: file.name, size: file.size, status: "error", error: !okType ? "Use a photo or PDF." : "Max 10 MB per file." }]);
        continue;
      }
      setUploads((u) => [...u, { key, name: file.name, size: file.size, status: "uploading" }]);
      const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").slice(-60);
      const path = `applications/${v.uploadId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from("enrolment-uploads").upload(path, file, { contentType: file.type || undefined, upsert: false });
      setUploads((u) => u.map((x) => (x.key === key ? { ...x, status: error ? "error" : "done", path, error: error ? "Upload failed. Try again." : undefined } : x)));
      if (!error) {
        setV((cur) => ({ ...cur, files: [...cur.files, path] }));
        setErrors((e) => ({ ...e, files: undefined }));
      }
    }
  }

  function removeUpload(item: UploadItem) {
    setUploads((u) => u.filter((x) => x.key !== item.key));
    if (item.path) setV((cur) => ({ ...cur, files: cur.files.filter((f) => f !== item.path) }));
  }

  async function submit() {
    const e = validateStep(3, v);
    setErrors(e);
    if (Object.keys(e).length) return;
    if (uploads.some((u) => u.status === "uploading")) return setFormError("Please wait for your files to finish uploading.");
    setSubmitting(true);
    setFormError(null);
    const res = await submitEnrolment({ ...v, website }).catch(() => ({ ok: false, error: "Something went wrong. Please try again." }) as SubmitResult);
    setSubmitting(false);
    if (res.ok) {
      setResult(res);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      scrollTop();
      return;
    }
    setFormError(res.error);
    if (res.errors) {
      setErrors(res.errors);
      const firstStep = STEPS.findIndex((_, i) => Object.keys(validateStep(i, v)).length > 0);
      if (firstStep >= 0 && firstStep !== 3) setStep(firstStep);
    }
  }

  function enrolSibling() {
    setV((cur) => ({
      ...emptyEnrolment,
      program: cur.program,
      planId: cur.planId,
      parent: cur.parent,
      paymentMethod: cur.paymentMethod,
      siblingOrder: Math.min(3, cur.siblingOrder + 1),
      uploadId: crypto.randomUUID(),
    }));
    setUploads([]);
    setResult(null);
    setStep(0);
    scrollTop();
  }

  if (!enrolmentTerm.open) {
    return (
      <div className="card p-8 text-center">
        <h2 className="text-2xl font-bold">Enrolments are closed</h2>
        <p className="mt-2 text-zinc-400">Enrolments for {enrolmentTerm.name} have closed. Please contact us about next term.</p>
      </div>
    );
  }

  if (result) {
    return (
      <div ref={topRef} className="card mx-auto max-w-2xl scroll-mt-24 p-6 text-center sm:p-10">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" aria-hidden="true" />
        <h2 className="mt-4 text-3xl font-bold">Enrolment received!</h2>
        <p className="mt-2 text-zinc-300">
          Thanks! We&apos;ve emailed a copy to <span className="text-white">{v.parent.email}</span>. Our team will check your payment and confirm the
          session placement.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-2xl border border-line bg-ink p-5">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Your reference</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-wider text-white">{result.reference}</p>
          {result.totalCents != null && <p className="mt-2 text-sm text-zinc-400">Total {money(result.totalCents)}</p>}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={enrolSibling} className="rounded-full bg-brand px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-600">
            Enrol a sibling
          </button>
          <Link href="/academy" className="rounded-full border border-white/25 px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/5">
            Back to academy
          </Link>
        </div>
      </div>
    );
  }

  const kidsPlanOptions = plansFor("kids").map((p) => ({ value: p.id, label: `${p.name} – ${money(p.priceCents)}${p.id.startsWith("double") ? " total" : "/term"}` }));

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* Progress */}
      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="Enrolment steps">
        {STEPS.map((label, i) => (
          <li key={label}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => i < step && setStep(i)}
              className="w-full text-left disabled:cursor-default"
              aria-current={i === step ? "step" : undefined}
            >
              <span className={`block h-1.5 rounded-full ${i <= step ? "bg-brand" : "bg-white/10"}`} />
              <span className={`mt-2 hidden text-xs uppercase tracking-wider sm:block ${i === step ? "text-white" : "text-zinc-500"}`}>
                {i + 1}. {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <p className="mb-4 text-sm text-zinc-400 sm:hidden">
        Step {step + 1} of {STEPS.length}: <span className="text-white">{STEPS[step]}</span>
      </p>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="card p-5 sm:p-8">
          {/* Honeypot */}
          <input type="text" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} className="hidden" aria-hidden="true" />

          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Program selection</h2>
                <p className="mt-1 text-sm text-zinc-400">Choose the training program, your preferred sessions and a training plan.</p>
              </div>

              <Field label="Program" required error={errors.program}>
                <Select
                  value={v.program}
                  onChange={(val) => {
                    set("program", val as ProgramId);
                    set("sessions", []);
                    set("planId", "");
                  }}
                  placeholder="Choose a program…"
                  options={programs.map((p) => ({ value: p.id, label: p.name }))}
                  error={errors.program}
                />
              </Field>
              {v.program && <p className="-mt-3 text-sm text-zinc-400">{programs.find((p) => p.id === v.program)?.description}</p>}

              {v.program === "kids" && (
                <>
                  <Field label="Training plan" required error={errors.planId}>
                    <Select value={v.planId} onChange={(val) => set("planId", val)} placeholder="Choose a training plan…" options={kidsPlanOptions} error={errors.planId} />
                  </Field>
                  {plan && <p className="-mt-3 text-sm text-zinc-400">{plan.summary}</p>}
                </>
              )}

              {(v.program === "kids" || v.program === "trial") && (
                <fieldset>
                  <legend className="text-sm font-medium text-zinc-200">
                    {v.program === "trial" ? "Trial session" : "Preferred sessions"} <span className="text-brand-300">*</span>
                  </legend>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {v.program === "trial"
                      ? "Choose one session to try."
                      : `Select all sessions you'd like to attend${plan && plan.minSessions > 1 ? ` (at least ${plan.minSessions})` : ""}. Final placement is subject to availability and coach approval.`}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {kidsSessions.map((s) => {
                      const checked = v.sessions.includes(s.id);
                      const full = s.status === "full";
                      return (
                        <label
                          key={s.id}
                          className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors ${
                            full ? "cursor-not-allowed border-line opacity-50" : checked ? "border-brand bg-brand/10" : "border-line hover:border-white/30"
                          }`}
                        >
                          <input
                            type={v.program === "trial" ? "radio" : "checkbox"}
                            name="session"
                            disabled={full}
                            checked={checked}
                            onChange={() =>
                              set(
                                "sessions",
                                v.program === "trial" ? [s.id] : checked ? v.sessions.filter((x) => x !== s.id) : [...v.sessions, s.id],
                              )
                            }
                            className="mt-1 h-4 w-4 accent-[#d92027]"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium text-white">
                              {s.day} · {s.time}
                            </span>
                            <span className="block text-sm text-zinc-400">{s.level}</span>
                            {s.status !== "open" && (
                              <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${full ? "bg-white/10 text-zinc-300" : "bg-amber-500/15 text-amber-300"}`}>
                                {full ? "Class full" : "Limited spots"}
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.sessions && <p className="mt-2 text-sm text-red-300">{errors.sessions}</p>}
                </fieldset>
              )}

              {v.program === "advanced" && (
                <>
                  <div className="rounded-xl border border-line bg-ink p-4">
                    <p className="text-xs uppercase tracking-widest text-zinc-500">Session</p>
                    <p className="mt-1 font-medium text-white">
                      {advancedSession.day} · {advancedSession.time}
                    </p>
                    <p className="text-sm text-zinc-400">Advanced Squad – $525/term · 10 lessons</p>
                  </div>
                  <fieldset>
                    <legend className="text-sm font-medium text-zinc-200">
                      Have you been invited by a coach to join the Advanced Squad? <span className="text-brand-300">*</span>
                    </legend>
                    <div className="mt-2 flex gap-2">
                      {(["yes", "no"] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => set("invitedByCoach", opt)}
                          className={`rounded-full border px-5 py-2 text-sm capitalize ${v.invitedByCoach === opt ? "border-brand bg-brand text-white" : "border-line text-zinc-300 hover:border-white/40"}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                    {errors.invitedByCoach && <p className="mt-2 text-sm text-red-300">{errors.invitedByCoach}</p>}
                    {v.invitedByCoach === "no" && (
                      <p className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">
                        The Advanced Squad is invite only. You can still submit and a coach will be in touch, or choose Kids Group Training instead.
                      </p>
                    )}
                  </fieldset>
                </>
              )}

              {plan?.familyDiscount && (
                <Field label="Family discount" hint={familyDiscountNote} error={errors.siblingOrder}>
                  <Select
                    value={String(v.siblingOrder)}
                    onChange={(val) => set("siblingOrder", Number(val))}
                    placeholder="Choose…"
                    options={siblingOptions.map((s) => ({ value: String(s.value), label: s.label }))}
                  />
                </Field>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Player information</h2>
                <p className="mt-1 text-sm text-zinc-400">Please provide the player&apos;s details.</p>
              </div>
              <Field label="Player full name" required error={errors["player.name"]}>
                <input value={v.player.name} onChange={(e) => setPlayer("name", e.target.value)} maxLength={120} autoComplete="off" className={`${input} ${border(errors["player.name"])}`} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Date of birth" required error={errors["player.dob"]}>
                  <input type="date" value={v.player.dob} onChange={(e) => setPlayer("dob", e.target.value)} max={new Date().toISOString().slice(0, 10)} className={`${input} ${border(errors["player.dob"])}`} />
                </Field>
                <Field label="Age">
                  <input value={age != null && age >= 0 ? `${age} years` : ""} readOnly placeholder="Calculated from date of birth" className={`${input} border-line text-zinc-300`} tabIndex={-1} />
                </Field>
                <Field label="Gender" hint="Useful for competitions and reporting" error={errors["player.gender"]}>
                  <Select value={v.player.gender} onChange={(val) => setPlayer("gender", val)} placeholder="Choose…" options={playerOptions.gender.map((o) => ({ value: o, label: o }))} />
                </Field>
                <Field label="Current playing level" required error={errors["player.level"]}>
                  <Select value={v.player.level} onChange={(val) => setPlayer("level", val)} placeholder="Choose…" options={playerOptions.level.map((o) => ({ value: o, label: o }))} error={errors["player.level"]} />
                </Field>
                <Field label="Previous badminton experience" required error={errors["player.experience"]}>
                  <Select value={v.player.experience} onChange={(val) => setPlayer("experience", val)} placeholder="Choose…" options={playerOptions.experience.map((o) => ({ value: o, label: o }))} error={errors["player.experience"]} />
                </Field>
                <Field label="How did you hear about us?" error={errors["player.heardFrom"]}>
                  <Select value={v.player.heardFrom} onChange={(val) => setPlayer("heardFrom", val)} placeholder="Choose…" options={playerOptions.heardFrom.map((o) => ({ value: o, label: o }))} />
                </Field>
              </div>
              <Field label="Medical conditions / injuries / allergies" hint='Write "None" if not applicable.' required error={errors["player.medical"]}>
                <textarea rows={3} value={v.player.medical} onChange={(e) => setPlayer("medical", e.target.value)} maxLength={1000} className={`${input} ${border(errors["player.medical"])}`} />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-bold">Parent / guardian details</h2>
                <p className="mt-1 text-sm text-zinc-400">Primary contact details for academy communication and emergencies. Adult players can enter their own details.</p>
              </div>
              <Field label="Parent / guardian full name" required error={errors["parent.name"]}>
                <input value={v.parent.name} onChange={(e) => setParent("name", e.target.value)} maxLength={120} autoComplete="name" className={`${input} ${border(errors["parent.name"])}`} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Mobile number" required error={errors["parent.mobile"]}>
                  <input type="tel" value={v.parent.mobile} onChange={(e) => setParent("mobile", e.target.value)} maxLength={30} autoComplete="tel" placeholder="04xx xxx xxx" className={`${input} ${border(errors["parent.mobile"])}`} />
                </Field>
                <Field label="Email address" hint="Enrolment confirmations and academy updates go here." required error={errors["parent.email"]}>
                  <input type="email" value={v.parent.email} onChange={(e) => setParent("email", e.target.value)} maxLength={254} autoComplete="email" className={`${input} ${border(errors["parent.email"])}`} />
                </Field>
                <Field label="Emergency contact name / number" required error={errors["parent.emergency"]}>
                  <input value={v.parent.emergency} onChange={(e) => setParent("emergency", e.target.value)} maxLength={160} placeholder="e.g. Jane Smith 0400 000 000" className={`${input} ${border(errors["parent.emergency"])}`} />
                </Field>
                <Field label="Suburb" required error={errors["parent.suburb"]}>
                  <input value={v.parent.suburb} onChange={(e) => setParent("suburb", e.target.value)} maxLength={80} autoComplete="address-level2" className={`${input} ${border(errors["parent.suburb"])}`} />
                </Field>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold">Payment</h2>
                <p className="mt-1 text-sm text-zinc-400">Complete payment, then upload your receipt or PlayOn voucher before submitting.</p>
              </div>

              <div className="rounded-xl border border-brand/40 bg-brand/5 p-4">
                <p className="text-sm text-zinc-300">Amount to pay</p>
                <p className="font-display text-3xl font-bold text-white">{price?.total != null ? money(price.total) : "Confirmed by our team"}</p>
                {!!price?.discount && <p className="text-sm text-emerald-300">Includes family discount of {money(price.discount)}</p>}
              </div>

              <Field label="Payment method" required error={errors.paymentMethod}>
                <Select value={v.paymentMethod} onChange={(val) => set("paymentMethod", val as EnrolmentInput["paymentMethod"])} placeholder="Choose…" options={paymentMethods.map((m) => ({ value: m.id, label: m.label }))} error={errors.paymentMethod} />
              </Field>

              {(v.paymentMethod === "bank" || v.paymentMethod === "playon-bank") && (
                <div>
                  <p className="mb-2 text-sm font-medium text-zinc-200">Bank transfer details</p>
                  <BankDetails playerName={v.player.name} />
                  <p className="mt-2 text-xs text-zinc-500">Please use the reference shown (student name + term) so we can match your payment.</p>
                </div>
              )}

              {method?.needsVoucher && (
                <Field label="PlayOn voucher number" required error={errors.voucher}>
                  <input value={v.voucher} onChange={(e) => set("voucher", e.target.value)} maxLength={60} className={`${input} ${border(errors.voucher)}`} />
                </Field>
              )}

              <div>
                <p className="text-sm font-medium text-zinc-200">
                  Upload payment receipt / PlayOn voucher <span className="text-brand-300">*</span>
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">Photos or PDF, up to {uploadLimits.maxFiles} files, 10 MB each.</p>
                <label className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center hover:border-white/40 ${errors.files ? "border-brand" : "border-line"}`}>
                  <Upload className="h-6 w-6 text-brand-300" aria-hidden="true" />
                  <span className="text-sm text-zinc-300">Tap to choose files</span>
                  <input
                    type="file"
                    multiple
                    accept={[...uploadLimits.accept, ".heic", ".heif"].join(",")}
                    className="sr-only"
                    onChange={(e) => {
                      onFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {uploads.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {uploads.map((u) => (
                      <li key={u.key} className="flex items-center gap-3 rounded-lg border border-line bg-ink px-3 py-2 text-sm">
                        {u.status === "uploading" ? (
                          <Loader2 className="h-4 w-4 animate-spin text-zinc-400" aria-hidden="true" />
                        ) : u.status === "done" ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                        ) : (
                          <FileText className="h-4 w-4 text-red-300" aria-hidden="true" />
                        )}
                        <span className="min-w-0 flex-1 truncate text-zinc-200">{u.name}</span>
                        {u.error && <span className="text-xs text-red-300">{u.error}</span>}
                        <button type="button" onClick={() => removeUpload(u)} aria-label={`Remove ${u.name}`} className="rounded p-1 text-zinc-400 hover:bg-white/10 hover:text-white">
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.files && <p className="mt-2 text-sm text-red-300">{errors.files}</p>}
              </div>

              <div className="rounded-xl border border-line bg-ink p-4">
                <p className="text-sm font-medium text-white">Important notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                  {importantNotes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
                <label className="mt-4 flex items-start gap-3 text-sm text-zinc-200">
                  <input type="checkbox" checked={v.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-0.5 h-4 w-4 accent-[#d92027]" />
                  I have read and agree to the important notes above.
                </label>
                {errors.agree && <p className="mt-2 text-sm text-red-300">{errors.agree}</p>}
              </div>
            </div>
          )}

          {formError && (
            <p role="alert" className="mt-6 rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-red-200">
              {formError}
            </p>
          )}

          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            {step > 0 ? (
              <button type="button" onClick={() => (setStep((s) => s - 1), scrollTop())} className="inline-flex items-center gap-1 rounded-full px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white">
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <span />
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" onClick={next} className="inline-flex items-center gap-1 rounded-full bg-brand px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-600">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 font-display text-sm font-semibold uppercase tracking-wider text-white hover:bg-brand-600 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {submitting ? "Submitting…" : "Submit enrolment"}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <aside className="card p-5 lg:sticky lg:top-24">
          <p className="text-xs uppercase tracking-widest text-zinc-500">Your enrolment</p>
          <p className="mt-1 font-display text-lg font-bold uppercase text-white">{enrolmentTerm.name}</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Program</dt>
              <dd className="text-zinc-200">{programs.find((p) => p.id === v.program)?.name ?? "—"}</dd>
            </div>
            {v.program !== "trial" && (
              <div>
                <dt className="text-zinc-500">Plan</dt>
                <dd className="text-zinc-200">{plan?.name ?? "—"}</dd>
              </div>
            )}
            <div>
              <dt className="text-zinc-500">Sessions</dt>
              <dd className="text-zinc-200">
                {sessions.length ? (
                  <ul className="space-y-0.5">
                    {sessions.map((s) => (
                      <li key={s}>{sessionLabel(s).split(" | ")[0]}</li>
                    ))}
                  </ul>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            {v.player.name && (
              <div>
                <dt className="text-zinc-500">Player</dt>
                <dd className="text-zinc-200">{v.player.name}</dd>
              </div>
            )}
          </dl>
          <div className="mt-4 border-t border-line pt-4">
            {!!price?.discount && (
              <p className="flex justify-between text-sm text-emerald-300">
                <span>Family discount</span>
                <span>−{money(price.discount)}</span>
              </p>
            )}
            <p className="mt-1 flex items-baseline justify-between">
              <span className="text-sm text-zinc-400">Total</span>
              <span className="font-display text-2xl font-bold text-white">
                {price?.total != null ? money(price.total) : v.program === "trial" ? "TBC" : "—"}
              </span>
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
