import Header from "../components/header";
import ImageCarousel from "../components/ImageCarousel";


export default function HomePage(){
    return(
        <div className="w-full h-full">
            <Header/>
            <ImageCarousel/>
        </div>
    );
}