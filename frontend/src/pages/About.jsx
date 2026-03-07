export default function About() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8 py-8">
      <h1 className="text-4xl font-extrabold text-blue-800">About UniLearn</h1>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-gray-700">Campus Section</h2>
        <p className="text-gray-600 leading-relaxed">
          Browse all university events, courses, and their locations in one
          place. Data is pulled live from the university API so you always have
          up-to-date information on what's happening on campus.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-gray-700">
          AI Learning Recommendations
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Our learning tool takes your current skill level, background, and
          implicit usage signals to build a personalised path. It can:
        </p>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Suggest your next learning steps with clear reasoning</li>
          <li>Highlight the key concepts you need to master</li>
          <li>Generate practice scenarios and example data</li>
          <li>Point you to relevant external resources and video snippets</li>
          <li>Visualise your learning journey as a concept map</li>
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-gray-700">Tech Stack</h2>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Frontend — React 19, Vite, Tailwind CSS v4, React Router v7</li>
          <li>Backend — FastAPI (Python), Uvicorn</li>
        </ul>
      </section>
    </div>
  )
}
