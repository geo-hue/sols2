import express from "express";
import { paystackWebhookHandler } from "../controllers/webhooks/subscriptionWebhook";

const router = express.Router();

router.post("/subscription-webhook", paystackWebhookHandler);

export default router;