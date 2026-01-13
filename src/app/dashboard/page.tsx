import { cookies } from "next/headers";

export default async function Dashboard() {
  const cookieStore = await cookies(); // <-- важно: await
  const user = cookieStore.get("wild_user")?.value ?? "Гость";

  async function logoutAction() {
    "use server";
    await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/auth/logout`,
      { method: "POST", cache: "no-store" }
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white px-4 py-10">
      <div className="mx-auto max-w-[1082px]">
        <h1 className="text-3xl font-bold">Личный кабинет</h1>
        <p className="mt-2 text-neutral-300">
          Вы вошли как: <span className="font-medium">{user}</span>
        </p>

        <form action={logoutAction} className="mt-6">
          <button className="rounded-xl border border-white/15 px-4 py-2 hover:bg-white/10 transition">
            Выйти
          </button>
        </form>

        <div className="mt-8">
          <a href="/landing" className="text-sm text-neutral-300 hover:text-white">
            ← На лендинг
          </a>
        </div>
      </div>
    </div>
  );
}
