"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 left-4 z-[1000] bg-white/90 backdrop-blur rounded-lg shadow-lg">
      <div className="flex gap-1 p-1">
        <Link
          href="/"
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            pathname === "/" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Map
        </Link>
        <Link
          href="/calendar"
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            pathname === "/calendar" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Calendar
        </Link>
      </div>
    </nav>
  );
}
