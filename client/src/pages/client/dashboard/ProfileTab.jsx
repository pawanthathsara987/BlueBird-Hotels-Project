import React from "react";
import { Shield } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProfileTab({
  profile,
  setEditProfileForm,
  setIsEditProfileOpen,
  showRealPII,
  setShowRealPII,
  maskEmail,
  maskPhone
}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300 font-sans">
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/60">
        <div>
          <h2 className="font-serif font-semibold text-xl md:text-2xl text-blue-950">Luxury Profile Management</h2>
          <p className="text-slate-500 text-xs mt-0.5">Control details, emergency preferences, and toggle secure PII data masking overlays.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card Banner */}
        <div className="bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-6 shadow-xs flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-950/10 shadow-sm"
            />
          </div>

          <div className="space-y-1">
            <h3 className="font-serif font-semibold text-lg text-blue-950">{profile.name}</h3>
            <p className="text-slate-400 text-[10px] font-semibold mt-1">Verified Guest</p>
          </div>

          {/* Security masking state controller */}
          <div className="w-full pt-4 border-t border-slate-100 text-xs flex justify-between items-center">
            <span className="text-slate-500 font-medium">PII Privacy Shield</span>
            <button
              onClick={() => {
                setShowRealPII(!showRealPII);
                toast.success(showRealPII ? "Private data masked securely" : "Private data revealed");
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${showRealPII ? 'bg-amber-400 border-amber-400 text-blue-950' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
            >
              {showRealPII ? "Mask Private Info" : "Reveal Private Info"}
            </button>
          </div>

          <button
            onClick={() => {
              setEditProfileForm({ ...profile });
              setIsEditProfileOpen(true);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-blue-950 to-cyan-800 hover:from-blue-900 text-white font-semibold text-xs rounded-xl transition-all"
          >
            Edit Luxury Credentials
          </button>
        </div>

        {/* Profile Detailed Form Inputs */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md border border-blue-50/50 rounded-3xl p-6 shadow-xs space-y-6">
          <h3 className="text-sm font-semibold text-blue-950 uppercase tracking-wider flex items-center gap-2">
            <Shield size={16} className="text-cyan-600" />
            Verified Luxury Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">FULL LEGAL NAME</span>
              <span className="font-semibold text-blue-950 text-sm block">{profile.name}</span>
            </div>
            <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">EMAIL ADDRESS</span>
              <span className="font-semibold text-blue-950 text-sm block">{maskEmail(profile.email)}</span>
            </div>
            <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">TELEPHONE NUMBER</span>
              <span className="font-semibold text-blue-950 text-sm block">{maskPhone(profile.phone)}</span>
            </div>
            <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">PREFERRED BILLING VALUE</span>
              <span className="font-semibold text-blue-950 text-sm block">{profile.currency} - {profile.language}</span>
            </div>
            <div className="md:col-span-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">DELIVERY ADDRESS</span>
              <span className="font-semibold text-blue-950 text-sm block">{profile.address}</span>
            </div>
            <div className="md:col-span-2 bg-slate-50/60 p-4 rounded-2xl border border-slate-100/50 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold block">CONCIERGE EMERGENCY DESK CONTACT</span>
              <span className="font-semibold text-blue-950 text-sm block">{profile.emergencyContact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
