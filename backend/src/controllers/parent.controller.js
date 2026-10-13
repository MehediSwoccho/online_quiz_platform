import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import Quiz from "../models/quiz.model.js";
import Class from "../models/class.model.js";

// Get all quiz results for the parent's child
export const getChildQuizResults = async (req, res) => {
  try {
    console.log('getChildQuizResults called for parent:', req.user._id);
    const parentId = req.user._id;
    
    // Get parent account to find child email
    const parent = await User.findById(parentId);
    console.log('Parent found:', parent);
    if (!parent || parent.userType !== 'parent') {
      console.log('Access denied - not a parent account');
      return res.status(403).json({
        message: "Access denied. Parent account required."
      });
    }

    // Find the student by email
    const student = await User.findOne({ 
      email: parent.childEmail, 
      userType: "student" 
    });
    console.log('Student found:', student);
    
    if (!student) {
      console.log('Student not found with email:', parent.childEmail);
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get all submissions for this student with quiz and class details
    const submissions = await Submission.find({ student: student._id })
      .populate({
        path: 'quiz',
        populate: {
          path: 'classId',
          select: 'name subject'
        }
      })
      .sort({ createdAt: -1 });
    
    console.log('Submissions found:', submissions.length);

    // Format the results
    const quizResults = submissions.map(submission => {
      console.log('Processing submission:', submission._id, submission.quiz?.title);
      const percentage = submission.totalPoints > 0 
        ? Math.round((submission.totalScore / submission.totalPoints) * 100)
        : 0;

      return {
        id: submission._id,
        quizTitle: submission.quiz?.title || 'Unknown Quiz',
        className: submission.quiz?.classId?.name || 'Unknown Class',
        subject: submission.quiz?.classId?.subject || 'Unknown Subject',
        score: submission.totalScore,
        totalPoints: submission.totalPoints,
        percentage: percentage,
        status: submission.status,
        completedAt: submission.completedAt,
        createdAt: submission.createdAt,
        isLowScore: percentage < 30
      };
    });

    console.log('Sending response with quiz results:', quizResults.length);
    res.status(200).json({
      studentName: student.fullName,
      studentEmail: student.email,
      results: quizResults
    });

  } catch (error) {
    console.error("Error getting child quiz results:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get detailed quiz result for a specific submission
export const getQuizResultDetails = async (req, res) => {
  try {
    const parentId = req.user._id;
    const { submissionId } = req.params;

    // Get parent account to find child email
    const parent = await User.findById(parentId);
    if (!parent || parent.userType !== 'parent') {
      return res.status(403).json({
        message: "Access denied. Parent account required."
      });
    }

    // Find the student by email
    const student = await User.findOne({ 
      email: parent.childEmail, 
      userType: "student" 
    });
    
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get the submission with full details
    const submission = await Submission.findOne({
      _id: submissionId,
      student: student._id
    }).populate({
      path: 'quiz',
      populate: {
        path: 'classId',
        select: 'name subject'
      }
    });

    if (!submission) {
      return res.status(404).json({
        message: "Quiz result not found"
      });
    }

    const percentage = submission.totalPoints > 0 
      ? Math.round((submission.totalScore / submission.totalPoints) * 100)
      : 0;

    res.status(200).json({
      id: submission._id,
      quizTitle: submission.quiz.title,
      className: submission.quiz.classId.name,
      subject: submission.quiz.classId.subject,
      score: submission.totalScore,
      totalPoints: submission.totalPoints,
      percentage: percentage,
      status: submission.status,
      completedAt: submission.completedAt,
      answers: submission.answers,
      questions: submission.quiz.questions,
      isLowScore: percentage < 30
    });

  } catch (error) {
    console.error("Error getting quiz result details:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get parent notifications (low scores)
export const getParentNotifications = async (req, res) => {
  try {
    const parentId = req.user._id;
    
    // Get parent account to find child email
    const parent = await User.findById(parentId);
    if (!parent || parent.userType !== 'parent') {
      return res.status(403).json({
        message: "Access denied. Parent account required."
      });
    }

    // Find the student by email
    const student = await User.findOne({ 
      email: parent.childEmail, 
      userType: "student" 
    });
    
    if (!student) {
      return res.status(404).json({
        message: "Student not found"
      });
    }

    // Get submissions with scores below 30%
    const lowScoreSubmissions = await Submission.find({ 
      student: student._id,
      status: { $in: ['completed', 'graded'] }
    })
    .populate({
      path: 'quiz',
      populate: {
        path: 'classId',
        select: 'name subject'
      }
    })
    .sort({ createdAt: -1 });

    // Filter for low scores (< 30%)
    const notifications = lowScoreSubmissions
      .filter(submission => {
        const percentage = submission.totalPoints > 0 
          ? Math.round((submission.totalScore / submission.totalPoints) * 100)
          : 0;
        return percentage < 30;
      })
      .map(submission => {
        const percentage = submission.totalPoints > 0 
          ? Math.round((submission.totalScore / submission.totalPoints) * 100)
          : 0;

        return {
          id: submission._id,
          quizTitle: submission.quiz.title,
          className: submission.quiz.classId.name,
          subject: submission.quiz.classId.subject,
          percentage: percentage,
          completedAt: submission.completedAt,
          message: `Your child scored ${percentage}% on "${submission.quiz.title}" in ${submission.quiz.classId.name}`
        };
      });

    res.status(200).json({
      studentName: student.fullName,
      notifications: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error("Error getting parent notifications:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
};
