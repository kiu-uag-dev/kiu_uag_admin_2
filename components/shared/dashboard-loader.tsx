import { Card } from '../ui/card';

function DashboardLoader() {
  return (
    <div className="h-screen w-full">
      <div className="grid gap-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-muted/50 p-16" />
        <Card className="bg-muted/50 p-16" />
        <Card className="bg-muted/50 p-16" />
        <Card className="bg-muted/50 p-16" />
      </div>
      <div className="grid grid-cols-1 gap-y-4 p-4 pt-0 md:grid-cols-2 lg:grid-cols-7 lg:space-x-4">
        <Card className="col-span-4 bg-muted/50 p-80" />
        <Card className="col-span-3 bg-muted/50 p-80" />
      </div>
      <Card className="bg-muted/50 p-32" />
    </div>
  );
}

export default DashboardLoader;
