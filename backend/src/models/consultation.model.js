import mongoose from "mongoose";

const consultationSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ["pending", "accepted", "completed"],
            default: "pending"
        },
        messages: [{
            sender: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            message: {
                type: String,
                required: true
            },
            timestamp: {
                type: Date,
                default: Date.now
            }
        }],
        requestedAt: {
            type: Date,
            default: Date.now
        },
        acceptedAt: {
            type: Date
        }
    },
    { timestamps: true }
);

const Consultation = mongoose.model("Consultation", consultationSchema);
export default Consultation;
