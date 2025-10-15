/**
 * Generates a random alphanumeric ID
 * @param len Length of the ID to generate (default: 8)
 * @returns Random alphanumeric string
 */
export const id = (len: number = 8): string => {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz";
  let shortUuid = "";
  for (let i = 0; i < len; i++) {
    shortUuid += chars[Math.floor(Math.random() * chars.length)];
  }
  return shortUuid;
};
