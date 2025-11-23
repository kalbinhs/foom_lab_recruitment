'use client';

import { useEffect, useState } from 'react';

interface Product {
  id: number;
  name: string;
  sku: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [productName, setProductName] = useState('');
  const [skuBarcode, setSkuBarcode] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products', {
          headers: { 'secret-key': 'foom123' }
        });

        if (!res.ok) throw new Error('Failed to fetch products');

        const data = await res.json();

        if (data.response_code !== 200) throw new Error(data.response_message);

        setProducts(data.data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const openModal = () => {
    setFormError('');
    setProductName('');
    setSkuBarcode('');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!productName || !skuBarcode) {
      setFormError('Both fields are required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'secret-key': 'foom123' },
        body: JSON.stringify({ product_name: productName, sku_barcode: skuBarcode })
      });

      const data = await res.json();
      if (!res.ok || data.response_code >= 400) {
        throw new Error(data.response_message || 'Failed to create product');
      }

      // API returns created product in data.data (per existing controller)
      const created = data.data;
      setProducts((p) => [created, ...p]);
      closeModal();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || 'Failed to create product');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={openModal}
          className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
        >
          Add product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Name</th>
            <th className="py-2 px-4 border-b text-left">SKU</th>
            <th className="py-2 px-4 border-b text-left">Created At</th>
            <th className="py-2 px-4 border-b text-left">Updated At</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{p.id}</td>
              <td className="py-2 px-4 border-b text-left">{p.name}</td>
              <td className="py-2 px-4 border-b">{p.sku}</td>
              <td className="py-2 px-4 border-b">{new Date(p.createdAt).toLocaleString()}</td>
              <td className="py-2 px-4 border-b">{new Date(p.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-medium mb-4">Create product</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Product name</label>
                <input
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="Blue Raspberry"
                />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">SKU barcode</label>
                <input
                  value={skuBarcode}
                  onChange={(e) => setSkuBarcode(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="BLUERAP"
                />
              </div>

              {formError && <div className="text-sm text-red-500 mb-3">{formError}</div>}

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={closeModal} className="px-3 py-2 rounded border">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-60"
                >
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
