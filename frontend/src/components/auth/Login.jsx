import React, { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import API from "../utils/api";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

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

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },

    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email")
        .required("Required"),

      password: Yup.string()
        .required("Required")
    }),

    onSubmit: async (values) => {
      try {
        const res = await API.post("/auth/login", values);

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "interviewer") {
          navigate("/dashboard/2");
        } else {
          navigate("/dashboard/1");
        }

      } catch (err) {
        alert(err.response?.data?.message || "Login failed");
      }
    }
  });

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif tracking-tight mb-2">
            <span className="text-gray-400">Welcome to </span>
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">Prept</span>
          </h1>
          <p className="text-sm text-gray-500">Sign in to your account</p>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="bg-[#0f0f11] border border-white/10 p-8 rounded-lg space-y-5"
        >
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              onChange={formik.handleChange}
              value={formik.values.email}
              className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
            />
            {formik.errors.email && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              onChange={formik.handleChange}
              value={formik.values.password}
              className="w-full px-4 py-2.5 bg-[#0a0a0b] border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 transition"
            />
            {formik.errors.password && (
              <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-lg font-semibold transition mt-2"
          >
            Sign In
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#0f0f11] text-gray-500">or</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-400">
            Don't have an account?{" "}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium transition">
              Create account
            </Link>
          </p>
        </form>

        <p className="text-xs text-gray-600 text-center mt-6">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}