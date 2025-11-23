import StocksTable from "@/components/StocksTable";

export default function StocksPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Stocks List</h1>
      <StocksTable />
    </div>
  );
}
