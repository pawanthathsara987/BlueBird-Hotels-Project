import ImageCarousel from "../components/imageCarousel";
import BookingNavigation from "../components/bookingNavigation";

export default function HomeLandingPage(){
    return(
        <div className="w-full">
            <ImageCarousel className="relative"/>
            <BookingNavigation />
        </div>
    );
}