import { Resend } from 'resend';
import { generateTicketPDF } from './generate-ticket-pdf';

const resend = new Resend(process.env.RESEND_API_KEY);

interface TicketEmailData {
  customerEmail: string;
  customerName: string;
  seats: Array<{
    row: string;
    number: number;
    firstName: string;
    lastName: string;
  }>;
  totalAmount: number;
  paymentDate: string;
}

export async function sendTicketConfirmation(data: TicketEmailData) {
  const { customerEmail, customerName, seats, totalAmount, paymentDate } = data;
  
  // PDF generieren mit Ticket-IDs
  const pdfSeats = seats.map((seat, index) => ({
    row: seat.row,
    number: seat.number,
    firstName: seat.firstName,
    lastName: seat.lastName,
    ticketId: Date.now() + index // Eindeutige ID generieren
  }));

  const pdfBuffer = await generateTicketPDF({
    seats: pdfSeats,
    totalAmount: totalAmount,
  });

  try {
    const { data: emailData, error } = await resend.emails.send({
      from: 'BKU Tickets <noreply@untgab.com>',
      to: customerEmail,
      subject: '�� Ticket-Bestätigung - Josefi Konzert 2026',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #d4af37 0%, #f4e7c3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: #000; margin: 0;">🎫 Ticket-Bestätigung</h1>
            <p style="color: #333; margin: 10px 0 0 0;">Josefi Konzert 2026 - Kursaal Meran</p>
          </div>
          
          <div style="background: #fff; padding: 30px; border: 1px solid #e5e5e5; border-top: none;">
            <p style="font-size: 16px; color: #333;">Hallo ${customerName},</p>
            
            <p style="font-size: 14px; color: #666;">
              vielen Dank für Ihre Bestellung! Ihre Tickets wurden erfolgreich reserviert.
            </p>
            
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0 0 15px 0; color: #d4af37; font-size: 18px;">📍 Ihre Sitzplätze:</h2>
              <div style="font-family: monospace; font-size: 14px; line-height: 1.8; color: #333;">
                ${seats.map(seat => 
                  `<div>Sitz <strong>${seat.row}${seat.number}</strong> - ${seat.firstName} ${seat.lastName}</div>`
                ).join('')}
              </div>
            </div>
            
            <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Anzahl Tickets:</span>
                <strong style="color: #333;">${seats.length}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Gesamtbetrag:</span>
                <strong style="color: #d4af37; font-size: 18px;">€${(totalAmount / 100).toFixed(2)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666;">Zahlungsdatum:</span>
                <span style="color: #333;">${paymentDate}</span>
              </div>
            </div>

            <div style="background: #fff3cd; border: 2px solid #d4af37; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #856404; font-weight: bold;">📎 Ihre Tickets im Anhang</p>
              <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">
                Bitte bringen Sie die Tickets ausgedruckt oder digital zum Konzert mit.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Veranstaltung: <strong>22. März 2026, 19:00 Uhr</strong><br/>
              Ort: <strong>Kursaal Meran</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 30px 0;" />
            
            <p style="font-size: 12px; color: #999; text-align: center;">
              Bei Fragen wenden Sie sich bitte an: info@bku.com
            </p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: 'BKU-Tickets.pdf',
          content: pdfBuffer,
        }
      ]
    });

    if (error) {
      console.error('❌ Email Fehler:', error);
      return { success: false, error };
    }

    console.log('✅ Email gesendet:', emailData);
    return { success: true, data: emailData };
  } catch (error) {
    console.error('❌ Email Fehler:', error);
    return { success: false, error };
  }
}
