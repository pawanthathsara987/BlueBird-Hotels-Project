import React, { useState, useEffect, useMemo } from "react";
import { X, Star, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString, isValidPhoneNumber } from "libphonenumber-js";

export default function DashboardModals({
  isEditProfileOpen,
  setIsEditProfileOpen,
  editProfileForm,
  setEditProfileForm,
  handleSaveProfile,

  isChangePasswordOpen,
  setIsChangePasswordOpen,
  changePasswordForm,
  setChangePasswordForm,
  handleChangePassword,

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
  const [phoneCountry, setPhoneCountry] = useState("LK");
  const [localPhone, setLocalPhone] = useState("");

  // Address subfields
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");

  const countryCodeOptions = useMemo(() => {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" });

    return getCountries()
      .map((countryCode) => {
        const dialingCode = `+${getCountryCallingCode(countryCode)}`;
        const countryName = displayNames.of(countryCode) || countryCode;

        return {
          value: countryCode,
          countryName,
          dialingCode
        };
      })
      .sort((a, b) => a.countryName.localeCompare(b.countryName));
  }, []);

  // Parse existing phone number and address when modal opens
  useEffect(() => {
    if (isEditProfileOpen) {
      if (editProfileForm.phone) {
        const parsed = parsePhoneNumberFromString(editProfileForm.phone);
        if (parsed) {
          setPhoneCountry(parsed.country || "LK");
          setLocalPhone(parsed.nationalNumber || "");
        } else {
          // Fallback matching
          const cleanPhone = editProfileForm.phone.replace(/\s+/g, "");
          const matched = countryCodeOptions.find(c => cleanPhone.startsWith(c.dialingCode));
          if (matched) {
            setPhoneCountry(matched.value);
            setLocalPhone(cleanPhone.slice(matched.dialingCode.length));
          } else {
            setPhoneCountry("LK");
            setLocalPhone(editProfileForm.phone);
          }
        }
      }

      if (editProfileForm.address && editProfileForm.address !== "Not Provided") {
        const parts = editProfileForm.address.split(",").map(p => p.trim());
        if (parts.length >= 4) {
          setAddressLine1(parts[0]);
          setAddressLine2(parts[1]);
          setCity(parts[2]);
          setZipCode(parts[parts.length - 1]);
        } else if (parts.length === 3) {
          setAddressLine1(parts[0]);
          setAddressLine2("");
          setCity(parts[1]);
          setZipCode(parts[2]);
        } else if (parts.length === 2) {
          setAddressLine1(parts[0]);
          setAddressLine2("");
          setCity(parts[1]);
          setZipCode("");
        } else {
          setAddressLine1(editProfileForm.address);
          setAddressLine2("");
          setCity("");
          setZipCode("");
        }
      } else {
        setAddressLine1("");
        setAddressLine2("");
        setCity("");
        setZipCode("");
      }
    }
  }, [isEditProfileOpen]);

  // Sync state values to editProfileForm (phone and address)
  useEffect(() => {
    const dialingCode = countryCodeOptions.find(c => c.value === phoneCountry)?.dialingCode || "";
    const combinedPhone = `${dialingCode}${localPhone.trim()}`;

    const streetPart = addressLine2.trim() 
      ? `${addressLine1.trim()}, ${addressLine2.trim()}` 
      : addressLine1.trim();
        
    const combinedAddress = [
      streetPart,
      city.trim(),
      zipCode.trim() ? zipCode.trim() : null
    ].filter(Boolean).join(", ");

    setEditProfileForm(prev => {
      const updates = {};
      if (prev.phone !== combinedPhone) updates.phone = combinedPhone;
      if (prev.address !== combinedAddress) updates.address = combinedAddress || "Not Provided";
      if (Object.keys(updates).length > 0) {
        return { ...prev, ...updates };
      }
      return prev;
    });
  }, [phoneCountry, localPhone, addressLine1, addressLine2, city, zipCode, setEditProfileForm]);

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    if (localPhone.trim() !== "" && !isValidPhoneNumber(localPhone.trim(), phoneCountry)) {
      toast.error(`Invalid phone number for ${countryCodeOptions.find(c => c.value === phoneCountry)?.countryName || "selected country"}. Please check the number.`);
      return;
    }
    handleSaveProfile(e);
  };
  return (
    <>
      {/* A. EDIT PROFILE DIALOG */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsEditProfileOpen(false)}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-serif font-semibold text-lg text-blue-950">Modify Luxury Profile Details</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProfile} className="space-y-4 text-xs font-sans">
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
                  <div className="flex gap-2">
                    <div className="relative w-24 shrink-0">
                      <select
                        value={phoneCountry}
                        onChange={(e) => setPhoneCountry(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-2.5 pr-6 focus:bg-white focus:border-cyan-600 outline-none cursor-pointer appearance-none text-xs"
                      >
                        {countryCodeOptions.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.value} ({item.dialingCode})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] pointer-events-none">▼</div>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="Phone Number"
                      value={localPhone}
                      onChange={(e) => setLocalPhone(e.target.value)}
                      className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Address Line 1</label>
                <input
                  type="text"
                  required
                  placeholder="Street Address, P.O. Box, Company"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, Suite, Unit, Building, Floor"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">City</label>
                  <input
                    type="text"
                    required
                    placeholder="City Name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">ZIP / Postal Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="ZIP / Postal Code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Country / Region</label>
                <select
                  required
                  value={editProfileForm.country}
                  onChange={(e) => setEditProfileForm({ ...editProfileForm, country: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none cursor-pointer"
                >
                  <option value="">Select Country</option>
                  {countryCodeOptions.map((item) => (
                    <option key={item.value} value={item.countryName}>
                      {item.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">ID Document Type</label>
                  <select
                    value={editProfileForm.idType}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, idType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none animate-none"
                  >
                    <option value="NIC">NIC</option>
                    <option value="PASSPORT">PASSPORT</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase">ID Document Number</label>
                  <input
                    type="text"
                    required
                    value={editProfileForm.idNumber}
                    onChange={(e) => setEditProfileForm({ ...editProfileForm, idNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                  />
                </div>
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
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
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
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 relative z-10 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
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

      {/* E. CHANGE PASSWORD DIALOG */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setIsChangePasswordOpen(false)}></div>
          <div className="bg-white rounded-[2rem] w-full max-w-md p-6 relative z-10 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5">
              <h3 className="font-serif font-semibold text-lg text-blue-950">Change Account Password</h3>
              <button onClick={() => setIsChangePasswordOpen(false)} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs font-sans">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Current Password</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.currentPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">New Password</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })}
                  placeholder="Enter new password (min. 8 characters)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={changePasswordForm.confirmNewPassword}
                  onChange={(e) => setChangePasswordForm({ ...changePasswordForm, confirmNewPassword: e.target.value })}
                  placeholder="Confirm new password"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 focus:bg-white focus:border-cyan-600 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(false)}
                  className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-950 to-cyan-800 hover:from-blue-900 text-white font-semibold rounded-xl transition-all"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
