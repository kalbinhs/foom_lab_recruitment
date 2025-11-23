import ProductTable from '@/components/ProductTable';

export default function ProductsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products List</h1>
      <ProductTable />
    </div>
  );
}
