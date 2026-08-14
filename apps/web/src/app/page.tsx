import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-2xl">
        <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-5xl font-bold text-transparent">
          Gamer CV
        </h1>
        <p className="mt-4 text-lg text-slate-400">
          Transformez votre parcours de joueur en un CV élégant.
          Local-first, sans compte requis.
        </p>
        <Link
          href="/create"
          className="mt-8 inline-block rounded-lg bg-violet-600 px-8 py-3 font-medium text-white transition hover:bg-violet-500"
        >
          Créer mon Gamer CV →
        </Link>
      </div>
    </main>
  );
}
