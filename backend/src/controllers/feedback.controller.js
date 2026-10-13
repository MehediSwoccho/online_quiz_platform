import Feedback from '../models/feedback.model.js';
import Class from '../models/class.model.js';

// Create teacher feedback
export const createTeacherFeedback = async (req, res) => {
  try {
    const { classId, content } = req.body;
    const userId = req.user._id;

    // Verify the class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Verify the user is the teacher of this class
    if (classObj.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only the teacher of this class can create teacher feedback' });
    }

    const feedback = new Feedback({
      classId,
      userId,
      content,
      feedbackType: 'teacher'
    });

    await feedback.save();

    return res.status(201).json(feedback);
  } catch (error) {
    console.error('Error in createTeacherFeedback controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Create student comment
export const createStudentComment = async (req, res) => {
  try {
    const { classId, content } = req.body;
    const userId = req.user._id;

    // Verify the class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Verify the user is enrolled in this class
    const isEnrolled = classObj.students.some(studentId => 
      studentId.toString() === userId.toString()
    );

    if (!isEnrolled) {
      return res.status(403).json({ message: 'Only enrolled students can create comments' });
    }

    const feedback = new Feedback({
      classId,
      userId,
      content,
      feedbackType: 'student'
    });

    await feedback.save();

    return res.status(201).json(feedback);
  } catch (error) {
    console.error('Error in createStudentComment controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all feedback for a class
export const getClassFeedback = async (req, res) => {
  try {
    const { classId } = req.params;
    const userId = req.user._id;

    // Verify the class exists
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Verify the user is either the teacher or an enrolled student
    const isTeacher = classObj.teacher.toString() === userId.toString();
    const isStudent = classObj.students.some(studentId => 
      studentId.toString() === userId.toString()
    );

    if (!isTeacher && !isStudent) {
      return res.status(403).json({ message: 'You do not have permission to view this class\'s feedback' });
    }

    // Get all feedback for this class, populate user details
    const feedback = await Feedback.find({ classId })
      .populate('userId', 'fullName email userType profilePic')
      .sort({ createdAt: -1 });

    return res.status(200).json(feedback);
  } catch (error) {
    console.error('Error in getClassFeedback controller:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};