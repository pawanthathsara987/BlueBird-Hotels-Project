import { Routes, Route } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import HomeLandingPage from "./homeLandingPage";
import FloatingChatbot from "./../components/FloatingChatbot";


export default function HomePage(){
    return(
        <div className="w-full h-full">
            <Header/>
            <div className="w-full min-h-[calc(100%-90px)]">
                <Routes>
                    <Route path="/" element={<HomeLandingPage />} />
                </Routes>
            </div>
            <FloatingChatbot />
            <Footer />
        </div>
    );
}