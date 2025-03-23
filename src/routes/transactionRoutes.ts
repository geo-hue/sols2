import express from "express";
import { fetchTotalCashInflow } from "../controllers/transactionsController";

const router = express.Router()

router.get('/fetch-total-Cash-inflow', fetchTotalCashInflow)

export default router