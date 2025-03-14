import CryptoJS from "crypto-js";

// Generate a random encryption key
export const generateEncryptionKey = (): string => {
  return CryptoJS.lib.WordArray.random(32).toString();
};

// Encrypt text with a key
export const encryptText = (text: string, key: string): string => {
  return CryptoJS.AES.encrypt(text, key).toString();
};

// Decrypt text with a key
export const decryptText = (encryptedText: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// Hash password for storage
export const hashPassword = (password: string): string => {
  return CryptoJS.SHA256(password).toString();
};

// Verify password
export const verifyPassword = (
  password: string,
  hashedPassword: string
): boolean => {
  return CryptoJS.SHA256(password).toString() === hashedPassword;
};
