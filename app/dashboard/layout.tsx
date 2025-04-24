import Header from '@/components/shared/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AuthProvider from '../api/auth/[...nextauth]/auth-provider';
import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import { AppSidebar } from '../_components/app-sidebar';

async function Layout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  return (
    <AuthProvider session={session}>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}

export default Layout;
