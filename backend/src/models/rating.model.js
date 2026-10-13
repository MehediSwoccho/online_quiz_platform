import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        class: {
            type: mongoose.Schema.Types.ObjectId,
            
            ref: "Class",
            required: true
        },
        rating: {
            type: String,
            enum: ["good", "average", "bad"],
            required: true
        }
    },
    { timestamps: true }
);

// Ensure one rating per student per class
ratingSchema.index({ student: 1, class: 1 }, { unique: true });

const Rating = mongoose.model("Rating", ratingSchema);
export default Rating;
