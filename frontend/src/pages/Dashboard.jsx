import { useEffect, useState } from 'react'

// ── Campus section ─────────────────────────────────────────────────────────
function CampusPanel() {
  const [events, setEvents] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/events').then((r) => r.json()),
      fetch('/api/courses').then((r) => r.json()),
    ])
      .then(([evData, coData]) => {
        setEvents(evData.events ?? [])
        setCourses(coData.courses ?? [])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-blue-800">Campus</h2>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">
          Upcoming Events
        </h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-gray-400 text-sm">No events found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border bg-white shadow-sm">
            {events.map((ev) => (
              <li key={ev.id} className="px-4 py-3">
                <p className="font-semibold">{ev.name}</p>
                <p className="text-sm text-gray-500">
                  {ev.date} · {ev.location}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Courses</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="text-gray-400 text-sm">No courses found.</p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-lg border bg-white shadow-sm">
            {courses.map((c) => (
              <li key={c.id} className="px-4 py-3">
                <p className="font-semibold">{c.title}</p>
                <p className="text-sm text-gray-500">{c.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

// ── Learning Tool section ───────────────────────────────────────────────────
const DEFAULT_PROFILE = {
  name: '',
  topic: '',
  current_level: '',
  background: '',
}

function LearningPanel() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) =>
    setProfile((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      setResult(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-blue-800">Learning Tool</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg border shadow-sm p-5 flex flex-col gap-4"
      >
        {[
          { name: 'name', label: 'Your Name', placeholder: 'e.g. Alex' },
          {
            name: 'topic',
            label: 'Topic to Learn',
            placeholder: 'e.g. Machine Learning',
          },
          {
            name: 'current_level',
            label: 'Current Level / Skills',
            placeholder: 'e.g. Python basics, no ML yet',
          },
        ].map(({ name, label, placeholder }) => (
          <div key={name} className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            <input
              name={name}
              value={profile[name]}
              onChange={handleChange}
              placeholder={placeholder}
              required
              className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        ))}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            Background / Goals
          </label>
          <textarea
            name="background"
            value={profile.background}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. I want to build recommendation systems for my job..."
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          {loading ? 'Generating…' : 'Get Recommendations'}
        </button>
      </form>

      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md px-4 py-2">
          {error}
        </p>
      )}

      {result && (
        <div className="bg-white rounded-lg border shadow-sm p-5 flex flex-col gap-4">
          <h3 className="font-bold text-lg text-blue-700">
            Recommendations for {result.learner}
          </h3>

          <div>
            <p className="text-sm font-semibold text-gray-600 mb-1">
              Next Steps
            </p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              {result.next_steps?.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          {result.key_concepts?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Key Concepts
              </p>
              <ul className="flex flex-wrap gap-2">
                {result.key_concepts.map((c, i) => (
                  <li
                    key={i}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.practice_scenario && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Practice Scenario
              </p>
              <p className="text-sm text-gray-700 bg-gray-50 rounded-md p-3 border">
                {result.practice_scenario}
              </p>
            </div>
          )}

          {result.external_resources?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                External Resources
              </p>
              <ul className="space-y-2">
                {result.external_resources.map((r, i) => (
                  <li key={i} className="text-sm">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {r.title}
                    </a>
                    {r.note && (
                      <span className="text-gray-500 ml-2">— {r.note}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// ── Dashboard page ──────────────────────────────────────────────────────────
export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <CampusPanel />
        <LearningPanel />
      </div>
    </div>
  )
}
