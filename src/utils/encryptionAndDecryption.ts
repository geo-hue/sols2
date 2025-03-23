import crypto from 'crypto';
import { ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_NUMBER_OF_BYTES } from '../config/config.js';

// Generate a new IV for each encryption operation
function generateIV(): Buffer {
  return crypto.randomBytes(parseInt(ENCRYPTION_NUMBER_OF_BYTES));
}

interface EncryptionResult {
  iv: string;
  encryptedData: string;
}

export const encrypt = (text: string): EncryptionResult => {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

export const decrypt = (encryptedData: string, iv: string): string => {
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};