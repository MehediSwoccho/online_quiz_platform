import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import Class from "../models/class.model.js";

// Get student rankings for a specific class
export const getClassRankings = async (req, res) => {
  try {
    const { classId } = req.params;
    const user = req.user;

    // Find the class and check if it exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }

    // Check if user is enrolled in the class or is the teacher
    const isTeacher = user.userType === "teacher" && classObj.teacher.toString() === user._id.toString();
    const isStudent = user.userType === "student" && classObj.students.some(id => id.toString() === user._id.toString());

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: "You don't have permission to access this class" });
    }

    // Get all students in the class
    const students = await User.find({
      _id: { $in: classObj.students },
      userType: "student"
    }, "_id fullName email");

    // Get all submissions for quizzes in this class
    const submissions = await Submission.find({
      student: { $in: classObj.students },
      status: { $ne: "in-progress" } // Only include completed submissions
    }).populate("quiz", "classId title totalPoints");

    // Filter submissions to only include those for this class
    const classSubmissions = submissions.filter(sub => 
      sub.quiz && sub.quiz.classId && sub.quiz.classId.toString() === classId
    );

    // Calculate total score for each student
    const studentScores = students.map(student => {
      // Find all submissions for this student
      const studentSubmissions = classSubmissions.filter(sub => 
        sub.student.toString() === student._id.toString()
      );
      
      // Calculate total score
      const totalScore = studentSubmissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
      const totalAttempts = studentSubmissions.length;
      
      return {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        totalScore,
        totalAttempts
      };
    });

    // Sort students by total score (descending)
    // Ensure students with zero marks appear at the bottom
    studentScores.sort((a, b) => {
      // If both have zero score, sort alphabetically by name
      if (a.totalScore === 0 && b.totalScore === 0) {
        return a.fullName.localeCompare(b.fullName);
      }
      // If only a has zero score, b comes first
      if (a.totalScore === 0) return 1;
      // If only b has zero score, a comes first
      if (b.totalScore === 0) return -1;
      // Otherwise sort by score (higher first)
      return b.totalScore - a.totalScore;
    });

    // Add rank to each student
    const rankedStudents = studentScores.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    res.status(200).json({
      className: classObj.name,
      rankings: rankedStudents
    });
  } catch (error) {
    console.error("Error fetching class rankings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get overall student rankings across all classes
export const getOverallRankings = async (req, res) => {
  try {
    const user = req.user;

    // Get all students
    const students = await User.find({ userType: "student" }, "_id fullName email");

    // Get all completed submissions
    const submissions = await Submission.find({
      status: { $ne: "in-progress" } // Only include completed submissions
    });

    // Calculate total score for each student
    const studentScores = students.map(student => {
      // Find all submissions for this student
      const studentSubmissions = submissions.filter(sub => 
        sub.student.toString() === student._id.toString()
      );
      
      // Calculate total score
      const totalScore = studentSubmissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
      const totalAttempts = studentSubmissions.length;
      
      return {
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        totalScore,
        totalAttempts
      };
    });

    // Sort students by total score (descending)
    // Ensure students with zero marks appear at the bottom
    studentScores.sort((a, b) => {
      // If both have zero score, sort alphabetically by name
      if (a.totalScore === 0 && b.totalScore === 0) {
        return a.fullName.localeCompare(b.fullName);
      }
      // If only a has zero score, b comes first
      if (a.totalScore === 0) return 1;
      // If only b has zero score, a comes first
      if (b.totalScore === 0) return -1;
      // Otherwise sort by score (higher first)
      return b.totalScore - a.totalScore;
    });

    // Add rank to each student
    const rankedStudents = studentScores.map((student, index) => ({
      ...student,
      rank: index + 1
    }));

    res.status(200).json({
      rankings: rankedStudents
    });
  } catch (error) {
    console.error("Error fetching overall rankings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};