import dynamic from 'next/dynamic';

const ResentSales = dynamic(() =>
  import('./resent-sales').then((mod) => mod.ResentSales)
);

const InfoCards = dynamic(() => import('./info-cards'));

const BarCharts = dynamic(() =>
  import('./bar-chart').then((mod) => mod.BarCharts)
);

export default function DashboardContainer() {
  return (
    <div className="container mx-auto" style={{ maxWidth: '95%' }}>
      <InfoCards />
      <div className="grid grid-cols-1 gap-y-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-7 lg:space-x-4">
        <BarCharts />
        <ResentSales />
      </div>
      {/* <div className="p-4 pt-0">
        <h3 className="font scroll-m-20 pb-4 text-2xl font-semibold tracking-tight">
          მომხმარებლები
        </h3>
        <TableInvoice />
      </div> */}

      {/* <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50">lol</div>
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div> */}
    </div>
  );
}
