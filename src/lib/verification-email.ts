import { Resend } from 'resend';
import { PrismaClient } from '@prisma/client';

const resend = new Resend(process.env.RESEND_API_KEY);
const prisma = new PrismaClient();

// 6-stelligen Code generieren
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendVerificationEmail(userId: number, email: string, name: string) {
  try {
    // Code generieren
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 Minuten

    // In Datenbank speichern
    await prisma.verificationCode.upsert({
      where: { userId },
      update: { code, expiresAt },
      create: { userId, code, expiresAt },
    });

    // Email senden
    const { data, error } = await resend.emails.send({
      from: 'BKU Tickets <noreply@untgab.com>',
     to: email,
      subject: '🔐 Email-Bestätigung - BKU Tickets',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #000; margin: 0;">🔐 Email-Bestätigung</h1>
            <p style="color: #333; margin: 10px 0 0 0;">BKU Tickets</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
            <p style="font-size: 16px; color: #333;">Hallo ${name},</p>
            
            <p style="font-size: 14px; color: #666;">
              willkommen bei BKU Tickets! Bitte bestätige deine Email-Adresse mit folgendem Code:
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Dein Bestätigungscode:</p>
              <div style="font-size: 36px; font-weight: bold; color: #d4af37; letter-spacing: 8px; font-family: monospace;">
                ${code}
              </div>
            </div>
            
            <p style="font-size: 14px; color: #666;">
              Der Code ist <strong>15 Minuten</strong> gültig.
            </p>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px;">
              Falls du dich nicht registriert hast, ignoriere diese Email.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Verification Email Fehler:', error);
      return { success: false, error };
    }

    console.log('✅ Verification Email gesendet:', email);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Verification Email Fehler:', error);
    return { success: false, error };
  }
}

export async function verifyCode(userId: number, code: string): Promise<boolean> {
  try {
    const verification = await prisma.verificationCode.findUnique({
      where: { userId }
    });

    if (!verification) {
      return false;
    }

    // Code abgelaufen?
    if (new Date() > verification.expiresAt) {
      return false;
    }

    // Code korrekt?
    if (verification.code !== code) {
      return false;
    }

    // User als verifiziert markieren
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true }
    });

    // Verification Code löschen
    await prisma.verificationCode.delete({
      where: { userId }
    });

    return true;
  } catch (error) {
    console.error('❌ Verify Code Fehler:', error);
    return false;
  }
}
