import { useState } from "react";
import { Mail } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function ForgotPassword() {


   const navigate = useNavigate();
  
   const [email, setEmail] = useState("");
   const [loading, setLoading] = useState(false);


   const sendOtp = async (e) => {


       e.preventDefault();


       try {


           setLoading(true);


           const response = await axios.post(
               "http://localhost:8080/api/password/send-otp",
               {
                   email
               }
           );


           alert(response.data);


           navigate("/verify-otp", {
               state: { email }
           });


       } catch (error) {


           alert(
               error.response?.data ||
               "Unable to send OTP"
           );


       } finally {
           setLoading(false);
       }


   };


   return (


       <div className="min-h-screen bg-gray-100 flex justify-center items-center">


           <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-8">


               <h2 className="text-3xl font-bold text-center mb-2">
                   Forgot Password
               </h2>


               <p className="text-center text-gray-500 mb-8">
                   Enter your registered email.
               </p>


               <form onSubmit={sendOtp}>


                   <div className="relative mb-6">


                       <Mail
                           className="absolute left-3 top-3 text-gray-400"
                           size={20}
                       />


                       <input
                           type="email"
                           required
                           value={email}
                           onChange={(e)=>setEmail(e.target.value)}
                           placeholder="Enter Email"
                           className="w-full border rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                       />


                   </div>


                   <button
                       className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
                   >
                       {
                           loading
                               ? "Sending OTP..."
                               : "Send OTP"
                       }
                   </button>


               </form>


           </div>


       </div>


   );


}

