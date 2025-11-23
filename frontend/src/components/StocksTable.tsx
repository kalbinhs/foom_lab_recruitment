"use client";

import { useEffect, useState } from "react";

interface ProductRef {
  id: number;
  name: string;
  sku: string;
}

interface Stock {
  id: number;
  warehouse_id: number;
  warehouse_name?: string;
  product_id: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: ProductRef;
}

export default function StocksTable() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/stocks", {
          headers: { "secret-key": "foom123" }
        });

        if (!res.ok) throw new Error("Failed to fetch stocks");

        const data = await res.json();
        if (data.response_code !== 200) throw new Error(data.response_message || "API error");

        setStocks(data.data || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  if (loading) return <p>Loading stocks...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Warehouse</th>
            <th className="py-2 px-4 border-b text-left">Product</th>
            <th className="py-2 px-4 border-b text-left">Quantity</th>
            <th className="py-2 px-4 border-b text-left">Created At</th>
            <th className="py-2 px-4 border-b text-left">Updated At</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((s) => (
            <tr key={s.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{s.id}</td>
              <td className="py-2 px-4 border-b text-left">
                {s.warehouse_name ? (
                  <div>
                    <div className="font-medium">{s.warehouse_name}</div>
                    <div className="text-sm text-gray-500">ID: {s.warehouse_id}</div>
                  </div>
                ) : (
                  <div className="text-sm">ID: {s.warehouse_id}</div>
                )}
              </td>
              <td className="py-2 px-4 border-b text-left">
                {s.product ? (
                  <div>
                    <div className="font-medium">{s.product.name}</div>
                    <div className="text-sm text-gray-500">{s.product.sku}</div>
                  </div>
                ) : (
                  <span className="text-gray-600">N/A</span>
                )}
              </td>
              <td className="py-2 px-4 border-b">{s.quantity}</td>
              <td className="py-2 px-4 border-b">{new Date(s.createdAt).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{new Date(s.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
