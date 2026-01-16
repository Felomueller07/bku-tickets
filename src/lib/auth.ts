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
          console.log('🔍 Suche User in DB...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user) {
            console.log('❌ User nicht gefunden');
            return null;
          }

          console.log('✅ User gefunden! ID:', user.id, 'Role:', user.role);

          if (!user.emailVerified) {
            console.log('❌ Email nicht verifiziert');
            throw new Error('Bitte bestätige zuerst deine Email-Adresse');
          }

          console.log('🔐 Prüfe Passwort...');
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isValid) {
            console.log('❌ Passwort falsch');
            return null;
          }

          console.log('✅ Login erfolgreich!');

          return {
            id: user.id.toString(),
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
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
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
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
