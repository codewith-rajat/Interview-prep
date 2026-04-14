import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../utils/api";
import { useEffect, useState } from "react";

const CompleteProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState("interviewee");

  // Check if user is logged in and redirect if already on dashboard or complete
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!token) {
      navigate("/login");
    } else if (user.bio) {
      // Profile already completed, redirect to dashboard
      if (user.role === "interviewer") {
        navigate("/dashboard/2");
      } else {
        navigate("/dashboard/1");
      }
    } else {
      // Set role from user data or location state
      setUserRole(user.role || location.state?.role || "interviewee");
    }
  }, [navigate, location]);

  const initialValues = {
    isStudent: true,
    university: "",
    graduationYear: "",
    branch: "",
    workingAt: "",
    yearsOfExperience: "",
    skills: "",
    bio: ""
  };

  const validationSchema = Yup.object({
    bio: Yup.string().trim().required("Bio required"),
    skills: Yup.string().trim().required("Skills required"),

    university: Yup.string().when("isStudent", {
      is: true,
      then: (s) => s.trim().required("Required")
    }),

    graduationYear: Yup.number().when("isStudent", {
      is: true,
      then: (s) => s.typeError("Must be a number").required("Required")
    }),

    branch: Yup.string().when("isStudent", {
      is: true,
      then: (s) => s.trim().required("Required")
    }),

    workingAt: Yup.string().when("isStudent", {
      is: false,
      then: (s) => s.trim().required("Required")
    }),

    yearsOfExperience: Yup.number().when("isStudent", {
      is: false,
      then: (s) => s.typeError("Must be a number").required("Required")
    })
  });

  const handleSubmit = async (values) => {
    let payload = {
      bio: values.bio.trim(),
      skills: values.skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s !== "")
    };

    if (values.isStudent) {
      payload.isStudent = true;
      payload.university = values.university.trim();
      payload.branch = values.branch.trim();
      payload.graduationYear = Number(values.graduationYear);
    } else {
      payload.isStudent = false;
      payload.workingAt = values.workingAt.trim();
      payload.yearsOfExperience = Number(values.yearsOfExperience);
    }

    try {
      const res = await API.patch("/user/update-profile", payload);
      alert("Profile Completed ✅");
      navigate("/dashboard/1");
    } catch (error) {
      alert(error.response?.data?.message || "Error updating profile");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif tracking-tight mb-2">
            <span className="text-gray-400">Complete your </span>
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">profile</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Tell us a bit about yourself</p>
        </div>

        <div className="bg-[#0f0f11] border border-white/10 p-8 rounded-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form className="space-y-5">

                {/* Role Toggle - Student/Working */}
                <div className="flex gap-2 bg-[#0a0a0b] border border-white/10 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setFieldValue("isStudent", true)}
                    className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition ${
                      values.isStudent
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setFieldValue("isStudent", false)}
                    className={`flex-1 px-4 py-2.5 rounded-md text-sm font-medium transition ${
                      !values.isStudent
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Working
                  </button>
                </div>

                {/* STUDENT FIELDS */}
                {values.isStudent && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-400">University</label>
                      <Field
                        name="university"
                        placeholder="e.g., MIT, Stanford"
                        className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                      />
                      <ErrorMessage name="university" component="p" className="text-red-500 text-xs" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-400">Graduation Year</label>
                      <Field
                        name="graduationYear"
                        type="number"
                        placeholder="2024"
                        className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                      />
                      <ErrorMessage name="graduationYear" component="p" className="text-red-500 text-xs" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-400">Branch/Major</label>
                      <Field
                        name="branch"
                        placeholder="e.g., Computer Science"
                        className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                      />
                      <ErrorMessage name="branch" component="p" className="text-red-500 text-xs" />
                    </div>
                  </>
                )}

                {/* WORKING FIELDS */}
                {!values.isStudent && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-400">Company</label>
                      <Field
                        name="workingAt"
                        placeholder="e.g., Google, Microsoft"
                        className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                      />
                      <ErrorMessage name="workingAt" component="p" className="text-red-500 text-xs" />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-gray-400">Years of Experience</label>
                      <Field
                        name="yearsOfExperience"
                        type="number"
                        placeholder="5"
                        className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                      />
                      <ErrorMessage name="yearsOfExperience" component="p" className="text-red-500 text-xs" />
                    </div>
                  </>
                )}

                {/* COMMON FIELDS */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-400">Skills (comma separated)</label>
                  <Field
                    name="skills"
                    placeholder="React, Node.js, Python, TypeScript..."
                    className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                  />
                  <ErrorMessage name="skills" component="p" className="text-red-500 text-xs" />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-gray-400">Bio</label>
                  <Field
                    name="bio"
                    as="textarea"
                    placeholder="Tell us about your experience and what you're looking for..."
                    className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition resize-none h-24"
                  />
                  <ErrorMessage name="bio" component="p" className="text-red-500 text-xs" />
                </div>

                {/* SUBMIT BUTTON */}
                <button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-lg font-semibold transition mt-2"
                >
                  Complete Profile
                </button>

              </Form>
            )}
          </Formik>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6">
          You can update this information anytime in your profile settings
        </p>
      </div>
    </div>
  );
};

export default CompleteProfile;