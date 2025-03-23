import { Request, Response } from 'express';
import FarewellCover from '../models/FarewellCover';
import HealthyEldersClub from '../models/HealthyEldersClub';

export const getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.params;
    
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    
    // Find all subscriptions for the user
    const farewellCoverSubscriptions = await FarewellCover.find({
      "subscriberDetails.email": email
    });
    
    const healthyEldersClubSubscriptions = await HealthyEldersClub.find({
      "subscriberDetails.email": email
    });
    
    // Combine subscriptions
    const subscriptions = {
      farewellCover: farewellCoverSubscriptions,
      healthyEldersClub: healthyEldersClubSubscriptions
    };
    
    res.status(200).json({
      message: "User subscriptions retrieved successfully",
      subscriptions
    });
  } catch (error) {
    console.error("Error retrieving user subscriptions:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Error retrieving user subscriptions", error: error.message });
    } else {
      res.status(500).json({ message: "Error retrieving user subscriptions", error: "Unknown error occurred" });
    }
  }
};

export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, type } = req.params;
    
    if (!id || !type) {
      res.status(400).json({ message: "Subscription ID and type are required" });
      return;
    }
    
    let subscription;
    if (type === 'farewell-cover') {
      subscription = await FarewellCover.findById(id);
    } else if (type === 'healthy-elders-club') {
      subscription = await HealthyEldersClub.findById(id);
    } else {
      res.status(400).json({ message: "Invalid subscription type" });
      return;
    }
    
    if (!subscription) {
      res.status(404).json({ message: "Subscription not found" });
      return;
    }
    
    res.status(200).json({
      message: "Subscription retrieved successfully",
      subscription
    });
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    if (error instanceof Error) {
      res.status(500).json({ message: "Error retrieving subscription", error: error.message });
    } else {
      res.status(500).json({ message: "Error retrieving subscription", error: "Unknown error occurred" });
    }
  }
};