import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 Login-Versuch...');
        console.log('📧 Email:', credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Keine Credentials');
          return null;
        }

        try {
          console.log('�� Suche User in DB...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log('❌ User nicht gefunden');
            return null;
          }

          console.log('✅ User gefunden! ID:', user.id, 'Role:', user.role);
          console.log('🔐 Prüfe Passwort...');
          
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.log('❌ Passwort falsch');
            return null;
          }

          console.log('✅ Passwort korrekt! Login erfolgreich für:', user.email);

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error) {
          console.error('❌ Fehler beim Login:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
  },
});
