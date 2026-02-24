import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyTicketSignature } from '@/lib/generate-ticket-signature';

export async function POST(request: NextRequest) {
  try {
    const { qrData } = await request.json();
    
    if (!qrData) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Kein QR-Code gescannt' 
      }, { status: 400 });
    }

    // QR Format: "ticketId-signature"
    const parts = qrData.split('-');
    if (parts.length !== 2) {
      return NextResponse.json({ 
        valid: false, 
        message: 'Ungültiges Ticket-Format' 
      }, { status: 400 });
    }

    const ticketId = parseInt(parts[0]);
    const signature = parts[1];

    // 1. SIGNATUR PRÜFEN
    if (!verifyTicketSignature(ticketId, signature)) {
      console.log('❌ Ungültige Signatur:', qrData);
      return NextResponse.json({ 
        valid: false, 
        message: '🚫 GEFÄLSCHT - Ungültige Signatur!' 
      }, { status: 400 });
    }

    // 2. TICKET IN DB SUCHEN
    // ticketId Format: RRRNNN (z.B. 5014 = E14)
    const rowNum = Math.floor(ticketId / 1000);
    const seatNum = ticketId % 1000;
    
    // Konvertiere Nummer zurück zu Buchstabe
    let row = '';
    let num = rowNum;
    while (num > 0) {
      row = String.fromCharCode(64 + (num % 26 || 26)) + row;
      num = Math.floor((num - 1) / 26);
    }

    const seat = await prisma.seat.findUnique({
      where: { 
        row_number: { row, number: seatNum } 
      }
    });

    if (!seat) {
      return NextResponse.json({ 
        valid: false, 
        message: '❌ Ticket nicht gefunden' 
      }, { status: 404 });
    }

    // 3. STATUS PRÜFEN
    if (seat.status !== 'paid') {
      return NextResponse.json({ 
        valid: false, 
        message: `❌ Ticket nicht bezahlt (Status: ${seat.status})` 
      }, { status: 400 });
    }

    // 4. CHECK-IN STATUS PRÜFEN
    if (seat.checkedIn) {
      return NextResponse.json({ 
        valid: false, 
        alreadyCheckedIn: true,
        checkedInAt: seat.checkedInAt,
        message: `⚠️ BEREITS EINGECHECKT am ${seat.checkedInAt ? new Date(seat.checkedInAt).toLocaleString('de-DE') : 'unbekannt'}`,
        customer: `${seat.firstName} ${seat.lastName}`
      }, { status: 400 });
    }

    // 5. CHECK-IN DURCHFÜHREN
    await prisma.seat.update({
      where: { id: seat.id },
      data: {
        checkedIn: true,
        checkedInAt: new Date()
      }
    });

    console.log('✅ Check-in erfolgreich:', row, seatNum, seat.firstName, seat.lastName);

    // 6. SUCCESS
    return NextResponse.json({ 
      valid: true,
      message: '✅ GÜLTIGES TICKET',
      customer: `${seat.firstName} ${seat.lastName}`,
      seat: `Reihe ${row}, Platz ${seatNum}`,
      email: seat.email
    });

  } catch (error) {
    console.error('❌ Validierungs-Fehler:', error);
    return NextResponse.json({ 
      valid: false, 
      message: 'Server-Fehler bei der Validierung' 
    }, { status: 500 });
  }
}