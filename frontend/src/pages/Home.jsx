import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <h1 className="text-5xl font-extrabold text-blue-800">
        Welcome to UniLearn
      </h1>
      <p className="text-lg text-gray-600 max-w-xl">
        Your one-stop platform for campus events, courses, and AI-powered
        personalised learning recommendations.
      </p>
      <div className="flex gap-4 mt-4">
        <Link
          to="/dashboard"
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link
          to="/about"
          className="border border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Learn More
        </Link>
      </div>
    </div>
  )
}
