import { useState } from 'react'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: wire to /api/auth once auth is implemented
    setSubmitted(true)
  }

  return (
    <div className="flex justify-center items-start py-16">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md border p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-extrabold text-blue-800 text-center">
          Sign In
        </h1>

        {submitted ? (
          <p className="text-green-600 text-center text-sm font-medium">
            Auth not yet implemented — scaffold only.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@university.edu"
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 rounded-lg transition-colors mt-2"
            >
              Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
