"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const pathname = usePathname() || "/";

  const tabs = [
    { href: "/products", label: "Products" },
    { href: "/stocks", label: "Stocks" },
    { href: "/purchase-requests", label: "Purchase Requests" }
  ];

  return (
    <nav className="border-b bg-white">
      <div className="w-full px-4">
        <div className="flex items-center justify-start h-12">
          <div className="flex space-x-1">
            {tabs.map((t) => {
              const isActive = pathname === t.href || pathname.startsWith(t.href + "/");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  className={`inline-flex items-center px-4 py-2 -mb-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300"
                  }`}
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
