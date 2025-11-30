import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user }) {
            const allowedUsers = process.env.ALLOWED_USERS?.split(',').map(u => u.trim()) || [];
            if (allowedUsers.length === 0) {
                console.warn('ALLOWED_USERS is empty. Allowing all users for now (Security Risk). Set ALLOWED_USERS in .env to restrict access.');
                return true;
            }
            if (user.email && allowedUsers.includes(user.email)) {
                return true;
            }
            console.log(`Access denied for user: ${user.email}`);
            return false;
        },
        async session({ session, token }) {
            return session;
        },
    },
})

export { handler as GET, handler as POST }
