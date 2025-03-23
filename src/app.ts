import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import doctorRoutes from "./routes/doctorRoutes";
import farewellRoutes from "./routes/farewellRoutes";
import healthyEldersClubRoutes from "./routes/healthyEldersClubRoutes";
import hospitalRoutes from "./routes/hospitalRoutes";
import laboratoryRoutes from "./routes/laboratoryRoutes";
import laceaiRoutes from "./routes/laceaiRoutes";
import nurseRoutes from "./routes/nurseRoutes";
import nutritionistRoutes from "./routes/nutritionistRoutes";
import pharmacyRoutes from "./routes/pharmacyRoutes";
import solacePartnerRoutes from "./routes/solacePartnerRoutes";
import therapistRoutes from "./routes/therapistRoutes";
import caregiverRoutes from "./routes/caregiverRoutes";
import undertakerRoutes from "./routes/undertakerRoutes";
import paystackWebhookHandler from "./routes/webhookRoutes";
import fetchTotalCashInflow from './routes/transactionRoutes';
import subscriptionRoutes from "./routes/subscriptionRoutes";
import { PORT, MONGODB_URI } from "./config/config";

const allowedOrigins = [
  "https://solacedashboard.vercel.app",
  "https://www.solace.com.ng",
  "https://solaceweb.vercel.app",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:8000"
];

const app = express();
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow the specified origins
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

// Set up mongoose's promise to global promise
mongoose.Promise = global.Promise;
mongoose.set("strictQuery", false);

app.use("/v2/api/auth", authRoutes);
app.use("/v2/api/auth/admin", adminRoutes);
app.use("/v2/api/care-givers/doctor", doctorRoutes);
app.use("/v2/api/subscriptions/farewell-cover", farewellRoutes);
app.use("/v2/api/subscriptions/healthy-elders-club", healthyEldersClubRoutes);
app.use("/v2/api/partners/hospitals-and-clinics", hospitalRoutes);
app.use("/v2/api/partners/laboratory", laboratoryRoutes);
app.use("/v2/api/lace-ai/waitlist", laceaiRoutes);
app.use("/v2/api/care-givers/nurse", nurseRoutes);
app.use("/v2/api/care-givers/nutritionist", nutritionistRoutes);
app.use("/v2/api/partners/pharmacy", pharmacyRoutes);
app.use("/v2/api/partners/solace-partner", solacePartnerRoutes);
app.use("/v2/api/care-givers/therapist", therapistRoutes);
app.use("/v2/api/care-givers/care-giver", caregiverRoutes);
app.use("/v2/api/care-givers/undertaker", undertakerRoutes);
app.use("/v2/api/auth/admin/transactions", fetchTotalCashInflow);
app.use("/v2/api/paystack-webhook-handler", paystackWebhookHandler);
app.use("/v2/api/subscriptions", subscriptionRoutes);

// Error Handling Middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: `Something went wrong: ${err}` });
});

export default function startServer() {
  mongoose
    .connect(MONGODB_URI as string)
    .then(() => {
      console.log("Connected to database");
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => console.log(err));
}