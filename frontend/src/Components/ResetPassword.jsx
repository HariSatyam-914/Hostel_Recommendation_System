import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


export default function ResetPassword() {


   const navigate = useNavigate();
   const location = useLocation();


   // Receive email and OTP from VerifyOtp page
   const email = location.state?.email || "";
   const otp = location.state?.otp || "";


   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [showPassword, setShowPassword] = useState(false);
   const [loading, setLoading] = useState(false);


   const handleResetPassword = async (e) => {


   e.preventDefault();


   if (newPassword !== confirmPassword) {
       toast.error("Passwords do not match");
       return;
   }


   setLoading(true);


   try {


       await axios.post(
           "http://localhost:8080/api/password/reset",
           {
               email,
               otp,
               newPassword
           }
       );


       toast.success("Password Reset Successfully");


       setTimeout(() => {
           navigate("/");
       }, 1500);


   } catch (error) {


       toast.error(
           error.response?.data || "Reset Failed"
       );


   } finally {


       setLoading(false);


   }


};


   return (


       <div className="min-h-screen bg-gray-100 flex items-center justify-center">


           <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">


               <h2 className="text-3xl font-bold text-center mb-2">
                   Reset Password
               </h2>


               <p className="text-center text-gray-500 mb-6">
                   Create your new password
               </p>


               <form onSubmit={handleResetPassword}>


                   {/* New Password */}


                   <div className="relative mb-5">


                       <Lock
                           className="absolute left-3 top-3 text-gray-400"
                           size={20}
                       />


                       <input
                           type={showPassword ? "text" : "password"}
                           placeholder="New Password"
                           value={newPassword}
                           onChange={(e)=>setNewPassword(e.target.value)}
                           required
                           className="w-full border rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />


                       <button
                           type="button"
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-3 top-3 text-gray-500"
                       >
                           {
                               showPassword
                                   ? <EyeOff size={20}/>
                                   : <Eye size={20}/>
                           }
                       </button>


                   </div>


                   {/* Confirm Password */}


                   <div className="relative mb-6">


                       <Lock
                           className="absolute left-3 top-3 text-gray-400"
                           size={20}
                       />


                       <input
                           type={showPassword ? "text" : "password"}
                           placeholder="Confirm Password"
                           value={confirmPassword}
                           onChange={(e)=>setConfirmPassword(e.target.value)}
                           required
                           className="w-full border rounded-lg py-3 pl-10 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />


                   </div>


                   <button
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                   >
                       {
                           loading
                               ? "Updating Password..."
                               : "Reset Password"
                       }
                   </button>


               </form>


           </div>


       </div>


   );


}



