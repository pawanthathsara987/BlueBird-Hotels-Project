import React from "react";
import { CreditCard, FileText } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PaymentsTab({
  payments,
  isEmptyState,
  maskCard
}) {
  // Local Empty State Renderer
  const renderEmptyState = (title, message, iconComponent, buttonText, onClickAction) => (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white/60 backdrop-blur-md border border-blue-50/50 rounded-3xl text-center space-y-5">
      <div className="p-4 bg-cyan-50 rounded-full text-cyan-600 animate-bounce">
        {iconComponent}
      </div>
      <div className="space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-blue-950">{title}</h3>
        <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
      </div>
      {buttonText && (
        <button
          onClick={onClickAction}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-900 to-cyan-700 hover:from-blue-800 hover:to-cyan-600 text-white font-medium text-sm rounded-xl transition-all duration-300 shadow-md shadow-blue-900/10 hover:shadow-blue-900/20 active:scale-95"
        >
          {buttonText}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Payment &amp; Billing Ledger</h2>
          <p className="text-slate-500 text-xs mt-0.5">Secure history of suite deposits, custom tours, and downloads of formal PDF invoices.</p>
        </div>
      </div>

      {isEmptyState || payments.length === 0 ? (
        renderEmptyState(
          "No Ledger History",
          "Secure transaction records will register here once suite booking operations are finalized.",
          <CreditCard size={36} />,
          null,
          null
        )
      ) : (
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl overflow-hidden shadow-xs">
          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-950 text-white text-[10px] tracking-widest font-bold uppercase border-b border-blue-900">
                  <th className="py-4 px-6">TRANSACTION ID</th>
                  <th className="py-4 px-6">DATE</th>
                  <th className="py-4 px-6">DESCRIPTION</th>
                  <th className="py-4 px-6">METHOD</th>
                  <th className="py-4 px-6 text-right">AMOUNT</th>
                  <th className="py-4 px-6">STATUS</th>
                  <th className="py-4 px-6 text-center">INVOICE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-mono font-medium text-blue-950">{pay.id}</td>
                    <td className="py-4 px-6 text-slate-500">{new Date(pay.date).toLocaleDateString()}</td>
                    <td className="py-4 px-6 font-semibold text-blue-950">{pay.description}</td>
                    <td className="py-4 px-6 text-slate-500">{maskCard(pay.method)}</td>
                    <td className={`py-4 px-6 text-right font-serif font-bold ${pay.amount < 0 ? "text-rose-600" : "text-blue-950"}`}>
                      {pay.amount < 0 ? "-" : ""}${Math.abs(pay.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 font-bold text-[9px] rounded-full uppercase border ${pay.status === "Succeeded" ? "bg-blue-5 border-blue-100 text-blue-900" : "bg-cyan-5 border-cyan-100 text-cyan-900"}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => {
                          toast.success(`Mock PDF downloaded for ${pay.id}!`);
                        }}
                        className="p-1.5 text-slate-500 hover:text-blue-900 hover:bg-slate-100 rounded-lg transition-all inline-flex items-center gap-1.5 focus:outline-none"
                        aria-label={`Download invoice for transaction ${pay.id}`}
                      >
                        <FileText size={14} />
                        <span className="text-[10px] font-semibold">PDF</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
