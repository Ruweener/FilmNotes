import express from "express";
const router = express.Router();
import { handleGetRecommendations } from "../../controllers/recommendationsController.js";
import requireAuth from "../../middleware/requireAuth.js";

router.use(requireAuth);

router.get("/", handleGetRecommendations);

export default router;
