'use client';

import { useSession, signOut } from 'next-auth/react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Quick check on session status
    if (session?.token === null) {
      router.push('/');
      return;
    }

    // If we have a session, do a quick token validation on page load
    if (session?.token) {
      const validateToken = async () => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/user`,
            {
              headers: {
                Authorization: `Bearer ${session.token}`,
              },
            }
          );

          if (!response.ok) {
            console.log('Token validation failed on page load, logging out');
            await signOut({ callbackUrl: '/' });
          }
        } catch (error) {
          // Network errors shouldn't log the user out
          console.error('Error checking token on page load:', error);
        }
      };

      // Run validation
      validateToken();
    }
  }, [session, status, pathname, router]);

  return <>{children}</>;
}
