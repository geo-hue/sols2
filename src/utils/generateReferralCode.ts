export const generateReferralCode = (firstName: string, lastName: string): string => {
  // Ensure firstName and lastName have at least two characters
  if (!firstName || !lastName || firstName.length < 2 || lastName.length < 2) {
    throw new Error(
      "Both firstName and lastName must have at least two characters."
    );
  }

  // Extract the first two characters of firstName and lastName
  const prefix = firstName.slice(0, 2).toUpperCase();
  const suffix = lastName.slice(0, 2).toUpperCase();

  // Generate a random 4-digit number
  const randomNumber = Math.floor(1000 + Math.random() * 9000);

  // Concatenate to form the referral code
  const referralCode = `${prefix}${randomNumber}${suffix}`;

  return referralCode;
};