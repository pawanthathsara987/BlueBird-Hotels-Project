import { Routes, Route } from "react-router-dom";
import Footer from "../components/footer";
import Header from "../components/header";
import HomeLandingPage from "./homeLandingPage";
import TermsConditions from "./TermsConditions";
import ReturnPolicy from "./ReturnPolicy";
import PrivacyPolicy from "./PrivacyPolicy";
import FloatingChatbot from "./../components/FloatingChatbot";


export default function HomePage(){
    return(
        <div className="w-full h-full">
            <Header/>
            <div className="w-full min-h-[calc(100%-90px)]">
                <Routes>
                    <Route path="/" element={<HomeLandingPage />} />
                    <Route path="/terms" element={<TermsConditions />} />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                </Routes>
            </div>
            <FloatingChatbot />
            <Footer />
        </div>
    );
}