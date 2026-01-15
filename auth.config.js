export const authConfig = {
    pages: {
        signIn: '/auth/signin',
    },
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnExam = nextUrl.pathname.startsWith('/exam');
            const isOnAuth = nextUrl.pathname.startsWith('/auth');

            if (isOnDashboard || isOnAdmin || isOnExam) {
                if (isLoggedIn) return true;
                return false; // Redirect to signin
            }

            if (isOnAuth) {
                if (isLoggedIn) {
                    return Response.redirect(new URL('/dashboard', nextUrl));
                }
                return true;
            }
            return true;
        },
    },
}
