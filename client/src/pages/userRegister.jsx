import Logo from "../assets/bluebird logo.png";

export default function UserRegister(){
    return(
        <div className="w-full h-screen flex flex-col items-center gap-6">
            <div>
                <img src={Logo} className="w-32 object-contain"/>
            </div>
            <div className="w-[450px] h-[650px] shadow-xl rounded-2xl border border-black/30 flex flex-col items-center">
                <h1 className="text-[30px] font-bold pt-5">Create Account</h1>
                <div className="w-[350px] mt-10">
                    <p>Username</p>
                    <input type="text" placeholder="Your Username" className="w-[100%] h-[50px] border border-black/20 p-3"/>
                </div>
                <div className="w-[350px] mt-10">
                    <p>Email</p>
                    <input type="text" placeholder="Your email" className="w-[100%] h-[50px] border border-black/20 p-3"/>
                </div>
                <div className="w-[350px] mt-10">
                    <p>Password</p>
                    <input type="password" placeholder="Your password" className="w-[100%] h-[50px] border border-black/20 p-3"/>
                </div>
                <div className="w-[350px] mt-10">
                    <p>Confirm Password</p>
                    <input type="password" placeholder="Your password" className="w-[100%] h-[50px] border border-black/20 p-3"/>
                </div>
                <div className="w-[350px] mt-10 pb-5">
                    <button className="w-[100%] h-[50px] bg-blue-500 font-bold text-white rounded-lg border-black/20 hover:cursor-pointer transition duration-300">
                        Register
                    </button>
                </div>
            </div>
        </div>
    );
}