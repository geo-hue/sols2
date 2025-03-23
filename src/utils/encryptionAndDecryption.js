// // utils/encryptionAndDecryption.js
import crypto from 'crypto';
import { ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, ENCRYPTION_NUMBER_OF_BYTES } from '../config/config.js';

// // Generate a new IV for each encryption operation
function generateIV() {
  return crypto.randomBytes(ENCRYPTION_NUMBER_OF_BYTES);
}

// // Encryption function
// export function encrypt(text) {
//   const iv = generateIV();
//   const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return { iv: iv.toString('hex'), encryptedData: encrypted };
// }

// // Decryption function
// export function decrypt(encryptedData, iv) {
//   const ivBuffer = Buffer.from(iv, 'hex');
//   const encryptedText = Buffer.from(encryptedData, 'hex');
//   const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, Buffer.from(ENCRYPTION_KEY), ivBuffer);
//   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }



export const encrypt = (text) => {
  const iv = generateIV();
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return { iv: iv.toString('hex'), encryptedData: encrypted };
};

export const decrypt = (encryptedData, iv) => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(iv, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};