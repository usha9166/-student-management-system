import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  message: { type: String, required: true },
  from: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fromName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const submissionSchema = new mongoose.Schema({
  fileName: { type: String },
  filePath: { type: String },
  fileSize: { type: String },
  submittedAt: { type: Date, default: Date.now },
  note: { type: String },
});

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, "Project title is required"], trim: true },
    description: { type: String, default: "" },
    guidelines: { type: String, default: "" },
    techStack: { type: [String], default: [] },
    category: {
      type: String,
      enum: ["Web Application", "Mobile App", "Desktop App", "AI/ML", "IoT", "Cybersecurity", "Data Science", "Other"],
      default: "Web Application",
    },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "In Progress", "Submitted", "Completed"],
      default: "Pending",
    },
    deadline: { type: Date },
    feedback: [feedbackSchema],
    submissions: [submissionSchema],
    progress: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);
