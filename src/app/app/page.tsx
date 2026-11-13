import type { Metadata } from "next";
import Image from "next/image";
import { Bell, CalendarDays, GraduationCap, MessageCircle, Smartphone, Zap } from "lucide-react";
import { InstallApp } from "@/components/InstallApp";
import { PageHero } from "@/components/ui";

export const metadata: Metadata = {
  title: "Get the app",
  description: "Add Brisbane Badminton to your phone's home screen for one-tap access to court booking, academy enrolments and more.",
};

const features = [
  { Icon: Zap, title: "One tap away", body: "Opens full screen from your home screen, just like any other app." },
  { Icon: CalendarDays, title: "Book a court", body: "Jump straight to live court availability." },
  { Icon: GraduationCap, title: "Your academy portal", body: "Enrol, check your classes and payments, and manage your students." },
  { Icon: MessageCircle, title: "Ask Birdie", body: "Quick answers about hours, prices and programs." },
];

export default function AppPage() {
  return (
    <>
      <PageHero
        eyebrow="Mobile app"
        title="Brisbane Badminton in your pocket"
        intro="Add the app to your phone's home screen. It's free, takes a few seconds, and needs no app store."
      />
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          <div className="card p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-4">
              <Image src="/icons/icon-192.png" alt="" width={72} height={72} className="rounded-2xl" />
              <div>
                <p className="font-display text-xl font-bold uppercase text-white">Badminton</p>
                <p className="text-sm text-zinc-400">Brisbane Badminton · Free</p>
              </div>
            </div>
            <InstallApp />
            <p className="mt-6 flex items-start gap-2 text-xs text-zinc-500">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              Works on iPhone, iPad and Android. Updates automatically, with no downloads.
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {features.map(({ Icon, title, body }) => (
              <li key={title} className="card p-5">
                <Icon className="h-6 w-6 text-brand-300" aria-hidden="true" />
                <h2 className="mt-3 text-lg font-bold">{title}</h2>
                <p className="mt-1 text-sm text-zinc-400">{body}</p>
              </li>
            ))}
            <li className="card flex gap-3 p-5 sm:col-span-2">
              <Bell className="h-6 w-6 shrink-0 text-zinc-500" aria-hidden="true" />
              <p className="text-sm text-zinc-400">
                Enrolment and waitlist updates arrive by email, so you won&apos;t miss a place opening up.
              </p>
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
