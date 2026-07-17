import { useNavigate } from "react-router-dom";
import { Users, Briefcase } from "lucide-react";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleSelectRole = (role) => {
    sessionStorage.setItem("selectedRole", role);
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
            <span className="text-gray-400">How do you want to use </span>
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Prept?</span>
          </h1>
          <p className="text-gray-400 mt-3 text-lg">Choose your path to ace interviews</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          
          <div
            onClick={() => handleSelectRole("interviewee")}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-[#1a1a1d] to-[#0f0f11] border border-amber-500/30 hover:border-amber-500/60 p-8 rounded-2xl transition duration-300 h-full flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/10">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition">
                  <Users className="w-8 h-8 text-amber-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">I want to Practice</h2>
                
                <p className="text-gray-400 text-base leading-relaxed mb-6">
                  Get interview experience by practicing with experienced engineers. Improve your skills, get real-time feedback, and build confidence.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-gray-300 text-sm">Practice with real engineers</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-gray-300 text-sm">Get detailed AI feedback</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-gray-300 text-sm">Build interview confidence</span>
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-3 rounded-lg transition duration-200 group-hover:shadow-lg group-hover:shadow-amber-500/20">
                Get Started
              </button>
            </div>
          </div>

          <div
            onClick={() => handleSelectRole("interviewer")}
            className="group cursor-pointer"
          >
            <div className="bg-gradient-to-br from-[#1a1a1d] to-[#0f0f11] border border-amber-500/30 hover:border-amber-500/60 p-8 rounded-2xl transition duration-300 h-full flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/10">
              <div>
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl flex items-center justify-center mb-6 group-hover:from-amber-500/30 group-hover:to-amber-600/20 transition">
                  <Briefcase className="w-8 h-8 text-amber-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-3">I want to Interview</h2>
                
                <p className="text-gray-400 text-base leading-relaxed mb-6">
                  Conduct interviews and help others prepare. Earn credits by sharing your expertise and building your professional network.
                </p>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-gray-300 text-sm">Earn credits per session</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-gray-300 text-sm">Flexible scheduling</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-amber-400 font-bold">✓</span>
                    <span className="text-gray-300 text-sm">Help shape the next generation</span>
                  </div>
                </div>
              </div>

              <button className="mt-8 w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-3 rounded-lg transition duration-200 group-hover:shadow-lg group-hover:shadow-amber-500/20">
                Get Started
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          Already have an account? <a href="/login" className="text-amber-400 hover:text-amber-300 font-semibold">Sign In</a>
        </p>
      </div>
    </div>
  );
};

export default RoleSelection;
