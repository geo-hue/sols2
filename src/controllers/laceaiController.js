import LaceAiWaitlist from "../models/LaceAiWaitlist.js";

// Handle form submission
export const handleFormSubmission = async (req, res) => {
  try {
    // Check if user already exists
    const findExistingUser = await LaceAiWaitlist.findOne({
      $or: [{ email: req.body.email }, { phoneNumber: req.body.phoneNumber }],
    });

    if (findExistingUser) {
      return res.status(409).json({
        message: "User already Registered with email or phone number",
      });
    }

    // Prepare form data
    let formData = { ...req.body };

    // Create a new document in the database
    const newFormData = new LaceAiWaitlist(formData);
    await newFormData.save();

    // Send a success response
    res.status(201).json({ message: "Successfully Joined Waitlist" });
  } catch (err) {
    // Handle errors and send a response
    res
      .status(400)
      .send("An error occurred during registration, please try again: " + err);
  }
};

// Retrieve all data
export const retrieveData = async (req, res) => {
  try {
    // Fetch all records from the database
    const data = await LaceAiWaitlist.find().sort({ timestamp: -1 }).limit(20);
    res.json(data);
  } catch (err) {
    // Handle errors and send a response
    res.status(500).send("Error fetching data: " + err);
  }
};

// Export all handlers
export default {
  handleFormSubmission,
  retrieveData,
};
