import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function PasswordResetPage() {

  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  async function handleSendOtp() {
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/users/send-otp",
        { email: email.trim() }
      );

      toast.success("OTP sent to your email.");
      setOtpSent(true);

    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send OTP");
    }
  }

  async function handleResetPassword() {
    try {

      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/users/reset-password",
        {
          email: email.trim(),
          otp: otp.trim(),
          newPassword: newPassword
        }
      );

      toast.success("Password reset successful!");

      setOtpSent(false);
      setEmail("");
      setOtp("");
      setNewPassword("");

      navigate("/loginAdmin");

    } catch (error) {
      toast.error(error?.response?.data?.message || "Reset failed");
    }
  }

  return (
    <div className="w-full h-screen flex items-center justify-center">

      {otpSent ? (
        <div className="w-[400px] flex flex-col justify-center items-center rounded-lg shadow-lg p-8">
          
          <h1 className="text-2xl mb-6 font-bold">
            Enter OTP & New Password
          </h1>

          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" className="w-full p-2 mb-4 border rounded"/>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full p-2 mb-4 border rounded" />
          <button onClick={handleResetPassword} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" >
            Reset Password
          </button>

        </div>
      ) : (

        <div className="w-[400px] flex flex-col justify-center items-center rounded-lg shadow-lg p-8">
          
          <h1 className="text-2xl mb-6 font-bold">
            Reset Your Password
          </h1>

          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="w-full p-2 mb-4 border rounded" />
          <button onClick={handleSendOtp} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600" >
            Send OTP
          </button>

        </div>
      )}

    </div>
  );
}

export default PasswordResetPage;