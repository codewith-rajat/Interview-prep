import User from "../models/User.js";
import mongoose from "mongoose";
/*
=====================================
SEARCH INTERVIEWERS (WITH PAGINATION)
=====================================
*/

export const searchInterviewers = async (req, res) => {
  try {
    const { skill, minExperience = 0, page = 1, limit = 10 } = req.query;

    const query = {
      role: "interviewer",
      profileCompleted: true,
      
      yearsOfExperience: { $gte: Number(minExperience) }
    };

    if(skill){
      const skillsArray = skill.split(",").map(s => s.trim());
      const regexPattern = skillsArray.join("|");
      query.skills = {
        $elemMatch: {
          $regex: regexPattern,
          $options: "i"
        }
      }
    }


    const skip = (Number(page) - 1) * Number(limit);

    // Run both queries in parallel
    const [total, interviewers] = await Promise.all([
      User.countDocuments(query),
      User.find(query)
        .select("-password")
        .sort({ rating: -1, yearsOfExperience: -1 })
        .skip(skip)
        .limit(Number(limit))
    ]);

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      data: interviewers
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getInterviewerById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ ID check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const interviewer = await User.findOne({
      _id: id,
      role: "interviewer"
    }).select("-password");

    if (!interviewer) {
      return res.status(404).json({ message: "Interviewer not found" });
    }

    res.json({
      success: true,
      data: interviewer
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};