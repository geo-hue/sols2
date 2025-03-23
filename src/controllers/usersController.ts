import { Request, Response } from 'express';
import User from "../models/User";
import { formatDate, formatTime } from "../utils/formatTimestamp";

interface RegistrantDetails {
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateJoined: string;
  timeJoined: string;
  infoSource: string;
  walletStatus: string;
  walletFundingStatus: string;
  referralCode: string;
  userStatus: string;
}

export const getRegistrantsDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const registrantsList = await User.find().sort({ timestamp: -1 }).limit(20);
    
    if (registrantsList.length === 0) {
      res.status(404).json({ message: "No Registrants Yet!" });
      return;
    }

    const registrantsDetails: RegistrantDetails[] = registrantsList.map((registrant) => ({
      firstName: registrant.firstName,
      lastName: registrant.lastName,
      fullName: `${registrant.firstName} ${registrant.lastName}`,
      phoneNumber: registrant.phoneNumber,
      email: registrant.email,
      dateJoined: formatDate(registrant.createdAt),
      timeJoined: formatTime(registrant.createdAt),
      infoSource: registrant.howDidYouHearAboutUs,
      walletStatus: registrant.walletStatus,
      walletFundingStatus: registrant.walletFundingStatus,
      referralCode: registrant.referralCode,
      userStatus: registrant.userStatus,
    }));
    
    res.status(200).json(registrantsDetails);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error occurred" });
    }
  }
};