import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: ['/', '/pricing', '/sign-in(.*)', '/sign-up(.*)'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};