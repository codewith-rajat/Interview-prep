import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UpcomingBookings from "./UpcomingBookings";
import PastInterviews from "./PastInterviews";
import API from "../../utils/api";
import { Search, Briefcase, Award, Code } from "lucide-react";

export default function IntervieweeDashboard() {
  const [filters, setFilters] = useState({
    name: "",
    company: "",
    skills: "",
    experience: "",
  });

  const [interviewers, setInterviewers] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewers = async () => {
      try {
        setLoading(true);
        const res = await API.get("/discovery/interviewers");
        setInterviewers(res.data.data);
        setFilteredData(res.data.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviewers();
  }, []);

  useEffect(() => {
    let result = [...interviewers];

    if (filters.name) {
      result = result.filter((user) =>
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.company) {
      result = result.filter((user) =>
        user.workingAt.toLowerCase().includes(filters.company.toLowerCase())
      );
    }

    if (filters.skills) {
      const skillArray = filters.skills
        .toLowerCase()
        .split(",")
        .map((s) => s.trim());
      result = result.filter((user) =>
        skillArray.some((skill) => user.skills.includes(skill))
      );
    }

    if (filters.experience) {
      result = result.filter(
        (user) => user.yearsOfExperience >= Number(filters.experience)
      );
    }

    setFilteredData(result);
  }, [filters, interviewers]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* HEADER */}
      <div className="border-b border-white/10 px-6 sm:px-8 py-10">
        <div className="max-w-6xl mx-auto">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-[0.14em] uppercase mb-4">
            <span className="w-4 h-px bg-amber-400" />
            Dashboard
          </p>
          <h1 className="font-serif text-4xl sm:text-5xl tracking-tight text-stone-100 mb-2">
            Find your interviewer
          </h1>
          <p className="text-stone-400 text-sm sm:text-base">
            Browse and book interviews with experienced professionals
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        {/* SEARCH FILTERS */}
        <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-6 mb-10">
          <h2 className="text-lg font-semibold text-stone-100 mb-6 flex items-center gap-2">
            <Search size={20} className="text-amber-400" />
            Filter Interviewers
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Search by name..."
              onChange={handleChange}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
            />

            <input
              type="text"
              name="company"
              placeholder="Search by company..."
              onChange={handleChange}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
            />

            <input
              type="text"
              name="skills"
              placeholder="Skills (react, node...)"
              onChange={handleChange}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
            />

            <input
              type="number"
              name="experience"
              placeholder="Min years of exp..."
              onChange={handleChange}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/50 focus:ring-2 focus:ring-amber-400/10 transition-all"
            />
          </div>
        </div>

        {/* INTERVIEWERS GRID */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-stone-400">Loading interviewers...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-[#0f0f11] border border-white/10 rounded-2xl p-12 text-center">
            <p className="text-stone-400 mb-2">📭 No interviewers found</p>
            <p className="text-stone-500 text-sm">
              Try adjusting your search filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredData.map((user) => (
              <div
                key={user._id}
                className="bg-[#0f0f11] border border-white/10 hover:border-amber-400/30 rounded-2xl p-6 transition-all duration-200 flex flex-col"
              >
                {/* HEADER */}
                <div className="mb-4 pb-4 border-b border-white/10">
                  <h3 className="text-lg font-semibold text-stone-100 mb-1">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-stone-400">
                    <Briefcase size={16} className="text-amber-400" />
                    <span>{user.workingAt}</span>
                  </div>
                </div>

                {/* EXPERIENCE */}
                <div className="flex items-center gap-2 text-sm text-stone-300 mb-4">
                  <Award size={16} className="text-amber-400" />
                  <span className="font-medium">
                    {user.yearsOfExperience} years of experience
                  </span>
                </div>

                {/* SKILLS */}
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user.skills?.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      >
                        {skill}
                      </span>
                    ))}
                    {user.skills?.length > 4 && (
                      <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/5 text-stone-400">
                        +{user.skills.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* BIO */}
                <p className="text-stone-400 text-sm mb-6 flex-1 line-clamp-2">
                  {user.bio}
                </p>

                {/* CTA BUTTON */}
                <Link to={`/book-interview/${user._id}`}>
                  <button className="w-full px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg">
                    Request Interview
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* UPCOMING & PAST BOOKINGS */}
        <div className="space-y-12">
          <UpcomingBookings />
          <PastInterviews />
        </div>
      </div>
    </div>
  );
}