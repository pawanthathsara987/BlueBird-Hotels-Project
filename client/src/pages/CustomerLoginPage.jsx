import { useState } from "react";
import Logo from "../assets/bluebird logo.png";

export default function UserRegister(){
    const [showPassword, setShowPassword] = useState(false);

    return(
        <div className="w-full h-screen flex flex-col items-center gap-6">
            <div>
                <img src={Logo} className="w-32 object-contain"/>
            </div>
            <div className="w-150 h-fit shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">
                <h1 className="text-[30px] font-bold pt-5">Login Account</h1>
                
                <div className="w-112.5 mt-7">
                    <p>Email</p>
                    <input type="text" placeholder="Your email" className="w-full h-12.5 border border-black/20 p-3 rounded-lg"/>
                </div>
                
                <div className="w-112.5 mt-7">
                    <p>Password</p>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Your password"
                            className="w-full h-12.5 border border-black/20 p-3 rounded-lg pr-20"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((current) => !current)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>
                
                <div className="w-112.5 mt-7 pb-5">
                    <button className="w-full h-12.5 bg-blue-500 font-bold text-white rounded-lg border-black/20 hover:cursor-pointer transition duration-300">
                        Login
                    </button>
                </div>
                <div className="pb-6 text-sm text-gray-600 flex items-center gap-2">
                    <span>Not a member?</span>
                    <button type="button" className="font-semibold text-blue-600 hover:underline hover:cursor-pointer">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}