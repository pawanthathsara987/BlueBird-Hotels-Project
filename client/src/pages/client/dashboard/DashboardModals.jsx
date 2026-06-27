import React from "react";
import { X, Star, AlertCircle } from "lucide-react";

export default function DashboardModals({
  isEditProfileOpen,
  setIsEditProfileOpen,
  editProfileForm,
  setEditProfileForm,
  handleSaveProfile,

  isAddReviewOpen,
  setIsAddReviewOpen,
  newReviewForm,
  setNewReviewForm,
  handleAddReviewSubmit,

  isCancelConfirmOpen,
  setIsCancelConfirmOpen,
  selectedBookingForCancel,
  handleConfirmCancel
}) {
  return (
    <>
      {/* A. EDIT PROFILE DIALOG */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsEditProfileOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-serif font-semibold text-lg text-blue-950">Modify Luxury Profile Details</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={editProfileForm.email}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">Telephone Number</label>
                  <input
                    type="tel"
                    required
                    value={editProfileForm.phone}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.address}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Concierge Emergency contact</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.emergencyContact}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, emergencyContact: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-950 to-cyan-800 hover:from-blue-900 text-white font-semibold rounded-xl transition-all"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. WRITE REVIEW DIALOG */}
      {isAddReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsAddReviewOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-serif font-semibold text-lg text-blue-950">Publish Property Review</h3>
              <button onClick={() => setIsAddReviewOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddReviewSubmit} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Select Stay Property</label>
                <select
                  value={newReviewForm.propertyName}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, propertyName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:border-cyan-600 outline-none"
                >
                  <option value="The Azure Velvet Sands Resort & Spa">The Azure Velvet Sands Resort &amp; Spa (Mauritius)</option>
                  <option value="Grand blue Alpine Chalet">Grand blue Alpine Chalet (Switzerland)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Star rating (1 - 5)</label>
                <div className="flex space-x-1.5 text-amber-500">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setNewReviewForm({ ...newReviewForm, rating: starVal })}
                      className="p-1 hover:scale-110 transition-transform focus:outline-none"
                      aria-label={`Rate ${starVal} stars`}
                    >
                      <Star size={24} fill={starVal <= newReviewForm.rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Detailed experience comment</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your genuine feedback on hotel suites, private pool cleanliness, concierge butler services, spa qualities..."
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddReviewOpen(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-950 to-cyan-800 hover:from-blue-900 text-white font-semibold rounded-xl transition-all"
                >
                  Publish Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. CANCEL BOOKING CONFIRMATION DIALOG */}
      {isCancelConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsCancelConfirmOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 relative z-10 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="p-3.5 bg-rose-50 rounded-full text-rose-600 w-14 h-14 flex items-center justify-center mx-auto">
              <AlertCircle size={28} />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-semibold text-lg text-blue-950">Cancel Suite Reservation?</h3>
              <p className="text-slate-500 text-xs leading-relaxed font-light font-sans">
                Are you sure you wish to initiate the cancellation process for booking ref <span className="font-mono font-semibold text-rose-600">{selectedBookingForCancel?.id}</span> at {selectedBookingForCancel?.hotelName}?
                <br />
                <span className="text-[10px] text-slate-500 font-medium">Late cancellations are subject to standard resort cancellation policies.</span>
              </p>
            </div>
            <div className="flex gap-3 pt-2 font-sans">
              <button
                onClick={() => setIsCancelConfirmOpen(false)}
                className="flex-1 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors"
              >
                Keep Suite
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                Request Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
