import express from "express";
import { paystackWebhookHandler } from "../controllers/webhooks/subscriptionWebhook.js";

const router = express.Router();

router.post("/subscription-webhook", paystackWebhookHandler);

export default router;
