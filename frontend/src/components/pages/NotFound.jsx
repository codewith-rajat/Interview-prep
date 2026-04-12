import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl md:text-8xl font-bold text-emerald-500 mb-4">404</h1>
        <h2 className="text-2xl md:text-4xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-md">
          The page you're looking for doesn't exist. Let's get you back on track!
        </p>
        <div className="flex gap-4 justify-center flex-col sm:flex-row">
          <button
            onClick={() => navigate("/")}
            className="bg-emerald-500 hover:bg-emerald-600 text-black px-6 py-3 rounded-lg font-semibold transition"
          >
            🏠 Go Home
          </button>
          <button
            onClick={() => navigate(-1)}
            className="border border-emerald-500 text-emerald-400 px-6 py-3 rounded-lg font-semibold hover:bg-emerald-500/20 transition"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
