import Submission from "../models/submission.model.js";
import Quiz from "../models/quiz.model.js";
import Class from "../models/class.model.js";

// Get student analytics/progress over time
export const getStudentAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Check if user is a student
    if (req.user.userType !== "student") {
      return res.status(403).json({ message: "Only students can access analytics" });
    }

    // Get all completed submissions for the student
    const submissions = await Submission.find({
      student: userId,
      status: { $ne: "in-progress" } // Only include completed submissions
    }).populate("quiz", "title classId totalPoints");

    // Get all classes the student is enrolled in
    const classes = await Class.find({
      students: userId
    }, "_id name");

    // Calculate analytics
    const totalQuizAttempts = submissions.length;
    const totalQuizMarks = submissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
    const totalPossibleMarks = submissions.reduce((sum, sub) => sum + (sub.totalPoints || 0), 0);
    const averageScore = totalQuizAttempts > 0 ? (totalQuizMarks / totalQuizAttempts).toFixed(2) : 0;
    const averagePercentage = totalPossibleMarks > 0 ? ((totalQuizMarks / totalPossibleMarks) * 100).toFixed(2) : 0;

    // Get analytics by class
    const classAnalytics = classes.map(classItem => {
      const classSubmissions = submissions.filter(sub => 
        sub.quiz && sub.quiz.classId && sub.quiz.classId.toString() === classItem._id.toString()
      );
      
      const classAttempts = classSubmissions.length;
      const classMarks = classSubmissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
      const classPossibleMarks = classSubmissions.reduce((sum, sub) => sum + (sub.totalPoints || 0), 0);
      const classAverage = classAttempts > 0 ? (classMarks / classAttempts).toFixed(2) : 0;
      const classPercentage = classPossibleMarks > 0 ? ((classMarks / classPossibleMarks) * 100).toFixed(2) : 0;

      return {
        classId: classItem._id,
        className: classItem.name,
        attempts: classAttempts,
        totalMarks: classMarks,
        averageScore: classAverage,
        percentage: classPercentage
      };
    });

    // Get recent quiz performance (last 10 quizzes)
    const recentQuizzes = submissions
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 10)
      .map(sub => ({
        quizId: sub.quiz._id,
        quizTitle: sub.quiz.title,
        score: sub.totalScore,
        totalPoints: sub.totalPoints,
        percentage: sub.totalPoints > 0 ? ((sub.totalScore / sub.totalPoints) * 100).toFixed(2) : 0,
        completedAt: sub.completedAt
      }));

    // Calculate performance trends (monthly)
    const monthlyData = {};
    submissions.forEach(sub => {
      if (sub.completedAt) {
        const month = new Date(sub.completedAt).toISOString().slice(0, 7); // YYYY-MM format
        if (!monthlyData[month]) {
          monthlyData[month] = { attempts: 0, totalMarks: 0, totalPossible: 0 };
        }
        monthlyData[month].attempts += 1;
        monthlyData[month].totalMarks += sub.totalScore || 0;
        monthlyData[month].totalPossible += sub.totalPoints || 0;
      }
    });

    const monthlyTrends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      attempts: data.attempts,
      averageScore: data.attempts > 0 ? (data.totalMarks / data.attempts).toFixed(2) : 0,
      percentage: data.totalPossible > 0 ? ((data.totalMarks / data.totalPossible) * 100).toFixed(2) : 0
    })).sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      overall: {
        totalQuizAttempts,
        totalQuizMarks,
        totalPossibleMarks,
        averageScore: parseFloat(averageScore),
        averagePercentage: parseFloat(averagePercentage)
      },
      byClass: classAnalytics,
      recentQuizzes,
      monthlyTrends
    });

  } catch (error) {
    console.error("Error fetching student analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get detailed analytics for a specific class
export const getClassAnalytics = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id;
    
    // Check if user is a student
    if (req.user.userType !== "student") {
      return res.status(403).json({ message: "Only students can access analytics" });
    }

    // Check if student is enrolled in the class
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (!classObj.students.some(id => id.toString() === userId.toString())) {
      return res.status(403).json({ message: "You are not enrolled in this class" });
    }

    // Get all quizzes in this class
    const quizzes = await Quiz.find({ classId }, "_id title totalPoints startTime endTime");

    // Get all submissions for this class
    const submissions = await Submission.find({
      student: userId,
      quiz: { $in: quizzes.map(q => q._id) },
      status: { $ne: "in-progress" }
    }).populate("quiz", "title totalPoints");

    // Calculate class-specific analytics
    const classAttempts = submissions.length;
    const classMarks = submissions.reduce((sum, sub) => sum + (sub.totalScore || 0), 0);
    const classPossibleMarks = submissions.reduce((sum, sub) => sum + (sub.totalPoints || 0), 0);
    const classAverage = classAttempts > 0 ? (classMarks / classAttempts).toFixed(2) : 0;
    const classPercentage = classPossibleMarks > 0 ? ((classMarks / classPossibleMarks) * 100).toFixed(2) : 0;

    // Get quiz-by-quiz breakdown
    const quizBreakdown = quizzes.map(quiz => {
      const quizSubmission = submissions.find(sub => 
        sub.quiz._id.toString() === quiz._id.toString()
      );
      
      if (quizSubmission) {
        return {
          quizId: quiz._id,
          quizTitle: quiz.title,
          attempted: true,
          score: quizSubmission.totalScore,
          totalPoints: quizSubmission.totalPoints,
          percentage: quizSubmission.totalPoints > 0 ? 
            ((quizSubmission.totalScore / quizSubmission.totalPoints) * 100).toFixed(2) : 0,
          completedAt: quizSubmission.completedAt
        };
      } else {
        return {
          quizId: quiz._id,
          quizTitle: quiz.title,
          attempted: false,
          score: 0,
          totalPoints: quiz.totalPoints,
          percentage: 0,
          completedAt: null
        };
      }
    });

    res.status(200).json({
      classInfo: {
        classId: classObj._id,
        className: classObj.name
      },
      analytics: {
        attempts: classAttempts,
        totalMarks: classMarks,
        totalPossibleMarks: classPossibleMarks,
        averageScore: parseFloat(classAverage),
        percentage: parseFloat(classPercentage)
      },
      quizBreakdown
    });

  } catch (error) {
    console.error("Error fetching class analytics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

