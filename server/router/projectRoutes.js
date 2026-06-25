import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import {
  assignProject, getAllProjects, getUsersByRole, deleteProject,
  getSupervisedProjects, updateProjectStatus, addFeedback, getTeacherFiles, downloadFile,
  getMyProject, submitFile, removeSubmission,
} from "../controllers/projectController.js";

const router = express.Router();

// ── Admin ──────────────────────────────────────────────────
router.post("/assign",        isAuthenticated, assignProject);
router.get("/all",            isAuthenticated, getAllProjects);
router.get("/users",          isAuthenticated, getUsersByRole);
router.delete("/:id",         isAuthenticated, deleteProject);

// ── Teacher ────────────────────────────────────────────────
router.get("/supervised",     isAuthenticated, getSupervisedProjects);
router.put("/:id/status",     isAuthenticated, updateProjectStatus);
router.post("/:id/feedback",  isAuthenticated, addFeedback);
router.get("/teacher/files",  isAuthenticated, getTeacherFiles);
router.get("/download/:projectId/:submissionId", isAuthenticated, downloadFile);

// ── Student ────────────────────────────────────────────────
router.get("/my",             isAuthenticated, getMyProject);
router.post("/:id/submit",    isAuthenticated, submitFile);
router.delete("/:id/submissions/:subId", isAuthenticated, removeSubmission);

export default router;
