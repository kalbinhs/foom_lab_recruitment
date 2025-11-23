import PurchaseRequestDetail from '@/components/PurchaseRequestDetail';

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <PurchaseRequestDetail id={params.id} />
    </div>
  );
}
