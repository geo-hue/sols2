import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import farewellRoutes from "./routes/farewellRoutes.js";
import healthyEldersClubRoutes from "./routes/healthyEldersClubRoutes.js";
import hospitalRoutes from "./routes/hospitalRoutes.js";
import laboratoryRoutes from "./routes/laboratoryRoutes.js";
import laceaiRoutes from "./routes/laceaiRoutes.js";
import nurseRoutes from "./routes/nurseRoutes.js";
import nutritionistRoutes from "./routes/nutritionistRoutes.js";
import pharmacyRoutes from "./routes/pharmacyRoutes.js";
import solacePartnerRoutes from "./routes/solacePartnerRoutes.js";
import therapistRoutes from "./routes/therapistRoutes.js";
import caregiverRoutes from "./routes/caregiverRoutes.js";
import undertakerRoutes from "./routes/undertakerRoutes.js";
import paystackWebhookHandler from "./routes/webhookRoutes.js";
import fetchTotalCashInflow from './routes/transactionRoutes.js'
import { PORT, MONGODB_URI } from "./config/config.js";


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
mongoose.promise = global.Promise;
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

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: `Something went wrong: ${err}` });
});

export default function startServer() {
  mongoose
    .connect(MONGODB_URI, {})
    .then(() => {
      console.log("Connected to database");
      app.listen(PORT, () =>
        console.log(`Server running on http://localhost:${PORT}`)
      );
    })
    .catch((err) => console.log(err));
}
