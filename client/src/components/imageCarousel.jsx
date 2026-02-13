import Slider from "react-slick";
import sliderImage1 from "../assets/slider Images/front-2048x1014.jpg"
import sliderImage2 from "../assets/slider Images/home-slider2-2048x1014.jpg";
import sliderImage3 from "../assets/slider Images/home-slider3-2048x1014.jpg"
import sliderImage4 from "../assets/slider Images/home-slider4-2048x1014.jpg"
import sliderImage5 from "../assets/slider Images/restaurent-2048x1014.jpg"

export default function ImageCarousel() {

  const settings = {
    infinite: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const slides = [
    {
      img: sliderImage1,
      title: "Welcome to BlueBird Hotel",
      desc: "Experience luxury and comfort like never before"
    },
    {
      img: sliderImage2,
      title: "Luxury Rooms",
      desc: "Relax in our modern designed rooms"
    },
    {
      img: sliderImage3,
      title: "Fine Dining",
      desc: "Enjoy delicious meals with ocean views"
    },
    {
      img: sliderImage4,
      title: "Travel & Tours",
      desc: "Discover beautiful destinations with us"
    },
    {
      img: sliderImage5,
      title: "Unforgettable Stay",
      desc: "Make memories that last forever"
    }
  ];


  return (
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index}>

            <div className="relative w-full overflow-hidden">

              <img src={slide.img} className="w-full aspect-[16/7] object-cover block" />

              <div className="absolute inset-0 bg-black/40" />

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">

                <h1 className="text-3xl md:text-5xl font-bold mb-4">
                  {slide.title}
                </h1>

                <p className="mb-6 max-w-xl">
                  {slide.desc}
                </p>

              </div>

            </div>

          </div>
        ))}
      </Slider>

    </div>
  );

}

