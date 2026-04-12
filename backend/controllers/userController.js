import User from "../models/User.js";

/*
=====================================
UPDATE PROFILE
=====================================
*/

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const {
      isStudent,
      university,
      graduationYear,
      branch,
      workingAt,
      yearsOfExperience,
      skills,
      bio
    } = req.body;

    // Common fields
    user.bio = bio || user.bio;
    if (skills && Array.isArray(skills)) {
      user.skills = skills.map(s => s.trim().toLowerCase());
    }

    // ===============================
    // INTERVIEWEE LOGIC
    // ===============================
    if (user.role === "interviewee") {

      if (typeof isStudent === "boolean") {
        user.isStudent = isStudent;
      }

      if (user.isStudent === true) {

        if (!university || !graduationYear || !branch) {
          return res.status(400).json({
            message: "University, graduation year and branch required"
          });
        }

        user.university = university;
        user.graduationYear = graduationYear;
        user.branch = branch;

        user.workingAt = undefined;
        user.yearsOfExperience = undefined;
      }

      if (user.isStudent === false) {

        if (!workingAt || !yearsOfExperience) {
          return res.status(400).json({
            message: "Working company and experience required"
          });
        }

        user.workingAt = workingAt;
        user.yearsOfExperience = yearsOfExperience;

        user.university = undefined;
        user.graduationYear = undefined;
        user.branch = undefined;
      }
    }

    // ===============================
    // INTERVIEWER LOGIC
    // ===============================
    if (user.role === "interviewer") {

      if (!workingAt || !yearsOfExperience) {
        return res.status(400).json({
          message: "Working company and experience required"
        });
      }

      user.workingAt = workingAt;
      user.yearsOfExperience = yearsOfExperience;
      user.isStudent = false;
    }

    user.profileCompleted = true;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


/*
=====================================
GET MY PROFILE
=====================================
*/

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};