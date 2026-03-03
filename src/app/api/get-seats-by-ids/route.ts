import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { seatIds } = await request.json();
    
    // Parse "E14" → row: "E", number: 14
    const seats = await Promise.all(
      seatIds.map(async (id: string) => {
        const match = id.match(/^([A-Z]+)(\d+)$/);
        if (!match) return null;
        
        const row = match[1];
        const number = parseInt(match[2]);
        
        const seat = await prisma.seat.findUnique({
          where: { row_number: { row, number } }
        });
        
        if (!seat) return null;
        
        return {
          row: seat.row,
          number: seat.number,
          firstName: seat.firstName || '',
          lastName: seat.lastName || '',
          email: seat.email || ''
        };
      })
    );
    
    return NextResponse.json({ 
      seats: seats.filter(s => s !== null) 
    });
    
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch seats' }, { status: 500 });
  }
}