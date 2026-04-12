import { Link } from "react-router-dom";

export default function Hello() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center p-6">
                <h1 className="text-5xl font-bold text-emerald-400 mb-6">
                    🎯 Interview Prep Platform
                </h1>
                
                <p className="text-gray-400 text-lg mb-8">
                    Connect with experienced interviewers, prepare for your dream job, and get real feedback.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link to="/login">
                        <button className="bg-emerald-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-emerald-400 transition">
                            Login
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="border border-emerald-500 text-emerald-400 px-8 py-3 rounded-lg font-semibold hover:bg-emerald-500/20 transition">
                            Signup
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    )
}