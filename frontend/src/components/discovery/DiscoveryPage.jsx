import { useState, useEffect } from "react";
import { Search, MapPin, Award, Star, Calendar } from "lucide-react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

const DiscoveryPage = () => {
  const [interviewers, setInterviewers] = useState([]);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const fetchInterviewers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/discovery/interviewers");
      setInterviewers(res.data);
      setFilteredInterviewers(res.data);
    } catch (err) {
      console.error("Failed to fetch interviewers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredInterviewers(interviewers);
      return;
    }

    const filtered = interviewers.filter(
      (interviewer) =>
        interviewer.name?.toLowerCase().includes(query.toLowerCase()) ||
        interviewer.title?.toLowerCase().includes(query.toLowerCase()) ||
        interviewer.company?.toLowerCase().includes(query.toLowerCase()) ||
        interviewer.expertise?.some((exp) =>
          exp.toLowerCase().includes(query.toLowerCase())
        )
    );

    setFilteredInterviewers(filtered);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-white/10 pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gray-400">Find your perfect </span>
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              interview mentor
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Browse experienced engineers and book your practice session
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-gradient-to-b from-[#0f0f11]/50 to-black border-b border-white/10 sticky top-16 z-40 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, title, company, or skill..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
            <p className="text-gray-400 mt-4">Loading interviewers...</p>
          </div>
        ) : filteredInterviewers.length > 0 ? (
          <div className="grid gap-6">
            {filteredInterviewers.map((interviewer) => (
              <div
                key={interviewer._id}
                className="bg-gradient-to-br from-[#1a1a1d] to-[#0f0f11] border border-white/10 hover:border-amber-500/50 rounded-xl p-6 transition duration-300 hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-3xl font-bold">
                      {interviewer.name?.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {interviewer.name}
                    </h3>
                    <p className="text-amber-400 font-semibold mb-2">
                      {interviewer.title}
                    </p>

                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-400">
                      {interviewer.company && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4" />
                          {interviewer.company}
                        </div>
                      )}
                      {interviewer.experience && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {interviewer.experience} yrs experience
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    <p className="text-gray-300 mb-4 line-clamp-2">
                      {interviewer.bio || "Experienced interview mentor"}
                    </p>

                    {/* Expertise */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {interviewer.expertise?.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm text-amber-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Rating and Button */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < (interviewer.rating || 4)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-400 ml-2">
                          {interviewer.rating || 4.0}/5 ({interviewer.reviewCount || 0} reviews)
                        </span>
                      </div>
                      <button
                        onClick={() => navigate(`/book-interview/${interviewer._id}`)}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-400 mb-2">No interviewers found</p>
            <p className="text-gray-500">
              Try adjusting your search terms or browse all mentors
            </p>
            <button
              onClick={() => handleSearch("")}
              className="mt-6 px-6 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscoveryPage;
