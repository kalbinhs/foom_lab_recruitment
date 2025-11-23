import PurchaseRequestTable from '@/components/PurchaseRequestTable';

export default function PurchaseRequestsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Purchase Requests</h1>
      <PurchaseRequestTable />
    </div>
  );
}
