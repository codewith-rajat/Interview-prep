import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

const InterviewerSetup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const validationSchema = Yup.object({
    role: Yup.string().required("Required"),
    title: Yup.string().required("Required"),
    company: Yup.string().required("Required"),
    experience: Yup.string().required("Required"),
    expertise: Yup.array().min(1, "Select at least one area").required("Required"),
    bio: Yup.string().min(10, "Bio must be at least 10 characters").required("Required"),
  });

  const initialValues = {
    role: "I want to interview",
    title: "",
    company: "",
    experience: "1 yr",
    expertise: [],
    bio: "",
  };

  const experienceOptions = ["1 yr", "2 yrs", "3 yrs", "5 yrs", "7 yrs", "10+ yrs"];

  const expertiseOptions = [
    "Frontend",
    "Backend",
    "Full Stack",
    "DSA",
    "System Design",
    "Behavioral",
    "DevOps",
    "Mobile",
  ];

  const handleExpertiseToggle = (skill, values, setFieldValue) => {
    const newExpertise = values.expertise.includes(skill)
      ? values.expertise.filter((e) => e !== skill)
      : [...values.expertise, skill];
    setFieldValue("expertise", newExpertise);
  };

  const handleSubmit = async (values) => {
    try {
      const profilePayload = {
        bio: values.bio.trim(),
        title: values.title.trim(),
        company: values.company.trim(),
        experience: values.experience,
        expertise: values.expertise,
        isStudent: false,
        workingAt: values.company.trim(),
        yearsOfExperience: parseInt(values.experience.split(" ")[0])
      };

      const res = await API.patch("/user/update-profile", profilePayload);
      alert("Profile Created ✅");
    
      sessionStorage.removeItem("interviewerProfile");
      sessionStorage.removeItem("selectedRole");
      
      navigate("/dashboard/2");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save profile");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4 pt-24">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-lg">
              🎓
            </div>
            <span className="text-gray-400">Selected role</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-gray-400">Create your </span>
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              interviewer profile
            </span>
          </h1>
          <p className="text-gray-400 mt-2">
            Help candidates prepare by sharing your expertise
          </p>
        </div>

        <div className="bg-[#0f0f11] border border-white/10 p-8 rounded-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className="space-y-6">
                {/* Current Title */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-400">Current Title *</label>
                  <Field
                    name="title"
                    placeholder="Senior Software Engineer"
                    className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <ErrorMessage
                    name="title"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Company */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-400">Company *</label>
                  <Field
                    name="company"
                    placeholder="Google, Meta, Startup..."
                    className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <ErrorMessage
                    name="company"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-gray-400">Experience *</label>
                  <div className="flex flex-wrap gap-2">
                    {experienceOptions.map((exp) => (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setFieldValue("experience", exp)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          values.experience === exp
                            ? "bg-amber-500 text-black"
                            : "bg-[#0a0a0b] border border-white/10 text-gray-400 hover:border-amber-500"
                        }`}
                      >
                        {exp}
                      </button>
                    ))}
                  </div>
                  <ErrorMessage
                    name="experience"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Expertise */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-gray-400">Expertise Areas *</label>
                  <div className="flex flex-wrap gap-2">
                    {expertiseOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleExpertiseToggle(skill, values, setFieldValue)}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          values.expertise.includes(skill)
                            ? "bg-amber-500 text-black"
                            : "bg-[#0a0a0b] border border-white/10 text-gray-400 hover:border-amber-500"
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  <ErrorMessage
                    name="expertise"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Bio */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-400">
                    Tell about your background
                  </label>
                  <Field
                    as="textarea"
                    name="bio"
                    placeholder="Tell interviewees about your background, what you specialise in, and what they can expect from a session with you."
                    rows="5"
                    className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition resize-none"
                  />
                  <ErrorMessage
                    name="bio"
                    component="p"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Button */}
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-semibold transition mt-2"
                >
                  Create interviewer profile →
                </button>
              </Form>
            )}
          </Formik>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default InterviewerSetup;
