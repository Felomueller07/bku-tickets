import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

interface TicketData {
  seats: Array<{
    row: string;
    number: number;
    firstName: string;
    lastName: string;
    ticketId: number;
  }>;
  totalAmount: number;
}

export async function generateTicketPDF(data: TicketData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // BKU Logo laden und zu base64 konvertieren
  const logoPath = path.join(process.cwd(), 'public', 'bku-logo.png');
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;

  let isFirstPage = true;

  for (const seat of data.seats) {
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // Ticket Container - 18cm breit, zentriert
    const ticketWidth = 180;
    const ticketX = (210 - ticketWidth) / 2;
    let yPos = 30;

    // Border um Ticket
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(ticketX, yPos, ticketWidth, 150);

    // HEADER - Grau
    doc.setFillColor(224, 224, 224);
    doc.rect(ticketX, yPos, ticketWidth, 35, 'F');
    
    // ⭐ BKU Logo einfügen (Links)
    doc.addImage(logoBase64, 'PNG', ticketX + 10, yPos + 7.5, 20, 20);
    
    // Text neben Logo
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('BÜRGERKAPELLE UNTERMAIS', ticketX + 35, yPos + 15);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Josefi Konzert 2026', ticketX + 35, yPos + 23);

    // Border unter Header
    doc.setLineWidth(0.5);
    doc.line(ticketX, yPos + 35, ticketX + ticketWidth, yPos + 35);

    yPos += 40;

    // BODY - Links: Event-Details, Rechts: QR-Code
    
    // Event-Details LINKS
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 102, 102);
    doc.text('VERANSTALTUNG', ticketX + 10, yPos);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('22. März 2026 · 19:00 Uhr', ticketX + 10, yPos + 7);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Kursaal Meran', ticketX + 10, yPos + 13);

    yPos += 20;

    // Sitzplatz-Details
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 102, 102);
    doc.text('SITZPLATZ', ticketX + 10, yPos);
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`Reihe ${seat.row}, Platz ${seat.number}`, ticketX + 10, yPos + 10);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 102, 102);
    const bereich = ['BA', 'BB', 'BC', 'BD', 'BM'].includes(seat.row) ? 'Galerie' : 'Parkett';
    doc.text(bereich, ticketX + 10, yPos + 17);

    // QR-Code RECHTS
    const qrCodeData = `BKU-2026-${String(seat.ticketId).padStart(5, '0')}`;
    const qrCodeImage = await QRCode.toDataURL(qrCodeData, {
      width: 400,
      margin: 1,
      errorCorrectionLevel: 'H'
    });
    
    // QR-Code Box mit Border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(ticketX + 135, yPos - 10, 35, 35);
    doc.addImage(qrCodeImage, 'PNG', ticketX + 137, yPos - 8, 31, 31);

    yPos += 35;

    // Gestrichelte Linie
    doc.setLineDash([2, 2]);
    doc.setLineWidth(0.3);
    doc.line(ticketX + 10, yPos, ticketX + ticketWidth - 10, yPos);
    doc.setLineDash([]);

    yPos += 8;

    // Ticket-Nummer LINKS
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 102, 102);
    doc.text('TICKET NR.', ticketX + 10, yPos);
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`BKU-2026-${String(seat.ticketId).padStart(5, '0')}`, ticketX + 10, yPos + 6);

    // Preis RECHTS
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(102, 102, 102);
    doc.text('PREIS', ticketX + ticketWidth - 10, yPos, { align: 'right' });
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('20,00 €', ticketX + ticketWidth - 10, yPos + 10, { align: 'right' });

    yPos += 18;

    // FOOTER - Grau
    doc.setFillColor(224, 224, 224);
    doc.rect(ticketX, yPos, ticketWidth, 12, 'F');
    
    // Border über Footer
    doc.setLineWidth(0.5);
    doc.line(ticketX, yPos, ticketX + ticketWidth, yPos);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Bitte ausgedruckt oder digital am Einlass vorzeigen', ticketX + ticketWidth / 2, yPos + 7, { align: 'center' });
  }

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
  return pdfBuffer;
}
