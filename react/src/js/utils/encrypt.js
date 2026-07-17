/**
 * Simple AES‑256 encryption/decryption helper using the Web Crypto API.
 * This is a thin wrapper; in production replace with a vetted library.
 */

const encoder = new TextEncoder();
const decoder = new TextDecoder();

/**
 * Derives a CryptoKey from a passphrase.
 * @param {string} passphrase
 * @returns {Promise<CryptoKey>}
 */
async function getKey(passphrase) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("ps_assistant_salt"),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypts a plain text string.
 * @param {string} text
 * @param {string} passphrase
 * @returns {Promise<string>} Base64‑encoded ciphertext.
 */
export async function encrypt(text, passphrase) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(passphrase);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );
  const combined = new Uint8Array(iv.byteLength + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypts a Base64‑encoded ciphertext.
 * @param {string} data
 * @param {string} passphrase
 * @returns {Promise<string>} Plain text.
 */
export async function decrypt(data, passphrase) {
  const combined = Uint8Array.from(atob(data), c => c.charCodeAt(0));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const key = await getKey(passphrase);
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );
  return decoder.decode(decrypted);
}
