import FarewellCover from "../models/FarewellCover";

// Generate a random ID with a given prefix
export function generateRandomId(prefix: string): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let uniquePart = "";

  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    uniquePart += characters[randomIndex];
  }

  return `${prefix}${uniquePart}`;
}

// Check if the generated ID already exists in the database
export async function generateUniqueCustomId(prefix: string): Promise<string> {
  let uniqueId = generateRandomId(prefix); // Initialize with a value
  let isUnique = false;

  while (!isUnique) {
    try {
      const existingDocument = await FarewellCover.findOne({ _id: uniqueId });
      if (!existingDocument) {
        isUnique = true;
      } else {
        // Only generate a new ID if the current one exists
        uniqueId = generateRandomId(prefix);
      }
    } catch (error) {
      console.error('Error checking existing ID:', error);
      throw error;
    }
  }

  return uniqueId;
}