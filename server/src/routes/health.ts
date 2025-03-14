import express from "express";
import { Router } from "express";

const router: Router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
