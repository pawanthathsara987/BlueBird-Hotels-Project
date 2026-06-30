import React from "react";
import { FileText, X } from "lucide-react";

export default function FinalBillModal({
  show,
  onClose,
  selectedBooking,
  billPreview,
  previewLoading,
  manualDamageFee,
  setManualDamageFee,
  manualFuelFee,
  setManualFuelFee,
  billExtraNotes,
  setBillExtraNotes,
  submitting,
  handleGenerateBill,
  formatMoney
}) {
  if (!show || !selectedBooking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Generate Final Bill
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-sm text-indigo-800 font-medium">Booking: {selectedBooking.bookingNo}</p>
            <p className="text-sm text-indigo-600 mt-1">Vehicle: {selectedBooking.vehicle?.brand} {selectedBooking.vehicle?.model}</p>
          </div>

          {previewLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
              <p className="text-sm text-gray-500">Calculating late fees & mileage...</p>
            </div>
          ) : billPreview ? (
            <form id="billForm" onSubmit={handleGenerateBill} className="space-y-5">
              {/* System Calculated Fees */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-2 border-b pb-2">System Calculated Charges</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Late Return Fee</span>
                  <span className="font-semibold text-gray-900">{formatMoney(billPreview.lateFee)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Extra Mileage Fee</span>
                  <span className="font-semibold text-gray-900">{formatMoney(billPreview.extraMileageFee)}</span>
                </div>
              </div>

              {/* Manual Inputs */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700">Manager Adjustments</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Damage Fee (Manual Entry)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{process.env.CURRENCY_TYPE || 'LKR'}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={manualDamageFee}
                      onChange={(e) => setManualDamageFee(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                  {billPreview.securityDepositAmount > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Note: Damage fee will be capped at the security deposit amount ({formatMoney(billPreview.securityDepositAmount)}).
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Refill Charge (Manual Entry)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">{process.env.CURRENCY_TYPE || 'LKR'}</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={manualFuelFee}
                      onChange={(e) => setManualFuelFee(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Extra Notes</label>
                  <textarea
                    rows="2"
                    value={billExtraNotes}
                    onChange={(e) => setBillExtraNotes(e.target.value)}
                    placeholder="Any comments regarding these charges..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              {/* Summary */}
              {(() => {
                let damage = Number(manualDamageFee) || 0;
                if (damage > billPreview.securityDepositAmount) damage = billPreview.securityDepositAmount;
                const fuel = Number(manualFuelFee) || 0;
                const totalExtra = billPreview.lateFee + billPreview.extraMileageFee + damage + fuel;
                
                const depositCollected = billPreview.securityDepositCollected || 0;
                const remaining = depositCollected - totalExtra;

                return (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="flex justify-between text-sm text-indigo-900 mb-2">
                      <span>Total Additional Charges:</span>
                      <span className="font-semibold">{formatMoney(totalExtra)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-indigo-900 mb-2 border-b border-indigo-200 pb-2">
                      <span>Security Deposit Collected:</span>
                      <span className="font-semibold">{formatMoney(depositCollected)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-bold text-indigo-900 mt-2">
                      {remaining > 0 ? (
                        <>
                          <span className="text-emerald-700">Amount to Refund:</span>
                          <span className="text-emerald-700 text-lg">{formatMoney(remaining)}</span>
                        </>
                      ) : remaining < 0 ? (
                        <>
                          <span className="text-rose-700">Amount Owed by Customer:</span>
                          <span className="text-rose-700 text-lg">{formatMoney(Math.abs(remaining))}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-indigo-700">Balance Settled:</span>
                          <span className="text-indigo-700 text-lg">{process.env.CURRENCY_TYPE || 'LKR'} 0.00</span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-indigo-600 mt-3 text-center">
                      Generating the bill will finalize these charges and mark the booking as completed.
                    </p>
                  </div>
                );
              })()}
            </form>
          ) : null}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="billForm"
            disabled={submitting || previewLoading || !billPreview}
            className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            Generate Bill
          </button>
        </div>
      </div>
    </div>
  );
}
