import crypto from 'crypto';

export function generateTicketSignature(ticketId: number): string {
  const secret = process.env.TICKET_SECRET_KEY!;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${ticketId}`);
  return hmac.digest('hex').substring(0, 16); // Erste 16 Zeichen
}

export function generateSecureQRData(ticketId: number): string {
  const signature = generateTicketSignature(ticketId);
  // Format: ticketId-signature
  return `${ticketId}-${signature}`;
}

export function verifyTicketSignature(ticketId: number, signature: string): boolean {
  const expectedSignature = generateTicketSignature(ticketId);
  return signature === expectedSignature;
}