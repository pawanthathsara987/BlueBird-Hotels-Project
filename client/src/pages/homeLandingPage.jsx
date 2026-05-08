import ImageCarousel from "../components/imageCarousel";
import BookingNavigation from "../components/bookingNavigation";

export default function HomeLandingPage() {
    return (
        <div className="w-full">
            <div className="relative w-full">
                <ImageCarousel />
            </div>
            <div className="w-full h-75 mt-65 sm:mt-40  lg:mt-20 px-10 flex items-center justify-center flex-col gap-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black/30 text-center mt-10\">Welcome to BlueBird Hotel</h2>
                <div className="w-150 ">
                    <p className="text-center mt-4 text-gray-600 leading-7.5">Blue Bird Hotels is the right choice for visitors
                    who are searching for a combination of charm and a convenient position where to explore the
                    surroundings. Whether for a holiday or pleasure, make your visit exceptional and memorable by
                    staying at Blue Bird Hotels. We offer an experience with a blend of luxury and modernity that
                    you wish would last forever.
                </p>
                </div>
                
            </div>
        </div>
    );
}