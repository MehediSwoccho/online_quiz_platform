import Rating from "../models/rating.model.js";
import Class from "../models/class.model.js";

// Submit or update rating (student only)
export const submitRating = async (req, res) => {
  try {
    const { classId, rating } = req.body;
    const student = req.user;

    if (student.userType !== "student") {
      return res.status(403).json({
        message: "Only students can submit ratings"
      });
    }

    if (!["good", "average", "bad"].includes(rating)) {
      return res.status(400).json({
        message: "Rating must be 'good', 'average', or 'bad'"
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

    // Check if rating already exists for this student and class
    let existingRating = await Rating.findOne({
      student: student._id,
      class: classId
    });

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      await existingRating.save();
      
      const populatedRating = await Rating.findById(existingRating._id)
        .populate("student", "fullName email")
        .populate("teacher", "fullName email")
        .populate("class", "name");

      return res.status(200).json({
        message: "Rating updated successfully",
        rating: populatedRating
      });
    } else {
      // Create new rating
      const newRating = new Rating({
        student: student._id,
        teacher: classDetails.teacher,
        class: classId,
        rating
      });

      await newRating.save();
      
      const populatedRating = await Rating.findById(newRating._id)
        .populate("student", "fullName email")
        .populate("teacher", "fullName email")
        .populate("class", "name");

      return res.status(201).json({
        message: "Rating submitted successfully",
        rating: populatedRating
      });
    }
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get student's rating for a specific class
export const getStudentRating = async (req, res) => {
  try {
    const { classId } = req.params;
    const student = req.user;

    if (student.userType !== "student") {
      return res.status(403).json({
        message: "Only students can access their ratings"
      });
    }

    const rating = await Rating.findOne({
      student: student._id,
      class: classId
    }).populate("class", "name");

    return res.status(200).json(rating);
  } catch (error) {
    console.error("Error getting student rating:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get rating statistics for a class (teacher only)
export const getClassRatingStats = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacher = req.user;

    if (teacher.userType !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can access rating statistics"
      });
    }

    // Check if teacher owns this class
    const classDetails = await Class.findById(classId);
    if (!classDetails) {
      return res.status(404).json({
        message: "Class not found"
      });
    }

    if (classDetails.teacher.toString() !== teacher._id.toString()) {
      return res.status(403).json({
        message: "You can only view statistics for your own classes"
      });
    }

    // Get rating statistics
    const ratingStats = await Rating.aggregate([
      { $match: { class: classDetails._id } },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      }
    ]);

    // Format the results
    const stats = {
      good: 0,
      average: 0,
      bad: 0,
      total: 0
    };

    ratingStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    return res.status(200).json({
      classId,
      className: classDetails.name,
      stats
    });
  } catch (error) {
    console.error("Error getting rating statistics:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Get all ratings for a teacher's classes
export const getTeacherRatings = async (req, res) => {
  try {
    const teacher = req.user;

    if (teacher.userType !== "teacher") {
      return res.status(403).json({
        message: "Only teachers can access rating data"
      });
    }

    const ratings = await Rating.find({ teacher: teacher._id })
      .populate("student", "fullName email")
      .populate("class", "name")
      .sort({ createdAt: -1 });

    return res.status(200).json(ratings);
  } catch (error) {
    console.error("Error getting teacher ratings:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};

// Delete rating (student only)
export const deleteRating = async (req, res) => {
  try {
    const { classId } = req.params;
    const student = req.user;

    if (student.userType !== "student") {
      return res.status(403).json({
        message: "Only students can delete their ratings"
      });
    }

    const rating = await Rating.findOneAndDelete({
      student: student._id,
      class: classId
    });

    if (!rating) {
      return res.status(404).json({
        message: "Rating not found"
      });
    }

    return res.status(200).json({
      message: "Rating deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting rating:", error);
    return res.status(500).json({
      message: "Internal server error"
    });
  }
};
