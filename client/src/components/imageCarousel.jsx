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

  const images = [
    sliderImage1,
    sliderImage2,
    sliderImage3,
    sliderImage4,
    sliderImage5
  ];

  return (
    <div className="w-full overflow-hidden">
      <Slider {...settings}>
        {images.map((img, index) => (
          <div key={index}>
            <div className="w-full overflow-hidden">
              <img src={img} alt={`slide-${index}`} className="w-full aspect-[16/7] object-cover block" />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );

}

