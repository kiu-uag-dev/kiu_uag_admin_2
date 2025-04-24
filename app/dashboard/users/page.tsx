import dynamic from 'next/dynamic';

const TableInvoice = dynamic(() =>
  import('./components/table').then(
    (mod) => mod.TableInvoice
  )
);

export default function GeneralSettingsPage() {
  return (
    <div className="p-4">
      <TableInvoice />
    </div>
  );
}