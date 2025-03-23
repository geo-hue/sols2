import FarewellCover from "../../models/FarewellCover.js";
import HealthyEldersClub from "../../models/HealthyEldersClub.js";
import TemporaryPaymentStorage from "../../models/TemporaryPaymentStorage.js";
import {
  ZEPTOMAIL_TOKEN,
  PAYSTACK_SECRET_KEY,
  ZEPTOMAIL_SUBSCRIPTION_MAIL_TEMPLATE,
} from "../../config/config.js";
import crypto from "crypto";
import { farewellCoverExpiryDate, healthyEldersExpiryDate } from "../../utils/expiryDate.js";
import { SendMailClient } from "zeptomail";
import isWindows from "cross-env/src/is-windows.js";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

let client = new SendMailClient({ url, token });

// Paystack webhook handler
export const paystackWebhookHandler = async (req, res) => {
  try {
    const secret = PAYSTACK_SECRET_KEY;

    // Verify the event is from Paystack
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(401).send("Unauthorized");
    }

    const event = req.body;

    // Handle both charge.success, subscription.create, and subscription.renewal
    if (
      event.event === "charge.success" ||
      event.event === "subscription.create" ||
      event.event === "subscription.renewal"
    ) {
      const fetchSubscription = await TemporaryPaymentStorage.create({
        details: event,
      });

      const metadata = fetchSubscription.details.data?.metadata;

      if (!metadata) {
        console.error("Metadata is missing from the event");
        return res
          .status(400)
          .json({ message: "Invalid event data: metadata is missing" });
      }

      const transactionType = metadata.transactionType;
      const subscriptionId = metadata.subscriptionId;
      const subscriptionDetails = transactionType === "Farewell Cover" ? metadata.subscriptionDetails : JSON.parse(metadata.paymentInformation);
      const subscriberDetails = transactionType === "Farewell Cover" ? metadata.subscriberDetails : JSON.parse(metadata.subscriberDetails);

      if (!subscriptionDetails || !subscriberDetails) {
        return res
          .status(400)
          .json({ message: "Invalid subscription data: missing details" });
      }

      const customerEmail = subscriberDetails.email;
      const customerFirstName = subscriberDetails.firstName;
      const subscriptionAmount = transactionType === "Farewell Cover" ? subscriptionDetails.subscriptionAmount : subscriptionDetails.totalAmountToBePaid;
      const subscriptionType = transactionType === subscriptionDetails.autoRenewal;
      let expiryDate;

      // Handle Farewell Cover or Healthy Elders Club based on transactionType
      if (transactionType === "Farewell Cover") {
        const planType = subscriptionDetails.farewellPlan;
        const paymentFrequency = subscriptionDetails.serviceDuration;
        expiryDate = farewellCoverExpiryDate(paymentFrequency);

        // Find FarewellCover by subscriptionId
        const farewellCover = await FarewellCover.findById(subscriptionId);

        if (!farewellCover) {
          console.error(
            "FarewellCover subscription not found for ID:",
            subscriptionId
          );
          return res.status(404).json({
            message:
              "FarewellCover subscription not found. Webhook event not processed.",
            subscriptionId: subscriptionId,
          });
        }

        // Update the existing FarewellCover subscription
        farewellCover.subscriptionDetails.subscriptionStatus = "active";
        farewellCover.subscriptionDetails.nextRenewal = expiryDate;
        await farewellCover.save();

        // Send confirmation email for Farewell Cover
        await sendConfirmationEmail(
          customerEmail,
          customerFirstName,
          planType,
          paymentFrequency,
          subscriptionAmount,
          subscriptionType,
          expiryDate
        );
        window.location.href="https://www.solace.com.ng/subscribedsuccess"
      } else if (transactionType === "Healthy Elders Club") {
        const planType = "Annual Healthy Elders Club Plan"; // Healthy Elders is always annual
        expiryDate = healthyEldersExpiryDate();

        // Find HealthyEldersClub by subscriptionId
        const healthyEldersClub = await HealthyEldersClub.findById(subscriptionId);

        if (!healthyEldersClub) {
          console.error(
            "HealthyEldersClub subscription not found for ID:",
            subscriptionId
          );
          return res.status(404).json({
            message:
              "HealthyEldersClub subscription not found. Webhook event not processed.",
            subscriptionId: subscriptionId,
          });
        }

        // Update the existing HealthyEldersClub subscription
        healthyEldersClub.paymentInformation.subscriptionStatus = "verified";
        healthyEldersClub.paymentInformation.nextRenewal = expiryDate;
        await healthyEldersClub.save();

        // Send confirmation email for Healthy Elders Club
        await sendConfirmationEmail(
          customerEmail,
          customerFirstName,
          planType,
          "Annual", // Since Healthy Elders is always annual
          subscriptionAmount,
          subscriptionType,
          expiryDate
        );
        window.location.href="https://www.solace.com.ng/subscribedsuccess"
      }

      return res
        .status(200)
        .json({ message: "Subscription verified and processed successfully" });
    }

    return res.status(200).send("Event received");
  } catch (err) {
    console.error("Webhook error:", err);
    return res.status(500).send(`Internal server error: ${err.message}`);
  }
};

// Helper function to send confirmation emails
const sendConfirmationEmail = async (
  customerEmail,
  customerFirstName,
  planType,
  paymentFrequency,
  subscriptionAmount,
  subscriptionType,
  expiryDate
) => {
  try {
    await client.sendMail({
      mail_template_key: ZEPTOMAIL_SUBSCRIPTION_MAIL_TEMPLATE,
      from: {
        address: "paul@solace.com.ng",
        name: "Paul Oseghale",
      },
      to: [
        {
          email_address: {
            address: customerEmail,
            name: customerFirstName,
          },
        },
      ],
      merge_info: {
        firstName: customerFirstName,
        solacePlanType: planType,
        paymentFrequency: paymentFrequency,
        subscriptionAmount: `${(parseInt(subscriptionAmount)).toFixed(2)}`, // Convert kobo to Naira
        expiryDate: expiryDate.toISOString().split("T")[0], // Format date as YYYY-MM-DD
        renewalType:
        subscriptionType === "on" ? "Auto Renew" : "One Time Payment",
      },
      subject: "✉️ Subscription Confirmed!",
    });
  } catch (emailError) {
    console.error("Error sending confirmation email:", emailError);
  }
};
