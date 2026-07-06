import axios from "axios";
import { useEffect, useState } from "react";
import Slider from "react-slick";
import RoomPackageCard from "./RoomPackageCard";

export default function RoomPackageCarousel() {

    const [roomPackages, setRoomPackages] = useState([]);


    useEffect(() => {
        fetchRoomPackages();
    }, []);

    async function fetchRoomPackages() {
        try {
            const res = await axios.get(import.meta.env.VITE_BACKEND_URL + "/admin/packages");
            setRoomPackages(res.data.data);
            console.log(res.data.data);
        } catch (error) {
            console.error("Error fetching room packages:", error);
        }
    }

    const getDiscountedPrice = (price, discount = 0) => {
        const basePrice = Number(price || 0);
        const discountPercent = Number(discount || 0);
        return discountPercent > 0
            ? Number((basePrice - (basePrice * discountPercent) / 100).toFixed(2))
            : basePrice;
    };

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 2,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,

        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 2,
                },
            },

            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                },
            },
        ],
    };

    return (
        <>
            <div className="w-full max-w-7xl mx-auto py-10 px-2 sm:px-4">
                <Slider {...settings}>
                    {roomPackages.map((pkg) => (
                        <div key={pkg.id} className="h-full px-3">
                            <RoomPackageCard
                                image={pkg.pimage}
                                title={pkg.pname}
                                price={getDiscountedPrice(pkg.pprice, pkg.discount)}
                                originalPrice={pkg.pprice}
                                discount={pkg.discount}
                                adults={pkg.maxAdults}
                                kids={pkg.maxKids}
                                description={pkg.description}
                            />
                        </div>
                    ))}
                </Slider>
            </div>
        </>
    );
}