export default function AuthPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-neutral-950 text-white px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 p-6 bg-black/40 backdrop-blur">
        <h1 className="text-xl font-bold">Вход в WILD</h1>

        <div className="mt-4">
          <a
            href="/api/auth/steam"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#1b2838] hover:bg-[#223247] border border-white/10 px-4 py-2 font-medium transition"
          >
            <svg width="18" height="18" viewBox="0 0 32 32" aria-hidden>
              <path fill="#fff" d="M21.5 3C15.71 3 11 7.71 11 13.5v.1L3.76 17.1A6.5 6.5 0 0 0 6.5 30a6.49 6.49 0 0 0 6.21-4.6l6.74-3.36c6.04-.2 10.55-5.27 10.55-11.54C30 7.15 26.35 3 21.5 3ZM6.5 27.5a4.5 4.5 0 0 1-3.9-6.77l4.17 1.7c.04 2.26 1.87 4.07 4.12 4.07c.28 0 .55-.03.81-.08A4.5 4.5 0 0 1 6.5 27.5Zm7.2-4.5a2.98 2.98 0 0 1-2.94-2.53l4 1.62c-.31.58-.9.93-1.06.91Zm7.8-5a5.5 5.5 0 1 1 0-11a5.5 5.5 0 0 1 0 11Zm0-2.5a3 3 0 1 0 0-6a3 3 0 0 0 0 6Z"/>
            </svg>
            Войти через Steam
          </a>
        </div>

        <div className="mt-6 text-center">
          <a href="/landing" className="text-sm text-neutral-300 hover:text-white">
            ← На лендинг
          </a>
        </div>
      </div>
    </div>
  );
}
