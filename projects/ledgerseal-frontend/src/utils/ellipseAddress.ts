/**
 * Utility functions for shortening addresses and hashes
 */

/**
 * Shortens an address or hash by showing first and last characters
 * @param address - The address/hash to shorten
 * @param width - Number of characters to show at start and end (default: 6)
 * @returns Shortened string or original if null/undefined
 */
export function ellipseAddress(address: string | null, width = 6): string {
  return address ? `${address.slice(0, width)}...${address.slice(-width)}` : (address ?? '')
}

/**
 * Shortens a hash with customizable front and back lengths
 * @param hash - The hash to shorten
 * @param front - Number of characters to show at start (default: 8)
 * @param back - Number of characters to show at end (default: 6)
 * @returns Shortened hash or original if shorter than total characters
 */
export const shortenHash = (hash: string, front = 8, back = 6) => {
  if (hash.length <= front + back) return hash
  return `${hash.slice(0, front)}...${hash.slice(-back)}`
}

/**
 * Shortens text based on type (address vs hash)
 * @param text - The text to shorten
 * @param type - Type of text ('address' or 'hash')
 * @returns Shortened text
 */
export const shortenText = (text: string, type: 'address' | 'hash' = 'address') => {
  if (type === 'hash') {
    return shortenHash(text)
  }
  return ellipseAddress(text)
}
