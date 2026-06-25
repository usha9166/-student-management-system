import { asyncHandler } from "../middlewares/asyncHandler.js";
import ErrorHandler from "../middlewares/error.js";
import { Project } from "../models/project.js";
import { User } from "../models/user.js";
import path from "path";
import fs from "fs";

// ─── ADMIN ───────────────────────────────────────────────────────────────────

// POST /api/v1/projects/assign  — Admin assigns project to student
export const assignProject = asyncHandler(async (req, res, next) => {
  const { studentId, supervisorId, title, description, guidelines, techStack, category, deadline } = req.body;

  if (!studentId || !title) return next(new ErrorHandler("Student and title are required", 400));

  // Remove any existing project for this student
  await Project.deleteOne({ student: studentId });

  const project = await Project.create({
    title, description, guidelines,
    techStack: techStack ? (Array.isArray(techStack) ? techStack : techStack.split(",").map(t => t.trim())) : [],
    category, deadline, student: studentId, supervisor: supervisorId || null,
  });

  await User.findByIdAndUpdate(studentId, { project: project._id, supervisor: supervisorId || null });
  if (supervisorId) {
    await User.findByIdAndUpdate(supervisorId, { $addToSet: { assignedStudents: studentId } });
  }

  const populated = await Project.findById(project._id).populate("student", "name email").populate("supervisor", "name email");
  res.status(201).json({ success: true, message: "Project assigned successfully", project: populated });
});

// GET /api/v1/projects/all  — Admin gets all projects
export const getAllProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find()
    .populate("student", "name email department")
    .populate("supervisor", "name email")
    .sort({ createdAt: -1 });
  res.json({ success: true, projects });
});

// GET /api/v1/projects/users?role=Student  — Admin gets users by role
export const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const filter = role ? { role } : {};
  const users = await User.find(filter).select("-password -resetPasswordToken -resetPasswordExpire");
  res.json({ success: true, users });
});

// DELETE /api/v1/projects/:id  — Admin deletes project
export const deleteProject = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorHandler("Project not found", 404));
  await User.findByIdAndUpdate(project.student, { project: null, supervisor: null });
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Project deleted" });
});

// ─── TEACHER ─────────────────────────────────────────────────────────────────

// GET /api/v1/projects/supervised  — Teacher gets own students' projects
export const getSupervisedProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ supervisor: req.user._id })
    .populate("student", "name email department")
    .sort({ createdAt: -1 });
  res.json({ success: true, projects });
});

// PUT /api/v1/projects/:id/status  — Teacher updates project status + progress
export const updateProjectStatus = asyncHandler(async (req, res, next) => {
  const { status, progress } = req.body;
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorHandler("Project not found", 404));

  if (status) project.status = status;
  if (progress !== undefined) project.progress = progress;
  await project.save();

  res.json({ success: true, message: "Project updated", project });
});

// POST /api/v1/projects/:id/feedback  — Teacher adds feedback
export const addFeedback = asyncHandler(async (req, res, next) => {
  const { message } = req.body;
  if (!message?.trim()) return next(new ErrorHandler("Feedback message required", 400));

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { $push: { feedback: { message, from: req.user._id, fromName: req.user.name, createdAt: new Date() } } },
    { new: true }
  ).populate("student", "name email");

  if (!project) return next(new ErrorHandler("Project not found", 404));
  res.json({ success: true, message: "Feedback added", project });
});

// GET /api/v1/projects/teacher/files  — Teacher downloads student files
export const getTeacherFiles = asyncHandler(async (req, res) => {
  const projects = await Project.find({ supervisor: req.user._id })
    .populate("student", "name email")
    .select("student submissions title");

  const files = [];
  projects.forEach(p => {
    p.submissions.forEach(s => {
      files.push({
        _id: s._id,
        projectId: p._id,
        projectTitle: p.title,
        studentName: p.student?.name,
        studentEmail: p.student?.email,
        fileName: s.fileName,
        filePath: s.filePath,
        fileSize: s.fileSize,
        note: s.note,
        submittedAt: s.submittedAt,
      });
    });
  });

  res.json({ success: true, files });
});

// GET /api/v1/projects/download/:projectId/:submissionId
export const downloadFile = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.projectId);
  if (!project) return next(new ErrorHandler("Project not found", 404));

  const submission = project.submissions.id(req.params.submissionId);
  if (!submission) return next(new ErrorHandler("File not found", 404));

  const filePath = path.resolve(submission.filePath);
  if (!fs.existsSync(filePath)) return next(new ErrorHandler("File no longer exists on server", 404));

  res.download(filePath, submission.fileName);
});

// ─── STUDENT ─────────────────────────────────────────────────────────────────

// GET /api/v1/projects/my  — Student gets own project
export const getMyProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({ student: req.user._id })
    .populate("supervisor", "name email department");
  res.json({ success: true, project });
});

// POST /api/v1/projects/:id/submit  — Student uploads file
export const submitFile = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorHandler("Project not found", 404));
  if (project.student.toString() !== req.user._id.toString())
    return next(new ErrorHandler("Not authorized", 403));

  if (!req.files || !req.files.file)
    return next(new ErrorHandler("Please upload a file", 400));

  const file = req.files.file;
  const allowedTypes = [".pdf", ".doc", ".docx", ".zip", ".rar", ".pptx", ".txt"];
  const ext = path.extname(file.name).toLowerCase();
  if (!allowedTypes.includes(ext))
    return next(new ErrorHandler("File type not allowed. Use PDF, DOC, DOCX, ZIP, PPTX", 400));

  if (file.size > 20 * 1024 * 1024)
    return next(new ErrorHandler("File too large. Max 20MB", 400));

  const uploadsDir = path.resolve("uploads");
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  const uniqueName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
  const uploadPath = path.join(uploadsDir, uniqueName);
  await file.mv(uploadPath);

  project.submissions.push({
    fileName: file.name,
    filePath: uploadPath,
    fileSize: (file.size / 1024).toFixed(1) + " KB",
    note: req.body.note || "",
    submittedAt: new Date(),
  });

  if (project.status === "Pending" || project.status === "Approved") {
    project.status = "Submitted";
  }
  await project.save();

  res.status(201).json({ success: true, message: "File submitted successfully", project });
});

// DELETE /api/v1/projects/:id/submissions/:subId — Student removes own submission
export const removeSubmission = asyncHandler(async (req, res, next) => {
  const project = await Project.findById(req.params.id);
  if (!project) return next(new ErrorHandler("Project not found", 404));
  if (project.student.toString() !== req.user._id.toString())
    return next(new ErrorHandler("Not authorized", 403));

  const sub = project.submissions.id(req.params.subId);
  if (sub && fs.existsSync(sub.filePath)) fs.unlinkSync(sub.filePath);
  project.submissions.pull(req.params.subId);
  await project.save();

  res.json({ success: true, message: "Submission removed" });
});
