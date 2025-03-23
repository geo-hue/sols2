import FarewellCover from "../models/FarewellCover.js";
import https from "https";
import {
  PAYSTACK_SECRET_KEY,
  PAYSTACK_FAREWELL_COVER_PINK_DIAMOND_QUATERLY_PLAN,
  PAYSTACK_FAREWELL_COVER_BLUE_DIAMOND_QUATERLY_PLAN,
  PAYSTACK_FAREWELL_COVER_RED_DIAMOND_QUATERLY_PLAN,
  PAYSTACK_FAREWELL_COVER_PINK_DIAMOND_BIANNUAL_PLAN,
  PAYSTACK_FAREWELL_COVER_BLUE_DIAMOND_BIANNUAL_PLAN,
  PAYSTACK_FAREWELL_COVER_RED_DIAMOND_BIANNUAL_PLAN,
  PAYSTACK_FAREWELL_COVER_PINK_DIAMOND_ANNUAL_PLAN,
  PAYSTACK_FAREWELL_COVER_BLUE_DIAMOND_ANNUAL_PLAN,
  PAYSTACK_FAREWELL_COVER_RED_DIAMOND_ANNUAL_PLAN,
} from "../config/config.js";
import axios from "axios";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Helper function to get plan code based on farewellPlan and serviceDuration
const getPlanCode = (farewellPlan, serviceDuration) => {
  if (farewellPlan === "Pink Diamond Plan") {
    if (serviceDuration === "per quarterly")
      return PAYSTACK_FAREWELL_COVER_PINK_DIAMOND_QUATERLY_PLAN;
    if (serviceDuration === "per bi-annual")
      return PAYSTACK_FAREWELL_COVER_PINK_DIAMOND_BIANNUAL_PLAN;
    if (serviceDuration === "per annual")
      return PAYSTACK_FAREWELL_COVER_PINK_DIAMOND_ANNUAL_PLAN;
  } else if (farewellPlan === "Blue Diamond Plan") {
    if (serviceDuration === "per quarterly")
      return PAYSTACK_FAREWELL_COVER_BLUE_DIAMOND_QUATERLY_PLAN;
    if (serviceDuration === "per bi-annual")
      return PAYSTACK_FAREWELL_COVER_BLUE_DIAMOND_BIANNUAL_PLAN;
    if (serviceDuration === "per annual")
      return PAYSTACK_FAREWELL_COVER_BLUE_DIAMOND_ANNUAL_PLAN;
  } else if (farewellPlan === "Red Diamond Plan") {
    if (serviceDuration === "per quarterly")
      return PAYSTACK_FAREWELL_COVER_RED_DIAMOND_QUATERLY_PLAN;
    if (serviceDuration === "per bi-annual")
      return PAYSTACK_FAREWELL_COVER_RED_DIAMOND_BIANNUAL_PLAN;
    if (serviceDuration === "per annual")
      return PAYSTACK_FAREWELL_COVER_RED_DIAMOND_ANNUAL_PLAN;
  }
  return null; // Return null if no matching plan found
};


// Function to calculate subscription amount based on farewell plan and service duration
const calculateSubscriptionAmount = (farewellPlan, serviceDuration) => {
  if (farewellPlan === "Pink Diamond Plan") {
    if (serviceDuration === "per quarterly") return 3000;
    if (serviceDuration === "per bi-annual") return 60000;
    if (serviceDuration === "per annual") return 90000;
  } else if (farewellPlan === "Blue Diamond Plan") {
    if (serviceDuration === "per quarterly") return 60000;
    if (serviceDuration === "per bi-annual") return 90000;
    if (serviceDuration === "per annual") return 150000;
  } else if (farewellPlan === "Red Diamond Plan") {
    if (serviceDuration === "per quarterly") return 90000;
    if (serviceDuration === "per bi-annual") return 150000;
    if (serviceDuration === "per annual") return 250000;
  }
  return 0; // Return 0 if no matching plan found
};

// Function to initialize a subscription with Paystack
const initializeSubscription = async (email, amount, planCode, metadata) => {
  try {
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount, // in kobo, so multiply by 100 for Naira
        metadata,
        plan: planCode, // Plan code for auto-renewal subscription, optional for one-time
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status) {
      return response.data.data.authorization_url; // Return the payment link
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error("Error initializing subscription:", error.message);
    throw error;
  }
};

// Handle form submission with file upload, Cloudinary storage, and Paystack subscription creation
export const createFarewellCoverPlan = async (req, res) => {
  try {
    const {
      relationshipWithBeneficiary,
      beneficiaryPersonalDetails,
      beneficiaryHealthDetails,
      subscriptionDetails,
      subscriberDetails,
    } = req.body;

    

        // Calculate the subscription amount
        const subscriptionAmount = calculateSubscriptionAmount(
          subscriptionDetails.farewellPlan,
          subscriptionDetails.serviceDuration
        );
    
        // Update the subscriptionDetails with the calculated amount
        subscriptionDetails.subscriptionAmount = subscriptionAmount;

    let paystackCustomerCreated = false;
    let paystackResponse = null;

    // Function to check if customer exists in Paystack
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
        throw new Error(
          "Failed to create customer on Paystack: " + error.message
        );
      }
    }

    // Upload image to Cloudinary
    const photoUrl = await uploadToCloudinary(req.files.photo[0].buffer);

    // Create a new Farewell Cover Plan
    const newFormData = new FarewellCover({
      relationshipWithBeneficiary,
      beneficiaryPersonalDetails: {
        ...beneficiaryPersonalDetails,
        photo: photoUrl,
      },
      beneficiaryHealthDetails,
      subscriptionDetails,
      subscriberDetails,
      status: "inactive",
    });

    await newFormData.save();

    // Determine the plan code based on the selected plan and duration
    const planCode = process.env.NODE_ENV === "production" ? getPlanCode(
      subscriptionDetails.farewellPlan,
      subscriptionDetails.serviceDuration
    ) : "PLN_3oa1yee1yixohrz"

    // Prepare metadata for Paystack
    const metadata = {
      subscriptionId: newFormData._id,
      subscriptionDetails,
      subscriberDetails,
      transactionType: "Farewell Cover"
    };

    // Initialize the subscription or payment based on the auto-renewal flag
    let paystackLink = null;
    if (subscriptionDetails.autoRenewal === "on") {
      paystackLink = await initializeSubscription(
        subscriberDetails.email,
        subscriptionDetails.subscriptionAmount * 100, // amount in kobo
        planCode,
        metadata
      );
    } else {
      paystackLink = await initializeSubscription(
        subscriberDetails.email,
        subscriptionDetails.subscriptionAmount * 100, // amount in kobo
        null, // No plan code for one-time payments
        metadata
      );
    }

    // Return the payment link to the client
    res.status(201).json({
      message: "Farewell Cover Plan Registered. Proceed to make payment.",
      paystackLink, // Send the dynamically generated link to the client
      newFormData,
      paystackCustomerCreated,
      paystackResponse,
    });
  } catch (err) {
    res.status(400).send(`Error occurred: ${err.message}`);
  }
};

// Retrieve data from the database
export const retrieveData = async (req, res) => {
  try {
    const data = await FarewellCover.find().sort({ timestamp: -1 }).limit(20);
    res.json(data);
  } catch (err) {
    res.status(500).send("Error fetching data: " + err);
  }
};
