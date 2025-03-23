import express from "express";
import { fetchTotalCashInflow } from "../controllers/transactionsController.js";

const router = express.Router()

router.get('/fetch-total-Cash-inflow', fetchTotalCashInflow)

export default router