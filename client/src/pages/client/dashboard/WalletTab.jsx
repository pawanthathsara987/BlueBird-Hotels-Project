import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Calendar,
  History,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { toast } from "react-hot-toast";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(n || 0));

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";

export default function WalletTab() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = async (showToast = false) => {
    try {
      if (showToast) setRefreshing(true);
      const token = sessionStorage.getItem("customerToken") || localStorage.getItem("customerToken");
      const backendBaseUrl = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3002/api").replace(/\/$/, "");

      const res = await axios.get(`${backendBaseUrl}/customers/wallet`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        setBalance(res.data.data.balance);
        setTransactions(res.data.data.transactions || []);
        if (showToast) toast.success("Wallet balance synced!");
      }
    } catch (e) {
      console.error("Error fetching wallet:", e);
      toast.error("Failed to load wallet information.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Compute stats
  const totalDeposits = transactions
    .filter(t => t.type === "deposit")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  const totalWithdrawals = transactions
    .filter(t => t.type === "withdrawal")
    .reduce((sum, t) => sum + parseFloat(t.amount || 0), 0);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-500">Unlocking your luxury wallet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-blue-950 flex items-center gap-2.5">
            <Sparkles className="text-amber-500 fill-amber-400" size={20} />
            My Hotel Wallet
          </h2>
          <p className="text-slate-550 text-xs mt-1">
            Store refunds, manage credits, and pay seamlessly for future booking reservations.
          </p>
        </div>
        <button
          onClick={() => fetchWalletData(true)}
          disabled={refreshing}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-900 hover:text-white bg-blue-50 hover:bg-blue-900 border border-blue-100 rounded-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
        >
          <RefreshCcw size={13} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Syncing..." : "Sync Balance"}
        </button>
      </div>

      {/* WALLET SUMMARY METRICS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* PREMIUM CARD BALANCE */}
        <div className="relative overflow-hidden lg:col-span-1 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-6 shadow-xl shadow-blue-950/15 border border-slate-800">
          {/* Abstract glows */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 text-blue-400">
              <Wallet size={20} />
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 px-2.5 py-1 rounded-full">
              Active Wallet
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Available Balance</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold tracking-tight">LKR {fmt(balance)}</span>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex justify-between text-[11px] text-slate-400">
            <div>
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Account ID</p>
              <p className="font-mono text-slate-200 mt-0.5">BBL-WLT-{transactions.length ? transactions[0].walletId : "NEW"}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Currency</p>
              <p className="font-semibold text-slate-200 mt-0.5">LKR (Sri Lankan Rupee)</p>
            </div>
          </div>
        </div>

        {/* METRICS CARD - TOTAL DEPOSITS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Refund Deposits</span>
              <h3 className="text-xl font-bold text-blue-950">LKR {fmt(totalDeposits)}</h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-[11px] text-slate-550 mt-4 leading-relaxed">
            Credits returned automatically or manually due to cancelled bookings or package modifications.
          </p>
        </div>

        {/* METRICS CARD - TOTAL WITHDRAWALS */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Wallet Payments</span>
              <h3 className="text-xl font-bold text-blue-950">LKR {fmt(totalWithdrawals)}</h3>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown size={16} />
            </div>
          </div>
          <p className="text-[11px] text-slate-550 mt-4 leading-relaxed">
            Deductions applied to settle reservations or checkout charges directly using your digital balance.
          </p>
        </div>

      </div>

      {/* TRANSACTION HISTORY SECTION */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History size={16} className="text-blue-950" />
            <h3 className="font-serif font-bold text-blue-950 text-sm">Transaction Ledger</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
            {transactions.length} records
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full text-blue-600 animate-bounce">
              <Wallet size={32} />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-blue-950">No Wallet Activity</h4>
              <p className="text-slate-400 text-xs leading-relaxed">
                Your wallet transaction history is empty. Refund deposits will appear here when you cancel a booking and opt for a wallet refund.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {transactions.map((tx) => {
              const isDeposit = tx.type === "deposit";
              return (
                <div
                  key={tx.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-slate-55/50 transition duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isDeposit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      }`}
                    >
                      {isDeposit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-blue-950 truncate leading-snug">
                        {tx.description || (isDeposit ? "Refund Credit" : "Payment Settlement")}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                          Ref: {tx.referenceId || `TX-${tx.id}`}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={10} />
                          {fmtDate(tx.createdAt)} at {fmtTime(tx.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span
                      className={`text-xs font-bold ${
                        isDeposit ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {isDeposit ? "+" : "-"} LKR {fmt(tx.amount)}
                    </span>
                    <span className="block text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">
                      {tx.type}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
