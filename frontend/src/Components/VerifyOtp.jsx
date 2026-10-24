import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";


export default function VerifyOtp() {


   const navigate = useNavigate();
   const location = useLocation();


   // Email received from ForgotPassword page
   const email = location.state?.email || "";


   const [otp, setOtp] = useState("");
   const [loading, setLoading] = useState(false);


   const verifyOtp = async (e) => {


       e.preventDefault();


       try {


           setLoading(true);


           const response = await axios.post(
               "http://localhost:8080/api/password/verify-otp",
               {
                   email,
                   otp
               }
           );


           alert(response.data);


           navigate("/reset-password", {
               state: {
                   email,
                   otp
               }
           });


       } catch (error) {


           alert(
               error.response?.data ||
               "OTP Verification Failed"
           );


       } finally {


           setLoading(false);


       }


   };


   return (


       <div className="min-h-screen flex items-center justify-center bg-gray-100">


           <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">


               <h2 className="text-3xl font-bold text-center mb-2">
                   Verify OTP
               </h2>


               <p className="text-gray-500 text-center mb-8">
                   Enter the OTP sent to
               </p>


               <p className="text-blue-600 text-center font-semibold mb-6">
                   {email}
               </p>


               <form onSubmit={verifyOtp}>


                   <div className="relative mb-6">


                       <ShieldCheck
                           className="absolute left-3 top-3 text-gray-400"
                           size={20}
                       />


                       <input
                           type="text"
                           placeholder="Enter 6-digit OTP"
                           maxLength={6}
                           required
                           value={otp}
                           onChange={(e)=>setOtp(e.target.value)}
                           className="w-full border rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />


                   </div>


                   <button
                       className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
                   >
                       {
                           loading
                               ? "Verifying..."
                               : "Verify OTP"
                       }
                   </button>


               </form>


           </div>


       </div>


   );


}





