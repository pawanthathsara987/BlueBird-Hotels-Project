import ImageCarousel from "../components/imageCarousel";
import RoomPackageCarousel from "../components/RoomPackageCarousel";

export default function HomeLandingPage() {
    return (
        <div className="w-full">
            <div className="relative w-full">
                <ImageCarousel />
            </div>
            <div className="w-full mt-16 px-4 sm:px-8 lg:px-10 flex items-center justify-center flex-col gap-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black/30 text-center mt-10">Welcome to BlueBird Hotel</h2>
                <div className="w-full max-w-3xl">
                    <p className="text-center mt-4 text-gray-600 leading-7.5">Blue Bird Hotels is the right choice for visitors
                        who are searching for a combination of charm and a convenient position where to explore the
                        surroundings. Whether for a holiday or pleasure, make your visit exceptional and memorable by
                        staying at Blue Bird Hotels. We offer an experience with a blend of luxury and modernity that
                        you wish would last forever.
                    </p>
                </div>
            </div>
            <div className="w-full mt-10 px-4 sm:px-8 lg:px-10 flex items-center bg-gray-100 justify-center flex-col gap-5">
                <RoomPackageCarousel />
            </div>
            <div className="w-full mt-16 pb-10 px-4 sm:px-8 lg:px-10 flex items-center justify-center flex-col gap-5">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black/30 text-center mt-10">Blue Bird Travels</h2>
                <div className="w-full max-w-3xl">
                    <p className="text-center mt-4 text-gray-600 leading-7.5">Blue Bird Travels is a travel agency with over 25 years of experience.
                         We provide you with car rentals, private day and roundtrip tours, and other services. We offer well-planned trips in Sri Lanka
                          customized to your preferences. We'll do everything we can to make your time in Sri Lanka a happy, exciting, romantic, and 
                          memorable one.
                    </p>
                </div>
            </div>
        </div>
    );
}