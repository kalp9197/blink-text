import express from "express";
import {
  createText,
  getText,
  getUserTexts,
  deleteText,
  clearExpiredTexts,
} from "../controllers/text";
import { protect } from "../middleware/auth";

const router = express.Router();

router.post("/", protect, createText);
router.get("/history", protect, getUserTexts);
router.get("/:accessToken", getText);
router.delete("/:id", protect, deleteText);
router.delete("/admin/clear-expired", protect, clearExpiredTexts);

export default router;
