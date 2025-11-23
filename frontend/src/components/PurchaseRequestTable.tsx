"use client";

import { useEffect, useState } from "react";
// (no external Link or Fragment required)

interface PRItem {
  id: number;
  product?: { id: number; name: string; sku: string };
  quantity: number;
}

interface PurchaseRequest {
  id: number;
  reference: string;
  vendor?: string;
  status: string;
  warehouse?: { id?: number; name?: string } | null;
  items?: PRItem[];
  createdAt?: string;
  updatedAt?: string;
}

export default function PurchaseRequestTable() {
  const [prs, setPrs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [vendor, setVendor] = useState("");
  const [reference, setReference] = useState("");
  const [warehouseIdInput, setWarehouseIdInput] = useState<string>("");
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string; sku?: string }>>([]);
  const [items, setItems] = useState<Array<{ sku_barcode: string; qty: number }>>([
    { sku_barcode: "", qty: 1 }
  ]);
  const [formError, setFormError] = useState("");

  const fetchPRs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/request/purchase", {
        headers: { "secret-key": "foom123" }
      });
      if (!res.ok) throw new Error("Failed to fetch purchase requests");
      const data = await res.json();
      if (data.response_code !== 200) throw new Error(data.response_message || "API error");
      setPrs(data.data || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPRs();
  }, []);

  useEffect(() => {
    // fetch warehouses for dropdown
    const fetchWarehouses = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/warehouses', { headers: { 'secret-key': 'foom123' } });
        if (!res.ok) throw new Error('Failed to fetch warehouses');
        const data = await res.json();
        if (data.response_code !== 200) throw new Error(data.response_message || 'API error');
        setWarehouses(data.data || []);
      } catch (err) {
        // non-fatal: just leave dropdown empty
        console.error(err);
      }
    };

    fetchWarehouses();
    // fetch products for SKU dropdown
    const fetchProducts = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products', { headers: { 'secret-key': 'foom123' } });
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        if (data.response_code !== 200) throw new Error(data.response_message || 'API error');
        setProducts(data.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  const openCreate = () => {
    setFormError("");
    setVendor("");
    setReference("");
    setWarehouseIdInput("");
    setItems([{ sku_barcode: "", qty: 1 }]);
    setEditingId(null);
    setCreateOpen(true);
  };

  const startEdit = (pr: PurchaseRequest) => {
    setFormError("");
    setEditingId(pr.id);
    setVendor((pr as any).vendor || "");
    setReference(pr.reference || "");
    setWarehouseIdInput(pr.warehouse?.id ? String(pr.warehouse.id) : "");
    // map existing items to sku_barcode + qty
    const mapped = pr.items && pr.items.length > 0 ? pr.items.map((it) => ({ sku_barcode: it.product?.sku ?? String(it.product?.id ?? ""), qty: (it as any).quantity ?? (it as any).qty ?? 1 })) : [{ sku_barcode: "", qty: 1 }];
    setItems(mapped as Array<{ sku_barcode: string; qty: number }>);
    setCreateOpen(true);
  };

  const addItemRow = () => setItems((s) => [...s, { sku_barcode: "", qty: 1 }]);
  const removeItemRow = (idx: number) => setItems((s) => s.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: 'sku' | 'qty', value: string | number) => {
    setItems((s) => s.map((it, i) => i === idx ? { sku_barcode: field === 'sku' ? String(value) : it.sku_barcode, qty: field === 'qty' ? Number(value) : it.qty } : it));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!vendor || !reference) {
      setFormError('vendor and reference are required');
      return;
    }
    if (!items || items.length === 0) {
      setFormError('At least one item is required');
      return;
    }
    for (const it of items) {
      if (!it.sku_barcode) { setFormError('Each item needs a SKU'); return; }
      if (!it.qty || it.qty <= 0) { setFormError('Each item needs qty > 0'); return; }
    }

    const qty_total = items.reduce((s, it) => s + Number(it.qty), 0);
    const payload: any = { vendor, reference, qty_total, details: items.map((it) => ({ sku_barcode: it.sku_barcode, qty: it.qty })) };
    if (warehouseIdInput) payload.warehouse_id = Number(warehouseIdInput);

    setCreating(true);
    try {
      let res;
      if (editingId) {
        // update
        res = await fetch(`http://localhost:5000/api/request/purchase/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'secret-key': 'foom123' },
          body: JSON.stringify(payload)
        });
      } else {
        // create
        res = await fetch('http://localhost:5000/api/request/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'secret-key': 'foom123' },
          body: JSON.stringify(payload)
        });
      }
      const data = await res.json();
      if (!res.ok || data.response_code >= 400) {
        throw new Error(data.response_message || (editingId ? 'Failed to update purchase request' : 'Failed to create purchase request'));
      }

      // Refresh list
      await fetchPRs();
      setCreateOpen(false);
      setEditingId(null);
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || (editingId ? 'Update failed' : 'Create failed'));
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    const ok = confirm('Delete this purchase request? This action cannot be undone.');
    if (!ok) return;
    try {
      const res = await fetch(`http://localhost:5000/api/request/purchase/${id}`, {
        method: 'DELETE',
        headers: { 'secret-key': 'foom123' }
      });
      const data = await res.json();
      if (!res.ok || data.response_code >= 400) {
        throw new Error(data.response_message || 'Delete failed');
      }
      // refresh list
      await fetchPRs();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete');
    }
  };

  if (loading) return <p>Loading purchase requests...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <button onClick={openCreate} className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700">
          Create Purchase
        </button>
      </div>
      <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-2 px-4 border-b text-left">ID</th>
            <th className="py-2 px-4 border-b text-left">Reference</th>
            <th className="py-2 px-4 border-b text-left">Status</th>
            <th className="py-2 px-4 border-b text-left">Warehouse</th>
            <th className="py-2 px-4 border-b text-left">Items</th>
            <th className="py-2 px-4 border-b text-left">Created At</th>
            <th className="py-2 px-4 border-b text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {prs.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50">
              <td className="py-2 px-4 border-b">{p.id}</td>
              <td className="py-2 px-4 border-b">{p.reference}</td>
              <td className="py-2 px-4 border-b">{p.status}</td>
              <td className="py-2 px-4 border-b text-left">
                {p.warehouse && p.warehouse.name ? (
                  <div>
                    <div className="font-medium">{p.warehouse.name}</div>
                    <div className="text-sm text-gray-500">ID: {p.warehouse.id}</div>
                  </div>
                ) : (
                  <div className="text-sm">ID: {p.warehouse?.id ?? 'N/A'}</div>
                )}
              </td>
              <td className="py-2 px-4 border-b">{p.items ? p.items.length : 0}</td>
              <td className="py-2 px-4 border-b">{p.createdAt ? new Date(p.createdAt).toLocaleString() : '-'}</td>
              <td className="py-2 px-4 border-b">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedPR(p);
                      setIsOpen(true);
                    }}
                    className="text-indigo-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => startEdit(p)}
                    className="px-2 py-1 text-sm border rounded text-amber-700 hover:bg-amber-50"
                    title="Edit purchase request"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={p.status !== 'DRAFT'}
                    className={`px-2 py-1 text-sm border rounded ${p.status === 'DRAFT' ? 'text-red-600 hover:bg-red-50' : 'opacity-50 cursor-not-allowed'}`}
                    title={p.status === 'DRAFT' ? 'Delete purchase request' : 'Only DRAFT requests can be deleted'}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {isOpen && selectedPR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedPR.reference}</h3>
                <div className="text-sm text-gray-600">Status: {selectedPR.status}</div>
                <div className="mt-1 text-sm">
                  Warehouse: {selectedPR.warehouse?.name ?? 'N/A'}{' '}
                  {selectedPR.warehouse?.id ? <span className="text-gray-500">(ID: {selectedPR.warehouse.id})</span> : null}
                </div>
              </div>
              <div>
                <button onClick={() => setIsOpen(false)} className="px-3 py-2 border rounded">Close</button>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-2 px-3 border-b text-left">#</th>
                      <th className="py-2 px-3 border-b text-left">Product</th>
                      <th className="py-2 px-3 border-b text-left">SKU</th>
                      <th className="py-2 px-3 border-b text-left">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPR.items && selectedPR.items.length > 0 ? (
                      selectedPR.items.map((it) => (
                        <tr key={it.id} className="hover:bg-gray-50">
                          <td className="py-2 px-3 border-b">{it.id}</td>
                          <td className="py-2 px-3 border-b">{it.product?.name ?? '-'}</td>
                          <td className="py-2 px-3 border-b">{it.product?.sku ?? '-'}</td>
                          <td className="py-2 px-3 border-b">{it.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="py-4 px-3" colSpan={4}>
                          No items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded shadow-lg w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Create Purchase Request</h3>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Vendor</label>
                  <input value={vendor} onChange={(e) => setVendor(e.target.value)} className="w-full border px-3 py-2 rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Reference</label>
                  <input value={reference} onChange={(e) => setReference(e.target.value)} className="w-full border px-3 py-2 rounded" />
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Warehouse (optional)</label>
                <select
                  value={warehouseIdInput}
                  onChange={(e) => setWarehouseIdInput(e.target.value)}
                  className="w-64 border px-3 py-2 rounded"
                >
                  <option value="">— Select warehouse (optional) —</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={String(w.id)}>{w.name} (ID: {w.id})</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">Items</h4>
                  <button type="button" onClick={addItemRow} className="px-2 py-1 border rounded text-sm">Add item</button>
                </div>
                <div className="space-y-2">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select value={it.sku_barcode} onChange={(e) => updateItem(idx, 'sku', e.target.value)} className="flex-1 border px-2 py-1 rounded">
                        <option value="">— Select product —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.sku ?? String(p.id)}>{p.name}{p.sku ? ` (SKU: ${p.sku})` : ''}</option>
                        ))}
                      </select>
                      <input type="number" min={1} value={it.qty} onChange={(e) => updateItem(idx, 'qty', Number(e.target.value))} className="w-24 border px-2 py-1 rounded" />
                      <button type="button" onClick={() => removeItemRow(idx)} className="px-2 py-1 border rounded">Remove</button>
                    </div>
                  ))}
                </div>
              </div>

              {formError && <div className="text-sm text-red-500 mb-3">{formError}</div>}

              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setCreateOpen(false)} className="px-3 py-2 rounded border">Cancel</button>
                <button disabled={creating} type="submit" className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-60">
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
