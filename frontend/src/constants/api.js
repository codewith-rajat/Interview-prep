// frontend/src/constants/api.js - API constants
export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
  },
  USER: {
    PROFILE: "/api/user/profile",
    UPDATE: "/api/user/profile",
  },
  PAYOUTS: {
    REQUEST: "/api/payouts",
    HISTORY: "/api/payouts/history",
    ADMIN_ALL: "/api/payouts/admin/all",
    APPROVE: (id) => `/api/payouts/${id}/approve`,
    REJECT: (id) => `/api/payouts/${id}/reject`,
  },
  INTERVIEWS: {
    LIST: "/api/interviews",
    CREATE: "/api/interviews",
    DETAIL: (id) => `/api/interviews/${id}`,
    UPDATE: (id) => `/api/interviews/${id}`,
    DELETE: (id) => `/api/interviews/${id}`,
    FEEDBACK: (id) => `/api/interviews/${id}/feedback`,
  },
};

// frontend/src/constants/business.js - Business logic constants
export const PLATFORM_FEE = 0.2;
export const CREDIT_TO_USDRATE = 5;

export const PAYMENT_METHODS = [
  { value: "PAYPAL", label: "PayPal" },
  { value: "BANK", label: "Bank Transfer" },
];

export const INTERVIEW_STATUS = {
  PENDING: "pending",
  SCHEDULED: "scheduled",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
};

export const RATING_LEVELS = {
  POOR: "POOR",
  AVERAGE: "AVERAGE",
  GOOD: "GOOD",
  EXCELLENT: "EXCELLENT",
};

export const RATING_COLORS = {
  POOR: "text-red-500",
  AVERAGE: "text-orange-500",
  GOOD: "text-blue-500",
  EXCELLENT: "text-green-500",
};

// frontend/src/constants/validation.js - Validation rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PAYMENT_DETAIL_MIN_LENGTH: 5,
};

export const validateEmail = (email) => VALIDATION_RULES.EMAIL.test(email);

export const validatePassword = (password) =>
  password.length >= VALIDATION_RULES.PASSWORD_MIN_LENGTH;

export const validatePaymentDetail = (detail) =>
  detail.length >= VALIDATION_RULES.PAYMENT_DETAIL_MIN_LENGTH;
