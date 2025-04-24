'use client';

import { SessionProvider } from 'next-auth/react';
import { SessionGuard } from './session-guard';

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}): React.ReactNode {
  return (
    <SessionProvider session={session}>
      <SessionGuard>{children}</SessionGuard>
    </SessionProvider>
  );
}
