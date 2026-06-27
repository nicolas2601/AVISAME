
export function isValidColombianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^3\d{9}$/.test(cleaned);
}

