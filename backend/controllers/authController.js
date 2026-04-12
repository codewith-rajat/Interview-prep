import User from "../models/User.js";
import jwt from "jsonwebtoken";

/* -----------------------------------
   🔐 Generate Token
----------------------------------- */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ TOKEN GENERATE
    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token, // 🔥 THIS WAS MISSING
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ===================================
   ✅ REGISTER
=================================== */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 🔥 Prevent public ADMIN creation
    if (role === "ADMIN") {
      return res.status(403).json({
        message: "Admin cannot register publicly"
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const user = await User.create({
      name,
      email,
      password, // 🔥 No manual hashing (model handles it)
      role
    });

    const token = generateToken(user);

    res.status(201).json({
      message: "Registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.log("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ===================================
   ✅ LOGIN
=================================== */
// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     const isMatch = await user.comparePassword(password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     res.json({
//       message: "Login successful",
//       token, // ✅ VERY IMPORTANT
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role
//       }
//     });


//   } catch (error) {
//     console.log("Login Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };