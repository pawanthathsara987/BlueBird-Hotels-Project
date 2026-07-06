import React, { useState, useMemo } from "react";
import {
  CreditCard,
  FileText,
  TrendingUp,
  TrendingDown,
  Clock,
  Layers,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCcw,
  BedDouble,
  Car
} from "lucide-react";
import { toast } from "react-hot-toast";

// ─── helpers ───────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n || 0));

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

function StatusBadge({ status }) {
  const map = {
    Succeeded: { cls: "bg-emerald-50 border-emerald-200 text-emerald-800", icon: <CheckCircle2 size={10} /> },
    Pending:   { cls: "bg-amber-50 border-amber-200 text-amber-800",       icon: <Clock size={10} /> },
    Failed:    { cls: "bg-rose-50 border-rose-200 text-rose-700",           icon: <XCircle size={10} /> },
    Refunded:  { cls: "bg-purple-50 border-purple-200 text-purple-800",     icon: <RefreshCcw size={10} /> },
  };
  const s = map[status] || map.Pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${s.cls}`}>
      {s.icon} {status}
    </span>
  );
}

function CategoryIcon({ category }) {
  if (category === "Room Booking") return <BedDouble size={13} className="text-blue-500" />;
  if (category === "Vehicle Rental") return <Car size={13} className="text-indigo-500" />;
  return <CreditCard size={13} className="text-slate-400" />;
}

// ─── Generate printable receipt ─────────────────────────────────────────────
function generateReceipt(pay) {
  const win = window.open("", "_blank", "width=680,height=800");
  if (!win) { toast.error("Please allow pop-ups to download the receipt."); return; }
  win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt – ${pay.refNo || pay.id}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Segoe UI',sans-serif;background:#f8fafc;color:#1e293b;padding:40px;}
        .card{background:#fff;border-radius:16px;padding:40px;max-width:600px;margin:0 auto;box-shadow:0 4px 24px rgba(0,0,0,.08);}
        .header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #e2e8f0;padding-bottom:24px;margin-bottom:24px;}
        .brand{font-size:22px;font-weight:800;color:#1e3a8a;letter-spacing:.5px;}
        .brand small{display:block;font-size:11px;font-weight:400;color:#94a3b8;margin-top:2px;}
        .badge{padding:4px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;}
        .succeeded{background:#ecfdf5;color:#065f46;border:1px solid #6ee7b7;}
        .pending{background:#fffbeb;color:#92400e;border:1px solid #fcd34d;}
        .failed{background:#fff1f2;color:#9f1239;border:1px solid #fecdd3;}
        .refunded{background:#f5f3ff;color:#5b21b6;border:1px solid #c4b5fd;}
        h2{font-size:18px;font-weight:700;margin-bottom:4px;}
        .ref{font-size:12px;color:#64748b;margin-bottom:24px;}
        table{width:100%;border-collapse:collapse;margin-bottom:24px;}
        td{padding:10px 0;font-size:13px;border-bottom:1px solid #f1f5f9;}
        td:first-child{color:#64748b;width:45%;}
        td:last-child{font-weight:600;text-align:right;}
        .total-row td{font-size:16px;font-weight:800;color:#1e3a8a;border-bottom:none;padding-top:16px;}
        .footer{text-align:center;font-size:11px;color:#94a3b8;margin-top:24px;border-top:1px solid #e2e8f0;padding-top:16px;}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <div>
            <div class="brand">BlueBird Hotels<small>Payment Receipt</small></div>
          </div>
          <span class="badge ${(pay.status||'').toLowerCase()}">${pay.status}</span>
        </div>
        <h2>${pay.description || "Payment"}</h2>
        <div class="ref">Reference: ${pay.refNo || pay.id} &nbsp;·&nbsp; Booking: ${pay.bookingRef || "—"}</div>
        <table>
          <tr><td>Transaction ID</td><td>${pay.id}</td></tr>
          <tr><td>Reference No.</td><td>${pay.refNo || "—"}</td></tr>
          <tr><td>Category</td><td>${pay.category || "—"}</td></tr>
          <tr><td>Booking Ref</td><td>${pay.bookingRef || "—"}</td></tr>
          <tr><td>Payment Method</td><td>${(pay.method||"").replace("_"," ").toUpperCase()}</td></tr>
          <tr><td>Date</td><td>${fmtDate(pay.date)} ${fmtTime(pay.date)}</td></tr>
          <tr><td>Currency</td><td>${pay.currency || import.meta.env.VITE_CURRENCY_TYPE || "LKR"}</td></tr>
          ${pay.notes ? `<tr><td>Notes</td><td>${pay.notes}</td></tr>` : ""}
          <tr class="total-row"><td>Amount</td><td>${pay.isRefund ? "- " : ""}${pay.currency || import.meta.env.VITE_CURRENCY_TYPE || "LKR"} ${fmt(pay.amount)}</td></tr>
        </table>
        <div class="footer">BlueBird Hotels &amp; Resorts &nbsp;·&nbsp; This is a system-generated receipt<br/>For queries contact: billing@bluebird.lk</div>
      </div>
      <script>window.onload=()=>window.print();</script>
    </body>
    </html>
  `);
  win.document.close();
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function PaymentsTab({ payments, paymentSummary = {}, isEmptyState, maskCard }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortDir, setSortDir] = useState("desc"); // newest first

  const summary = {
    totalPaid: paymentSummary.totalPaid ?? 0,
    totalRefunded: paymentSummary.totalRefunded ?? 0,
    totalPending: paymentSummary.totalPending ?? 0,
    totalTransactions: paymentSummary.totalTransactions ?? payments.length,
  };

  const filtered = useMemo(() => {
    let list = [...(payments || [])];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        p.id?.toLowerCase().includes(q) ||
        p.refNo?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.bookingRef?.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== "all") list = list.filter(p => p.status === filterStatus);
    if (filterCategory !== "all") list = list.filter(p => p.category === filterCategory);
    list.sort((a, b) => {
      const diff = new Date(a.date) - new Date(b.date);
      return sortDir === "desc" ? -diff : diff;
    });
    return list;
  }, [payments, search, filterStatus, filterCategory, sortDir]);

  if (isEmptyState || payments.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300 font-sans">
        <div className="pb-4 border-b border-slate-200/60">
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Payment & Billing Ledger</h2>
          <p className="text-slate-500 text-xs mt-0.5">Full transaction history for your room bookings and vehicle rentals.</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 bg-white/60 backdrop-blur-md border border-blue-50/50 rounded-3xl text-center space-y-5">
          <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-bounce">
            <CreditCard size={36} />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-semibold text-blue-950">No Transactions Yet</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Your payment history will appear here once you complete a booking or rental.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Payment & Billing Ledger</h2>
          <p className="text-slate-500 text-xs mt-0.5">Complete transaction history for your stays and vehicle rentals.</p>
        </div>
        <span className="self-start sm:self-auto px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full text-xs font-semibold whitespace-nowrap">
          {summary.totalTransactions} Transaction{summary.totalTransactions !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Paid",
            value: `${import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} ${fmt(summary.totalPaid)}`,
            icon: <TrendingUp size={18} />,
            bg: "from-emerald-50 to-teal-50",
            border: "border-emerald-100",
            iconBg: "bg-emerald-100 text-emerald-700",
            text: "text-emerald-900"
          },
          {
            label: "Refunded",
            value: `${import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} ${fmt(summary.totalRefunded)}`,
            icon: <TrendingDown size={18} />,
            bg: "from-purple-50 to-violet-50",
            border: "border-purple-100",
            iconBg: "bg-purple-100 text-purple-700",
            text: "text-purple-900"
          },
          {
            label: "Pending",
            value: `${import.meta.env.VITE_CURRENCY_TYPE || 'LKR'} ${fmt(summary.totalPending)}`,
            icon: <Clock size={18} />,
            bg: "from-amber-50 to-orange-50",
            border: "border-amber-100",
            iconBg: "bg-amber-100 text-amber-700",
            text: "text-amber-900"
          },
          {
            label: "Transactions",
            value: summary.totalTransactions,
            icon: <Layers size={18} />,
            bg: "from-blue-50 to-cyan-50",
            border: "border-blue-100",
            iconBg: "bg-blue-100 text-blue-700",
            text: "text-blue-900"
          },
        ].map((c) => (
          <div key={c.label} className={`bg-gradient-to-br ${c.bg} border ${c.border} rounded-2xl p-4 flex items-center gap-3 shadow-xs`}>
            <div className={`p-2 rounded-xl ${c.iconBg} shrink-0`}>{c.icon}</div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{c.label}</p>
              <p className={`text-sm font-bold ${c.text} truncate`}>{c.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, reference, or description…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-all placeholder:text-slate-400"
          />
        </div>
        {/* Status filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Succeeded">Succeeded</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>
        {/* Category filter */}
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="pl-8 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 appearance-none text-slate-700 cursor-pointer"
          >
            <option value="all">All Categories</option>
            <option value="Room Booking">Room Booking</option>
            <option value="Vehicle Rental">Vehicle Rental</option>
          </select>
        </div>
        {/* Sort toggle */}
        <button
          type="button"
          onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors whitespace-nowrap"
          title={sortDir === "desc" ? "Newest first" : "Oldest first"}
        >
          <ArrowUpDown size={13} />
          {sortDir === "desc" ? "Newest" : "Oldest"}
        </button>
      </div>

      {/* ── Ledger Table ── */}
      <div className="bg-white/90 backdrop-blur-md border border-blue-50/60 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-950 to-blue-900 text-white">
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase">Ref / ID</th>
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase">Date</th>
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase">Description</th>
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase">Method</th>
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase text-right">Amount</th>
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase">Status</th>
                <th className="py-4 px-5 text-[10px] font-bold tracking-widest uppercase text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 text-sm">
                    <AlertCircle size={24} className="mx-auto mb-2 text-slate-300" />
                    No transactions match your filters.
                  </td>
                </tr>
              ) : filtered.map(pay => (
                <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors group">
                  {/* Ref / ID */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-slate-100 rounded-lg shrink-0">
                        <CategoryIcon category={pay.category} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-mono text-[10px] font-bold text-blue-900 truncate">{pay.refNo || pay.id}</p>
                        <p className="text-[9px] text-slate-400 truncate">{pay.id}</p>
                      </div>
                    </div>
                  </td>
                  {/* Date */}
                  <td className="py-3.5 px-5">
                    <p className="text-xs font-semibold text-slate-700">{fmtDate(pay.date)}</p>
                    <p className="text-[10px] text-slate-400">{fmtTime(pay.date)}</p>
                  </td>
                  {/* Description */}
                  <td className="py-3.5 px-5 max-w-[200px]">
                    <p className="text-xs font-semibold text-blue-950 truncate">{pay.description}</p>
                    <p className="text-[10px] text-slate-400">Booking {pay.bookingRef}</p>
                    {pay.notes && (
                      <p className="text-[10px] text-amber-600 truncate mt-0.5 italic">"{pay.notes}"</p>
                    )}
                  </td>
                  {/* Method */}
                  <td className="py-3.5 px-5">
                    <span className="text-xs text-slate-600 capitalize">{(pay.method || "online").replace("_", " ")}</span>
                  </td>
                  {/* Amount */}
                  <td className="py-3.5 px-5 text-right">
                    <span className={`text-sm font-bold font-serif ${pay.isRefund ? "text-purple-700" : pay.status === "Failed" ? "text-rose-600" : "text-blue-950"}`}>
                      {pay.isRefund ? "- " : ""}{pay.currency || import.meta.env.VITE_CURRENCY_TYPE || "LKR"} {fmt(pay.amount)}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="py-3.5 px-5">
                    <StatusBadge status={pay.status} />
                  </td>
                  {/* Receipt */}
                  <td className="py-3.5 px-5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        generateReceipt(pay);
                        toast.success(`Opening receipt for ${pay.refNo || pay.id}`, {
                          style: { borderRadius: "8px", background: "#1e3a8a", color: "#fff" }
                        });
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-lg transition-all duration-150 group-hover:shadow-sm"
                      aria-label={`Download receipt for ${pay.id}`}
                    >
                      <Download size={11} />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
            <span>Showing <strong className="text-blue-900">{filtered.length}</strong> of <strong className="text-blue-900">{payments.length}</strong> transactions</span>
            <span className="text-[10px]">Amounts shown in original currency · All times local</span>
          </div>
        )}
      </div>

    </div>
  );
}
