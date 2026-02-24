import { FaFacebookF, FaTiktok, FaInstagram } from "react-icons/fa";
import { MdLocationOn, MdPhone, MdEmail } from "react-icons/md";
import { SiViber, SiWhatsapp } from "react-icons/si";

function Footer() {
    return (
        <footer className="w-full bg-linear-to-b from-gray-900 to-gray-950 text-gray-300">
            <div className="max-w-7xl mx-auto pt-14 pb-8 px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
               
                <div>
                    <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-blue-500 after:mt-2">
                        About
                    </h3>
                    <p className="text-[13px] leading-relaxed text-gray-400">
                        Blue Bird Hotels, located in Negombo, provides an exceptional stay experience for its guests,
                        with a wide range of amenities on offer. They guarantee convenience and relaxation with services
                        such as airport shuttle, Ayurvedic treatments, family rooms, and room services, making them a
                        perfect choice for travelers. Additionally, Blue Bird Hotels ensures a seamless experience by
                        offering free WiFi, non-smoking rooms, free parking, and tea/coffee makers in all rooms. Undoubtedly,
                        one of the highlights of the stay is the excellent breakfast that is sure to delight every guest’s
                        palate.
                    </p>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-blue-500 after:mt-2">
                        Contact
                    </h3>
                    <ul className="space-y-3 text-[13px] text-gray-400">
                        <li className="flex items-start gap-2">
                            <MdLocationOn className="text-blue-400 mt-0.5 shrink-0" size={16} />
                            No 54 Cemetery Rd, Negombo 11500
                        </li>
                        <li className="flex items-center gap-2">
                            <MdPhone className="text-blue-400 shrink-0" size={16} />
                            (+94) 70 1950 195
                        </li>
                        <li className="flex items-center gap-2">
                            <SiViber className="text-blue-400 shrink-0" size={14} />
                            <SiWhatsapp className="text-blue-400 shrink-0" size={14} />
                            Viber, WhatsApp
                        </li>
                        <li className="flex items-center gap-2">
                            <MdEmail className="text-blue-400 shrink-0" size={16} />
                            info@bluebirdhotels.lk
                        </li>
                    </ul>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-blue-500 after:mt-2">
                        Payment Method
                    </h3>
                    <p className="text-[13px] leading-relaxed text-gray-400">
                        Pay any way you choose, we support all payment options.
                    </p>
                </div>
                
                <div>
                    <h3 className="text-xl font-bold mb-4 text-white relative after:content-[''] after:block after:w-10 after:h-[2px] after:bg-blue-500 after:mt-2">
                        Get Social
                    </h3>
                    <p className="text-[13px] leading-relaxed text-gray-400">Follow us on social media and keep in touch with JLeaf by Bluebird.</p>
                    <div className="flex gap-3 mt-4">
                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                           className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-blue-600 hover:text-white hover:scale-110 transition-all duration-300">
                            <FaFacebookF size={16} />
                        </a>
                        <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer"
                           className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-gray-700 hover:text-white hover:scale-110 transition-all duration-300">
                            <FaTiktok size={16} />
                        </a>
                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                           className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-gray-300 hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-600 hover:text-white hover:scale-110 transition-all duration-300">
                            <FaInstagram size={16} />
                        </a>
                    </div>
                </div>
            </div>

            
            <div className="border-t border-white/10 mt-4">
                <p className="text-center text-[12px] text-gray-500 py-5">
                    &copy; {new Date().getFullYear()} Blue Bird Hotels. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;