import { Link } from "react-router-dom";
import Logo from "../../assets/bluebird logo.png";

export default function LoginAdmin() {
    return (
        <div className="w-full h-screen flex flex-col items-center gap-6">
            <div>
                <img src={Logo} alt="Logo" className="w-32 object-contain" />
            </div>
            <div className="w-[450px] h-[500px] mb-10 shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">
                <h1 className="text-[30px] font-bold pt-5 ">Admin Login</h1>
                <div className="w-[350px]  mt-10">
                    <p>Email or Username</p>
                    <input type="text" placeholder="Your email or Username" className="w-[100%] h-[50px] p-3 rounded-lg border border-black/20" />
                </div>
                <div className="w-[350px]  mt-10">
                    <p>Password</p>
                    <input type="password" placeholder="Your password" className="w-[100%] h-[50px] p-3 rounded-lg border border-black/20" />
                    <p className="text-right text-[13px] text-blue-600">
                        Forget your password? <Link to="/reset-password" className="font-semibold">Reset it here</Link>
                    </p>
                </div>
                <div className="w-[350px]  mt-15 ">
                    <button className="w-[100%] h-[50px] bg-blue-500 font-bold text-white rounded-lg border-black/20 hover:cursor-pointer transition duration-300">
                        Login
                    </button>
                    <p className="text-center text-[13px] text-blue-600">Don't have an account? <Link className="font-semibold">Sign up</Link></p>
                </div>
                    
            </div>
        </div>
    );
}