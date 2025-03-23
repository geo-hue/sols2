import { Request, Response } from 'express';
import FarewellCover from "../../models/FarewellCover";
import HealthyEldersClub from "../../models/HealthyEldersClub";
import TemporaryPaymentStorage from "../../models/TemporaryPaymentStorage";
import {
  ZEPTOMAIL_TOKEN,
  PAYSTACK_SECRET_KEY,
  ZEPTOMAIL_SUBSCRIPTION_MAIL_TEMPLATE,
} from "../../config/config";
import crypto from "crypto";
import { farewellCoverExpiryDate, healthyEldersExpiryDate } from "../../utils/expiryDate";
import { SendMailClient } from "zeptomail";

const url = "api.zeptomail.com/v1.1/email/template";
const token = ZEPTOMAIL_TOKEN;

const client = new SendMailClient({ url, token: token || '' });

interface WebhookEvent {
  event: string;
  data: {
    metadata?: {
      subscriptionId?: string;
      transactionType?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

// Paystack webhook handler
export const paystackWebhookHandler = async (req: Request, res: Response): Promise<void> => {
  try {
    const secret = PAYSTACK_SECRET_KEY || '';

    // Verify the event is from Paystack
    const hash = crypto
      .createHmac("sha512", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      res.status(401).send("Unauthorized");
      return;
    }

    const event = req.body as WebhookEvent;

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
        res
          .status(400)
          .json({ message: "Invalid event data: metadata is missing" });
        return;
      }

      const transactionType = metadata.transactionType;
      const subscriptionId = metadata.subscriptionId;
      const subscriptionDetails = transactionType === "Farewell Cover" ? metadata.subscriptionDetails : JSON.parse(metadata.paymentInformation);
      const subscriberDetails = transactionType === "Farewell Cover" ? metadata.subscriberDetails : JSON.parse(metadata.subscriberDetails);

      if (!subscriptionDetails || !subscriberDetails) {
        res
          .status(400)
          .json({ message: "Invalid subscription data: missing details" });
        return;
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
          res.status(404).json({
            message:
              "FarewellCover subscription not found. Webhook event not processed.",
            subscriptionId: subscriptionId,
          });
          return;
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
          res.status(404).json({
            message:
              "HealthyEldersClub subscription not found. Webhook event not processed.",
            subscriptionId: subscriptionId,
          });
          return;
        }

        // Update the existing HealthyEldersClub subscription
        healthyEldersClub.paymentInformation.status = "verified";
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
      }

      res
        .status(200)
        .json({ message: "Subscription verified and processed successfully" });
      return;
    }

    res.status(200).send("Event received");
  } catch (err) {
    console.error("Webhook error:", err);
    if (err instanceof Error) {
      res.status(500).send(`Internal server error: ${err.message}`);
    } else {
      res.status(500).send("Internal server error: Unknown error occurred");
    }
  }
};

// Helper function to send confirmation emails
const sendConfirmationEmail = async (
  customerEmail: string,
  customerFirstName: string,
  planType: string,
  paymentFrequency: string,
  subscriptionAmount: number,
  subscriptionType: any,
  expiryDate: Date
): Promise<void> => {
  try {
    await client.sendMail({
      mail_template_key: ZEPTOMAIL_SUBSCRIPTION_MAIL_TEMPLATE || '',
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
        subscriptionAmount: `${(parseInt(String(subscriptionAmount))).toFixed(2)}`, // Convert kobo to Naira
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