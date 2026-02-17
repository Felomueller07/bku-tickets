import { NextRequest, NextResponse } from 'next/server';
import { generateTicketPDF } from '@/lib/generate-ticket-pdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { seat } = body;

    if (!seat || !seat.row || !seat.number || !seat.firstName || !seat.lastName) {
      return NextResponse.json({ error: 'Missing seat data' }, { status: 400 });
    }

    // Ticket-ID generieren (eindeutig basierend auf Reihe + Platz + Timestamp)
    const ticketId = Date.now() + parseInt(seat.row.charCodeAt(0)) + parseInt(seat.number);

    const pdfBuffer = await generateTicketPDF({
      seats: [{
        row: seat.row,
        number: seat.number,
        firstName: seat.firstName,
        lastName: seat.lastName,
        ticketId: ticketId,
      }],
      totalAmount: 2000, // 20 Euro in Cent
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Ticket_${seat.row}${seat.number}_JosefiKonzert2026.pdf"`,
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'PDF generation failed' }, { status: 500 });
  }
}
