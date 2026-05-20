import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Users,
  Sparkles,
  LucidePlane,
} from "lucide-react";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import RoomDetailsModal from "./RoomDetailsModal";
import { SiGitconnected } from "react-icons/si";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import FloatingChatbot from "./../../../components/FloatingChatbot";
import RoomSelector from "../../../components/booking/RoomSelector";

const BookingRoom = () => {
  

  return (
    <div
      className="min-h-screen pb-14"
      style={{
        background:
          "linear-gradient(180deg, #f3efe5 0%, #f7f5ef 44%, #f0f4f1 100%)",
      }}
    >
      <section className="relative overflow-hidden">
        <img
          src="https://mgmmgyuyvsatngfqtgib.supabase.co/storage/v1/object/sign/assets/public/IMG_1918.JPG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYzhhMjQ2Yy1lZTJmLTQ3NGMtYTEyMi1hYmY4NmZjNDkwZGYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvcHVibGljL0lNR18xOTE4LkpQRyIsImlhdCI6MTc3OTE5MTkwMSwiZXhwIjoxOTA1MzM1OTAxfQ.ZogdGrpgcposh89EK8-dbF4Ue0vEVCcQpXJc1sr0x1o"
          alt="Tropical hotel"
          className="h-107.5 w-full object-cover object-center sm:h-130"
        />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/35 to-transparent" />

        <div className="absolute left-0 top-0 w-full px-4 pt-8 sm:px-8 lg:px-14">
          <div className="mx-auto max-w-7xl w-full flex justify-between items-start">
            <div className="flex-1">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" /> Island Luxury Collection
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                Escape To Places
                <br />
                You Will Never Forget
              </h1>
              <p className="mt-4 max-w-xl text-sm text-stone-100 sm:text-base">
                Discover curated beachfront, city, and hillside stays with a
                streamlined booking experience designed for quick decisions.
              </p>
            </div>
              <button
                type="button"
                onClick={() => {}}
                className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-extrabold uppercase tracking-wider text-white transition hover:bg-emerald-700 shadow-lg"
              >
                Sign In
              </button>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-16 max-w-7xl px-4 sm:px-8 lg:px-14 flex justify-center">
        <RoomSelector />
      </section>

      <section className="mx-auto mt-12 max-w-7xl px-4 sm:px-8 lg:px-14">
        
      </section>


      <FloatingChatbot />
    </div>
  );
};

export default BookingRoom;
