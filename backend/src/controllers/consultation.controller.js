import Consultation from "../models/consultation.model.js";
import Class from "../models/class.model.js";
import User from "../models/user.model.js";

// Student requests consultation
export const requestConsultation = async (req, res) => {
  try {
    const { classId } = req.body;
    const student = req.user;

    if (student.userType !== "student") {
      return res.status(403).json({
        message: "Only students can request consultations"
      });
    }

    // Check if class exists and student is enrolled
    const classDetails = await Class.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    if (!classDetails.students.includes(student._id)) {
      return res.status(403).json({
        message: "You are not enrolled in this class"
      });
    }

    // Check if there's already a pending consultation
    const existingConsultation = await Consultation.findOne({
      student: student._id,
      class: classId,
      status: { $in: ["pending", "accepted"] }
    });

    if (existingConsultation) {
      return res.status(400).json({
        message: "You already have an active consultation request for this class"
      });
    }

    const consultation = new Consultation({
      student: student._id,
      teacher: classDetails.teacher,
      class: classId
    });

    await consultation.save();
    
    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("class", "name");

    return res.status(201).json({
      message: "Consultation request sent successfully",
      consultation: populatedConsultation
    });
  } catch (error) {
    console.error("Error requesting consultation:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Teacher gets all consultation requests
export const getTeacherConsultations = async (req, res) => {
  try {
    const teacher = req.user;

    if (teacher.userType !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can access consultation requests"
      });
    }

    const consultations = await Consultation.find({ teacher: teacher._id })
      .populate("student", "fullName email")
      .populate("class", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(consultations);
  } catch (error) {
    console.error("Error getting teacher consultations:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Teacher accepts consultation request
export const acceptConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const teacher = req.user;

    if (teacher.userType !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can accept consultations"
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found"
      });
    }

    if (consultation.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        message: "You can only accept your own consultation requests"
      });
    }

    if (consultation.status !== "pending") {
      return res.status(400).json({
        message: "Consultation is not in pending status"
      });
    }

    consultation.status = "accepted";
    consultation.acceptedAt = new Date();
    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("class", "name");

    return res.status(200).json({
      message: "Consultation accepted successfully",
      consultation: populatedConsultation
    });
  } catch (error) {
    console.error("Error accepting consultation:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Send message in consultation
export const sendMessage = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const { message } = req.body;
    const user = req.user;

    if (!message || message.trim() === "") {
      return res.status(400).json({
        message: "Message cannot be empty"
      });
    }

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found"
      });
    }

    // Check if user is part of this consultation
    const isStudent = consultation.student.toString() === user._id.toString();
    const isTeacher = consultation.teacher.toString() === user._id.toString();

    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        message: "You are not authorized to send messages in this consultation"
      });
    }

    if (consultation.status !== "accepted") {
      return res.status(400).json({
        message: "Consultation must be accepted before sending messages"
      });
    }

    consultation.messages.push({
      sender: user._id,
      message: message.trim()
    });

    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("class", "name")
      .populate("messages.sender", "fullName email");

    return res.status(200).json({
      message: "Message sent successfully",
      consultation: populatedConsultation
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get consultation details
export const getConsultationDetails = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const user = req.user;

    const consultation = await Consultation.findById(consultationId)
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("class", "name")
      .populate("messages.sender", "fullName email");

    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found"
      });
    }

    // Check if user is part of this consultation
    const isStudent = consultation.student._id.toString() === user._id.toString();
    const isTeacher = consultation.teacher._id.toString() === user._id.toString();

    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        message: "You are not authorized to view this consultation"
      });
    }

    return res.status(200).json(consultation);
  } catch (error) {
    console.error("Error getting consultation details:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get student's consultations
export const getStudentConsultations = async (req, res) => {
  try {
    const student = req.user;

    if (student.userType !== "student") {
      return res.status(403).json({
        message: "Only students can access their consultations"
      });
    }

    const consultations = await Consultation.find({ student: student._id })
      .populate("teacher", "fullName email")
      .populate("class", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(consultations);
  } catch (error) {
    console.error("Error getting student consultations:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Complete consultation
export const completeConsultation = async (req, res) => {
  try {
    const { consultationId } = req.params;
    const user = req.user;

    const consultation = await Consultation.findById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        message: "Consultation not found"
      });
    }

    // Both teacher and student can complete the consultation
    const isStudent = consultation.student.toString() === user._id.toString();
    const isTeacher = consultation.teacher.toString() === user._id.toString();

    if (!isStudent && !isTeacher) {
      return res.status(403).json({
        message: "You are not authorized to complete this consultation"
      });
    }

    if (consultation.status === "completed") {
      return res.status(400).json({
        message: "Consultation is already completed"
      });
    }

    consultation.status = "completed";
    await consultation.save();

    const populatedConsultation = await Consultation.findById(consultation._id)
      .populate("student", "fullName email")
      .populate("teacher", "fullName email")
      .populate("class", "name");

    return res.status(200).json({
      message: "Consultation completed successfully",
      consultation: populatedConsultation
    });
  } catch (error) {
    console.error("Error completing consultation:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
