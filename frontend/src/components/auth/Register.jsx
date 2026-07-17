import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useEffect, useState } from "react";

const Signup = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState("interviewee");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (token && user.role) {
      if (user.role === "interviewer") {
        navigate("/dashboard/2");
      } else {
        navigate("/dashboard/1");
      }
    }
  }, [navigate]);

  useEffect(() => {
    const role = sessionStorage.getItem("selectedRole");
    if (role) {
      setSelectedRole(role);
    }
  }, []);

  const initialValues = {
    name: "",
    email: "",
    password: "",
    role: selectedRole
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Required"),
    email: Yup.string().email().required("Required"),
    password: Yup.string().min(6).required("Required"),
    role: Yup.string().required()
  });

  const handleSubmit = async (values) => {
    try {
      const res = await API.post("/auth/register", values);
      localStorage.setItem("token", res.data.token);
      
      if (values.role === "interviewer") {
        navigate("/interviewer-setup");
      } else {
        navigate("/complete-profile");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif tracking-tight mb-2">
            <span className="text-gray-400">Create your </span>
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Prept</span>
            <br />
            <span className="text-gray-400">account</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">Join thousands of engineers acing interviews</p>
        </div>

        <div className="bg-[#0f0f11] border border-white/10 p-8 rounded-lg">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            <Form className="space-y-5">

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400">Full Name</label>
                <Field
                  name="name"
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                />
                <ErrorMessage
                  name="name"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400">Email</label>
                <Field
                  name="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                />
                <ErrorMessage
                  name="email"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-medium text-gray-400">Password</label>
                <Field
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
                />
                <ErrorMessage
                  name="password"
                  component="p"
                  className="text-red-500 text-xs"
                />
              </div>

              <input type="hidden" name="role" value={selectedRole} />

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-lg font-semibold transition mt-2"
              >
                Create Account
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-[#0f0f11] text-gray-500">already have an account?</span>
                </div>
              </div>

              <Link to="/login" className="block">
                <button
                  type="button"
                  className="w-full px-4 py-2.5 border border-white/10 hover:border-white/20 rounded-lg text-white font-medium transition text-sm"
                >
                  Sign In
                </button>
              </Link>
            </Form>
          </Formik>
        </div>

        <p className="text-xs text-gray-600 text-center mt-6">
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Signup;