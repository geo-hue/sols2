export const farewellCoverExpiryDate = (serviceDuration: string): Date => {
  const currentDate = new Date();

  switch (serviceDuration) {
    case "per quarterly":
      currentDate.setMonth(currentDate.getMonth() + 3); // Adds 3 months for quarterly
      break;
    case "per bi-annual":
      currentDate.setMonth(currentDate.getMonth() + 6); // Adds 6 months for bi-annual
      break;
    case "per annual":
      currentDate.setFullYear(currentDate.getFullYear() + 1); // Adds 1 year for annual
      break;
    default:
      throw new Error("Invalid service duration"); // Handles invalid input
  }

  return currentDate;
};


export const healthyEldersExpiryDate = (): Date => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 365);
  return currentDate;
};