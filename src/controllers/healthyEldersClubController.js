import HealthyEldersClub from "../models/HealthyEldersClub.js";
import https from "https";
import {
  PAYSTACK_SECRET_KEY,
  PAYSTACK_HEALTHY_ELDERS_PLAN_CODE,
} from "../config/config.js";
import axios from "axios";

// Helper function to initialize a transaction with Paystack
const initializeSubscription = async (email, amount, metadata, planCode) => {
  try {
    // Ensure metadata is a plain object with string values
    const sanitizedMetadata = Object.entries(metadata).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
      return acc;
    }, {});

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount, // in kobo
        metadata: sanitizedMetadata,
        plan: planCode, // Optional for one-time payments
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status) {
      return response.data.data.authorization_url;
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Error initializing subscription:", error.response ? error.response.data : error.message);
    throw error;
  }
};

// Function to check if the customer exists in Paystack
const checkCustomerExists = (email) => {
  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/customer/${encodeURIComponent(email)}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const response = JSON.parse(data);
        if (response.status && response.data) {
          resolve(response.data);
        } else {
          resolve(null); // Customer does not exist
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.end();
  });
};

// Function to create a new customer in Paystack
const createCustomer = (email, firstName, lastName, phone) => {
  const params = JSON.stringify({
    email,
    first_name: firstName,
    last_name: lastName,
    phone,
  });

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: "/customer",
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const response = JSON.parse(data);
        if (response.status) {
          resolve(response);
        } else {
          reject(new Error(response.message));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(params);
    req.end();
  });
};

// Create Healthy Elders Club subscription
export const createHealthEldersClubSubscription = async (req, res) => {
  try {
    const { beneficiaryDetails, paymentInformation, subscriberDetails } = req.body;

    let paystackCustomerCreated = false;
    let paystackResponse = null;

    // Check if the customer exists in Paystack
    let customer = await checkCustomerExists(subscriberDetails.email);

    // If the customer doesn't exist, create a new customer
    if (!customer) {
      try {
        const customerCreationResponse = await createCustomer(
          subscriberDetails.email,
          subscriberDetails.firstName,
          subscriberDetails.lastName,
          subscriberDetails.phoneNumber
        );
        customer = customerCreationResponse.data;
        paystackCustomerCreated = true;
        paystackResponse = customerCreationResponse;
      } catch (error) {
        paystackCustomerCreated = false;
        throw new Error("Failed to create customer on Paystack: " + error.message);
      }
    }

    // Create new form data to save in the database
    const newFormData = new HealthyEldersClub({
      beneficiaryDetails,
      paymentInformation,
      subscriberDetails,
    });

    await newFormData.save();

    const planCode = process.env.NODE_ENV === "production" ? PAYSTACK_HEALTHY_ELDERS_PLAN_CODE : "PLN_3oa1yee1yixohrz";
    const totalAmountToBePaid = 12000

    const metadata = {
      subscriptionId: newFormData._id.toString(),
      paymentInformation: JSON.stringify(paymentInformation),
      subscriberDetails: JSON.stringify(subscriberDetails),
      transactionType: "Healthy Elders Club",
    };

    // Initialize the subscription or payment based on the auto-renewal flag
    const paystackLink = await initializeSubscription(
      subscriberDetails.email,
      totalAmountToBePaid,
      // paymentInformation.totalAmountToBePaid * 100, // amount in kobo
      metadata,
      paymentInformation.autoRenewal === "on" ? planCode : null
    );

    // Return the payment link to the client
    res.status(201).json({
      message: "Healthy Elders Club Subscription. Proceed To Make Payment To Activate Your Subscription.",
      paystackLink,
      newFormData,
      paystackCustomerCreated,
      paystackResponse,
    });
  } catch (err) {
    console.error("Error in createHealthEldersClubSubscription:", err);
    res.status(400).json({
      error: "An error occurred during registration, please try again",
      message: err.message,
    });
  }
};

// Retrieve data from the database
export const retrieveData = async (req, res) => {
  try {
    const data = await HealthyEldersClub.find().sort({ timestamp: -1 }).limit(20);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error fetching data", message: err.message });
  }
};