"use client";

import { useEffect, useState } from "react";

interface Item {
  id: number;
  quantity: number;
  product?: { id: number; name: string; sku: string };
}

interface PurchaseRequest {
  id: number;
  reference: string;
  status: string;
  warehouse?: { id?: number; name?: string } | null;
  items?: Item[];
  createdAt?: string;
}

export default function PurchaseRequestDetail({ id }: { id: string }) {
  const [pr, setPr] = useState<PurchaseRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPR = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/request/purchase/${id}`, {
          headers: { "secret-key": "foom123" }
        });
        if (!res.ok) throw new Error("Failed to fetch purchase request detail");
        const data = await res.json();
        if (data.response_code !== 200) throw new Error(data.response_message || "API error");
        setPr(data.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchPR();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!pr) return <p>No data</p>;

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{pr.reference}</h2>
        <div className="text-sm text-gray-600">Status: {pr.status}</div>
        <div className="mt-2">
          Warehouse:{' '}
          {pr.warehouse && pr.warehouse.name ? (
            <>
              <span className="font-medium">{pr.warehouse.name}</span>
              {pr.warehouse.id ? <span className="text-sm text-gray-500"> (ID: {pr.warehouse.id})</span> : null}
            </>
          ) : (
            <span className="text-sm">ID: {pr.warehouse?.id ?? 'N/A'}</span>
          )}
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b text-left">#</th>
                <th className="py-2 px-4 border-b text-left">Product</th>
                <th className="py-2 px-4 border-b text-left">SKU</th>
                <th className="py-2 px-4 border-b text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {pr.items && pr.items.length > 0 ? (
                pr.items.map((it) => (
                  <tr key={it.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{it.id}</td>
                    <td className="py-2 px-4 border-b">{it.product?.name ?? '-'}</td>
                    <td className="py-2 px-4 border-b">{it.product?.sku ?? '-'}</td>
                    <td className="py-2 px-4 border-b">{it.quantity}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-4 px-4" colSpan={4}>
                    No items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
