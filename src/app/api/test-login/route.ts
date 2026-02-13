import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        step: 'USER_NOT_FOUND',
        email 
      });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    return NextResponse.json({ 
      success: isValid,
      step: isValid ? 'PASSWORD_CORRECT' : 'PASSWORD_WRONG',
      user: {
        email: user.email,
        role: user.role,
        firstName: user.firstName
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      step: 'ERROR',
      error: error.message 
    }, { status: 500 });
  }
}
