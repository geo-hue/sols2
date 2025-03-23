import User from "../models/User.js";
import { formatDate, formatTime } from "../utils/formatTimestamp.js";

export const getRegistrantsDetails = async (req, res) => {
  try {
    const registrantsList = await User.find().sort({ timestamp: -1 }).limit(20);
    
    if (registrantsList.length === 0) {
      return res.status(404).json({ message: "No Registrants Yet!" });
    }

    const registrantsDetails = registrantsList.map((registrant) => ({
      firstName: registrant.firstName,
      lastName: registrant.lastName,
      fullName: `${registrant.firstName} ${registrant.lastName}`,
      phoneNumber: registrant.phoneNumber,
      email: registrant.email,
      dateJoined: formatDate(registrant.createdAt),
      timeJoined: formatTime(registrant.createdAt),
      infoSource: registrant.howDidYouHearAboutUs,
      // profilePicture: registrant.profilePicture,
      walletStatus: registrant.walletStatus,
      walletFundingStatus: registrant.walletFundingStatus,
      referralCode: registrant.referralCode,
      userStatus: registrant.userStatus,
    }));
    // console.log(registrantsDetails)
    res.status(200).json(registrantsDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};