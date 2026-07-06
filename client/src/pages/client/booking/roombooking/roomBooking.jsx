import { Sparkles, } from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import RoomDetailsModal from "./RoomDetailsModal";
import FloatingChatbot from "./../../../../components/FloatingChatbot";
import RoomSelector from "./RoomSelector";
import Header from "../../../../components/header";
import Footer from "../../../../components/footer";
import { useNavigate } from "react-router-dom";


const BookingRoom = () => {
  const navigate = useNavigate();


  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, #f3efe5 0%, #f7f5ef 44%, #f0f4f1 100%)",
      }}
    >
      {/* Premium Background Ambient Glow Blurs */}
      <div className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-800/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[65%] left-[45%] w-[450px] h-[450px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none z-0" />

      <Header />

      <div className="flex-grow">
        <section className="relative overflow-hidden shadow-md">
          <img
            src="https://mgmmgyuyvsatngfqtgib.supabase.co/storage/v1/object/sign/assets/public/IMG_1918.JPG?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jYzhhMjQ2Yy1lZTJmLTQ3NGMtYTEyMi1hYmY4NmZjNDkwZGYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJhc3NldHMvcHVibGljL0lNR18xOTE4LkpQRyIsImlhdCI6MTc3OTE5MTkwMSwiZXhwIjoxOTA1MzM1OTAxfQ.ZogdGrpgcposh89EK8-dbF4Ue0vEVCcQpXJc1sr0x1o"
            alt="Tropical hotel"
            className="h-110 w-full object-cover object-center sm:h-135"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/40 to-transparent" />

          <div className="absolute left-0 top-0 w-full px-4 pt-10 sm:px-8 lg:px-14">
            <div className="mx-auto max-w-7xl w-full flex justify-between items-start">
              <div className="flex-1">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4.5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-emerald-250 backdrop-blur-md shadow-2xs">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-350 animate-pulse" /> Island Luxury Collection
                </p>
                <h1 className="mt-5 max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-black leading-tight text-white tracking-tight">
                  Escape To Places
                  <br />
                  <span className="bg-gradient-to-r from-white via-emerald-100 to-emerald-200 bg-clip-text text-transparent">You Will Never Forget</span>
                </h1>
                <p className="mt-4 max-w-xl text-xs sm:text-sm text-stone-200 font-semibold leading-relaxed">
                  Discover curated beachfront, city, and hillside stays with a
                  streamlined booking experience designed for quick decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="relative z-10 mx-auto -mt-20 mb-20 max-w-7xl px-4 sm:px-8 lg:px-14 flex justify-center">
          <RoomSelector />
        </section>
      </div>

      <FloatingChatbot />
      <Footer />
    </div>
  );
};

export default BookingRoom;
