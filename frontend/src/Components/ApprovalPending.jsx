import React from 'react'
import { Clock } from 'lucide-react';
import { useNavigate } from "react-router-dom";


function ApprovalPending() {
 const navigate = useNavigate();
 return (
   <div className="min-h-screen bg-white flex items-center justify-center px-6">
     <div className="text-center max-w-lg">


       <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center">
         <Clock className="w-8 h-8 text-blue-600" />
       </div>


       <h1 className="text-2xl font-bold text-slate-900 mb-3">
         Approval Pending
       </h1>


       <p className="text-slate-500 text-sm leading-6">
         Your approval is sent to admin, wait for the confirmation by admin.
       </p>


       <button
         type="button"
         onClick={() => {
           localStorage.removeItem("token");
           localStorage.removeItem("hostelId");


           navigate("/", {
             replace: true
           });
         }}
         className="mt-8 inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
       >
         Logout & Back to Login
       </button>


     </div>
   </div>
 )
}


export default ApprovalPending




