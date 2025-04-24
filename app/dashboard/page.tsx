import { getServerSession } from 'next-auth';
import { authOptions } from '../lib/auth';
import DashboardContainer from '../_components/dashboard-container';

async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  return <DashboardContainer />;
}

export default DashboardPage;
