import { Outlet } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="relative z-0 flex min-h-0 flex-1 flex-col px-4 pb-16 pt-6">
        <Outlet />
      </main>
    </div>
  );
}
