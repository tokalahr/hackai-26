import { useState } from "react";

export function LoginPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="relative min-h-[70vh] pt-32 pb-16 px-6">
      <div className="absolute inset-0 bg-[#0D0D0F]" />
      <div className="relative z-10 container mx-auto max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-7 space-y-5">
          <h1 className="text-3xl font-bold text-white">Sign In</h1>
          <p className="text-sm text-gray-400">Placeholder page for future authentication.</p>

          {submitted ? (
            <div className="rounded-xl border border-[#00A8A8]/40 bg-[#00A8A8]/10 px-4 py-3 text-sm text-[#9bf5f5]">
              Auth is not connected yet. This UI is ready for integration.
            </div>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
              className="space-y-4"
            >
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Email</label>
                <input
                  type="email"
                  required
                  className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A8A8]/70"
                  placeholder="you@university.edu"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-gray-300">Password</label>
                <input
                  type="password"
                  required
                  className="w-full rounded-xl bg-black/25 border border-white/15 px-4 py-2.5 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F58025]/70"
                  placeholder="********"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl px-4 py-3 font-semibold text-white bg-gradient-to-r from-[#F58025] to-[#ff9447] hover:shadow-lg hover:shadow-[#F58025]/40 transition-all"
              >
                Continue
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
