import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="eyebrow mb-4">404</p>
      <h1 className="text-5xl font-bold sm:text-7xl">Out of bounds</h1>
      <p className="mt-4 max-w-md text-zinc-400">That page landed outside the lines. It may have moved or no longer exists.</p>
      <div className="mt-8">
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </section>
  );
}
