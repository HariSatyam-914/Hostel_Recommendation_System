import React, { useState } from "react";
import { useNavigate } from "react-router-dom";


import {
 LayoutDashboard,
 Clock,
 Building2,
 ShieldCheck,
 BarChart3,
 FileText,
 Users,
 Settings,
 History,
 HelpCircle,
 LogOut,
 Search,
 Bell,
 Moon,
 ArrowLeft,
 ImageOff,
 FileQuestion,
 ChevronDown,
 Info,
 MapPin,
 Wifi,
 BedDouble,
 SlidersHorizontal,
 FolderClosed,
 CheckCircle2,
 Circle,
 UserX,
 MapPinOff,
 Building,
 Menu,
 MessageSquareWarning,
 Gem,
} from "lucide-react";
import { useParams } from "react-router-dom";




const HostelApprovalPage = () => {
 const navigate = useNavigate();
 const { hostelId } = useParams();


 console.log("========== HOSTEL APPROVAL ==========");
 console.log("Hostel ID from URL:", hostelId);


 // =========================================================
 // SIDEBAR STATE
 // =========================================================


 const [sidebarOpen, setSidebarOpen] = useState(true);


 // =========================================================
 // ACCORDION STATE
 // =========================================================


 const [openAccordions, setOpenAccordions] = useState({
   basicInfo: false,
   location: false,
   amenities: false,
   roomsPricing: false,
   rules: false,
   documents: false,
 });


 // =========================================================
 // VERIFICATION CHECKLIST
 // =========================================================


 const [checklist, setChecklist] = useState([
   {
     id: "businessReg",
     label: "Business Registration",
     completed: false,
   },
   {
     id: "ownerIdentity",
     label: "Owner Identity",
     completed: false,
   },
   {
     id: "bankDetails",
     label: "Bank Details",
     completed: false,
   },
   {
     id: "location",
     label: "Location",
     completed: false,
   },
   {
     id: "photos",
     label: "Photos",
     completed: false,
   },
   {
     id: "roomInfo",
     label: "Room Info",
     completed: false,
   },
   {
     id: "rules",
     label: "Rules",
     completed: false,
   },
   {
     id: "contactInfo",
     label: "Contact Info",
     completed: false,
   },
 ]);


 // =========================================================
 // ACCORDION HANDLER
 // =========================================================


 const toggleAccordion = (key) => {
   setOpenAccordions((prev) => ({
     ...prev,
     [key]: !prev[key],
   }));
 };


 // =========================================================
 // CHECKLIST HANDLER
 // =========================================================


 const toggleChecklistItem = (id) => {
   setChecklist((prev) =>
     prev.map((item) =>
       item.id === id
         ? {
             ...item,
             completed: !item.completed,
           }
         : item
     )
   );
 };


 const completedCount = checklist.filter(
   (item) => item.completed
 ).length;


 // =========================================================
 // SIDEBAR NAVIGATION ITEM
 // =========================================================


 const NavItem = ({
   icon: Icon,
   label,
   onClick,
   active = false,
 }) => (
   <button
     onClick={onClick}
     className={`w-full flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
       active
         ? "bg-blue-600 text-white shadow-sm"
         : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
     }`}
   >
     <Icon
       className={`w-5 h-5 shrink-0 ${
         active ? "text-white" : "text-slate-500"
       }`}
     />


     {sidebarOpen && <span>{label}</span>}
   </button>
 );


 // =========================================================
 // RENDER
 // =========================================================


 return (
   <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans antialiased overflow-hidden">


     {/* ===================================================== */}
     {/* FIXED ADMIN SIDEBAR                                   */}
     {/* ===================================================== */}


     <aside
       className={`fixed top-0 left-0 h-screen ${
         sidebarOpen ? "w-64" : "w-20"
       } transition-all duration-300 bg-white border-r border-slate-200 flex flex-col justify-between z-30`}
     >


       {/* ================================================= */}
       {/* SIDEBAR TOP                                      */}
       {/* ================================================= */}


       <div>


         {/* LOGO */}


         <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-100">


           <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/20">


             <Building className="w-6 h-6" />


           </div>


           {sidebarOpen && (
             <div>


               <h1 className="font-bold text-slate-900 leading-none text-xl tracking-tight">
                 HostelHub
               </h1>


               <span className="text-xs text-slate-400 font-medium">
                 Admin Console
               </span>


             </div>
           )}


         </div>


         {/* ================================================= */}
         {/* NAVIGATION                                       */}
         {/* ================================================= */}


         <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-180px)]">


           {/* DASHBOARD */}


           <div className="space-y-1">


             <NavItem
               icon={LayoutDashboard}
               label="Dashboard"
               active={false}
               onClick={() => navigate("/admin/dashboard")}
             />


           </div>


           {/* ================================================= */}
           {/* MANAGEMENT                                       */}
           {/* ================================================= */}


           <div>


             {sidebarOpen && (
               <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                 Management
               </p>
             )}


             <nav className="space-y-1">


               {/* HOSTEL MANAGEMENT */}


               <NavItem
                 icon={Building2}
                 label="Hostel Requests"
                 onClick={() =>
                   navigate("/admin/hostel-management")
                 }
               />


               {/* PENDING APPROVALS */}


               <NavItem
                 icon={Clock}
                 label="Pending Approvals"
                 active={true}
                 onClick={() =>
                   navigate("/admin/pending-approvals")
                 }
               />


               {/* USER ISSUES */}


               <NavItem
                 icon={MessageSquareWarning}
                 label="User Issues"
                 onClick={() =>
                   navigate("/admin/user-issues")
                 }
               />


               {/* OWNER VERIFICATION */}


               <NavItem
                 icon={ShieldCheck}
                 label="Owner Verification"
                 onClick={() =>
                   navigate("/admin/owner-verification")
                 }
               />


             </nav>


           </div>


           {/* ================================================= */}
           {/* ANALYTICS & REPORTS                              */}
           {/* ================================================= */}


           <div>


             {sidebarOpen && (
               <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                 Analytics & Reports
               </p>
             )}


             <nav className="space-y-1">


               <NavItem
                 icon={BarChart3}
                 label="Analytics"
                 onClick={() =>
                   navigate("/admin/analytics")
                 }
               />


               <NavItem
                 icon={Gem}
                 label="Subscription"
                 onClick={() =>
                   navigate("/admin/subscription")
                 }
               />


               <NavItem
                 icon={FileText}
                 label="Reports"
                 onClick={() =>
                   navigate("/admin/reports")
                 }
               />


             </nav>


           </div>


           {/* ================================================= */}
           {/* SYSTEM                                           */}
           {/* ================================================= */}


           <div>


             {sidebarOpen && (
               <p className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-2">
                 System
               </p>
             )}


             <nav className="space-y-1">


               <NavItem
                 icon={Users}
                 label="Users"
                 onClick={() =>
                   navigate("/admin/users")
                 }
               />


               <NavItem
                 icon={Settings}
                 label="System Settings"
                 onClick={() =>
                   navigate("/admin/settings")
                 }
               />


               <NavItem
                 icon={History}
                 label="Audit Logs"
                 onClick={() =>
                   navigate("/admin/audit-logs")
                 }
               />


             </nav>


           </div>


         </div>


       </div>


       {/* ================================================= */}
       {/* SIDEBAR FOOTER                                   */}
       {/* ================================================= */}


       <div className="p-3 border-t border-slate-100 space-y-2">


         {sidebarOpen && (
           <button
             onClick={() => navigate("/admin/reports")}
             className="w-full py-2.5 px-3 border border-blue-200 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2 mb-2"
           >


             <FileText className="w-4 h-4" />


             Generate Reports


           </button>
         )}


         <NavItem
           icon={HelpCircle}
           label="Help Center"
           onClick={() => navigate("/admin/help")}
         />


         <NavItem
           icon={LogOut}
           label="Logout"
           onClick={() => {
             // Add your logout logic here
             navigate("/login");
           }}
         />


       </div>


     </aside>


     {/* ===================================================== */}
     {/* MAIN CONTENT                                         */}
     {/* ===================================================== */}


     <div
       className={`flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-300 ${
         sidebarOpen ? "ml-64" : "ml-20"
       }`}
     >


       {/* ================================================= */}
       {/* TOP NAVBAR                                       */}
       {/* ================================================= */}


       <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">


         {/* SEARCH */}


         <div className="flex items-center gap-4 flex-1 max-w-xl">


           <button
             onClick={() =>
               setSidebarOpen(!sidebarOpen)
             }
             className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition"
           >


             <Menu className="w-6 h-6" />


           </button>


           <div className="relative w-full">


             <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />


             <input
               type="text"
               placeholder="Search hostel, owner, location..."
               className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
             />


             <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 border border-slate-200 bg-white rounded text-xs text-slate-400 font-mono">
               ⌘ K
             </div>


           </div>


         </div>


         {/* RIGHT NAV */}


         <div className="flex items-center gap-4">


           <div className="relative cursor-pointer p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">


             <Bell className="w-6 h-6" />


             <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full" />


           </div>


           <button className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition">


             <Moon className="w-6 h-6" />


           </button>


           <div className="h-6 w-px bg-slate-200" />


           <div className="flex items-center gap-3 pl-2 cursor-pointer">


             <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
               A
             </div>


             <div className="text-left hidden md:block leading-tight">


               <p className="text-sm font-semibold text-slate-800">
                 Admin User
               </p>


               <p className="text-xs text-slate-400">
                 Super Admin
               </p>


             </div>


           </div>


         </div>


       </header>


       {/* ===================================================== */}
       {/* HOSTEL APPROVAL PAGE CONTENT                         */}
       {/* ===================================================== */}


       <main className="flex-1 overflow-y-auto p-6">


         <div className="max-w-7xl w-full mx-auto space-y-6">


           {/* ================================================= */}
           {/* HEADER                                           */}
           {/* ================================================= */}


           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">


             <div>


               <button
                 onClick={() =>
                   navigate("/admin/hostel-management")
                 }
                 className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline mb-1"
               >


                 <ArrowLeft className="w-3.5 h-3.5" />


                 Back to Hostel Requests


               </button>


               <div className="flex items-center gap-3">


                 <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                   Pending Approval
                 </h2>


                 <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200/80 rounded-full">
                   Pending Review
                 </span>


               </div>


               <p className="text-xs text-slate-500 mt-1">
                 Review submitted hostel information before making a final decision.
               </p>


             </div>


             {/* QUICK ACTIONS */}


             <div className="flex items-center gap-3">


               <button className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors bg-white">
                 Reject
               </button>


               <button className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors bg-white">
                 Request Changes
               </button>


               <button
                 disabled={
                   completedCount < checklist.length
                 }
                 className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                   completedCount === checklist.length
                     ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                     : "bg-slate-200 text-slate-400 cursor-not-allowed"
                 }`}
               >
                 Approve Hostel
               </button>


             </div>


           </div>


           {/* ================================================= */}
           {/* TWO COLUMN REVIEW GRID                           */}
           {/* ================================================= */}


           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">


             {/* ================================================= */}
             {/* LEFT CONTENT COLUMN                             */}
             {/* ================================================= */}


             <div className="lg:col-span-8 space-y-6">


               {/* HOSTEL OVERVIEW */}


               <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">


                 <div className="flex items-center justify-between mb-4">


                   <h3 className="text-base font-bold text-slate-900">
                     Hostel Overview
                   </h3>


                   <button className="text-xs font-semibold text-blue-600 hover:underline">
                     View Full Preview
                   </button>


                 </div>


                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                   <div className="h-32 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">


                     <ImageOff className="w-6 h-6 text-slate-400 stroke-[1.5]" />


                     <span className="text-xs font-medium">
                       No photos submitted
                     </span>


                   </div>


                   <div className="h-32 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">


                     <FileQuestion className="w-6 h-6 text-slate-400 stroke-[1.5]" />


                     <span className="text-xs font-medium">
                       No hostel information available yet.
                     </span>


                   </div>


                 </div>


                 {/* PHOTO VERIFICATION */}


                 <div className="mt-6 border-t border-slate-100 pt-5">


                   <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                     Photo Verification
                   </h4>


                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


                     <div>


                       <span className="text-xs font-medium text-slate-600 block mb-1.5">
                         Cover Photo
                       </span>


                       <div className="h-28 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-xs text-slate-400">
                         No photos submitted yet
                       </div>


                     </div>


                     <div>


                       <span className="text-xs font-medium text-slate-600 block mb-1.5">
                         Gallery
                       </span>


                       <div className="h-28 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex items-center justify-center text-xs text-slate-400">
                         No photos submitted yet
                       </div>


                     </div>


                   </div>


                   <div className="flex justify-end gap-3 mt-4">


                     <button className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                       Request Replacement
                     </button>


                     <button className="px-3.5 py-1.5 text-xs font-semibold text-blue-600 border border-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                       Verify Photos
                     </button>


                   </div>


                 </div>


               </div>


               {/* ================================================= */}
               {/* SUBMITTED INFORMATION                            */}
               {/* ================================================= */}


               <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">


                 <h3 className="text-base font-bold text-slate-900 mb-4">
                   Submitted Information
                 </h3>


                 <div className="space-y-2">


                   {[
                     {
                       key: "basicInfo",
                       label: "Basic Info",
                       icon: Info,
                     },
                     {
                       key: "location",
                       label: "Location",
                       icon: MapPin,
                     },
                     {
                       key: "amenities",
                       label: "Amenities",
                       icon: Wifi,
                     },
                     {
                       key: "roomsPricing",
                       label:
                         "Rooms & Pricing (Monthly per bed)",
                       icon: BedDouble,
                     },
                     {
                       key: "rules",
                       label: "Rules",
                       icon: SlidersHorizontal,
                     },
                     {
                       key: "documents",
                       label: "Documents",
                       icon: FolderClosed,
                     },
                   ].map(
                     ({
                       key,
                       label,
                       icon: Icon,
                     }) => (


                       <div
                         key={key}
                         className="border border-slate-100 rounded-lg overflow-hidden transition-all"
                       >


                         <button
                           onClick={() =>
                             toggleAccordion(key)
                           }
                           className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/70 transition-colors text-left"
                         >


                           <div className="flex items-center gap-3 text-slate-700">


                             <Icon className="w-4 h-4 text-slate-500 stroke-[1.75]" />


                             <span className="text-xs font-semibold">
                               {label}
                             </span>


                           </div>


                           <ChevronDown
                             className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                               openAccordions[key]
                                 ? "rotate-180 text-slate-600"
                                 : ""
                             }`}
                           />


                         </button>


                         {openAccordions[key] && (


                           <div className="p-4 pt-1 bg-slate-50 text-xs text-slate-500 border-t border-slate-100">


                             No{" "}
                             {label.toLowerCase()}{" "}
                             details have been submitted for review.


                           </div>


                         )}


                       </div>


                     )
                   )}


                 </div>


               </div>


             </div>


             {/* ================================================= */}
             {/* RIGHT COLUMN                                     */}
             {/* ================================================= */}


             <div className="lg:col-span-4 space-y-6">


               {/* VERIFICATION CHECKLIST */}


               <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">


                 <div className="flex items-center justify-between mb-4">


                   <h3 className="text-sm font-bold text-slate-900">
                     Verification Checklist
                   </h3>


                   <span className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 text-slate-600 rounded-md">
                     {completedCount} /{" "}
                     {checklist.length} Checks Completed
                   </span>


                 </div>


                 <div className="space-y-3">


                   {checklist.map((item) => (


                     <label
                       key={item.id}
                       onClick={() =>
                         toggleChecklistItem(item.id)
                       }
                       className="flex items-center gap-3 cursor-pointer group select-none"
                     >


                       {item.completed ? (


                         <CheckCircle2 className="w-4 h-4 text-blue-600" />


                       ) : (


                         <Circle className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors" />


                       )}


                       <span
                         className={`text-xs font-medium transition-colors ${
                           item.completed
                             ? "text-slate-900 font-semibold"
                             : "text-slate-600"
                         }`}
                       >
                         {item.label}
                       </span>


                     </label>


                   ))}


                 </div>


               </div>


               {/* OWNER PROFILE */}


               <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">


                 <h3 className="text-sm font-bold text-slate-900 mb-3">
                   Owner Profile
                 </h3>


                 <div className="h-28 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2 mb-3">


                   <UserX className="w-5 h-5 text-slate-400 stroke-[1.5]" />


                   <span className="text-xs font-medium">
                     No owner information available.
                   </span>


                 </div>


                 <button className="w-full py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                   View Owner History
                 </button>


               </div>


               {/* LOCATION CHECK */}


               <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">


                 <h3 className="text-sm font-bold text-slate-900 mb-3">
                   Location Check
                 </h3>


                 <div className="h-28 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">


                   <MapPinOff className="w-5 h-5 text-slate-400 stroke-[1.5]" />


                   <span className="text-xs font-medium">
                     No location data submitted.
                   </span>


                 </div>


               </div>


               {/* REVIEW HISTORY */}


               <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">


                 <h3 className="text-sm font-bold text-slate-900 mb-3">
                   Review History
                 </h3>


                 <div className="h-24 bg-slate-50 border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 gap-1.5">


                   <History className="w-5 h-5 text-slate-400 stroke-[1.5]" />


                   <span className="text-xs font-medium">
                     No review activity yet.
                   </span>


                 </div>


               </div>


             </div>


           </div>


           {/* ================================================= */}
           {/* FINAL DECISION                                   */}
           {/* ================================================= */}


           <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">


             <div>


               <h4 className="text-sm font-bold text-slate-900">
                 Final Decision
               </h4>


               <p className="text-xs text-slate-500 mt-0.5">
                 Ensure all checks are completed before approving.
               </p>


             </div>


             <div className="flex items-center gap-3 w-full sm:w-auto justify-end">


               <button className="px-4 py-2 text-xs font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
                 Request Changes
               </button>


               <button className="px-4 py-2 text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 rounded-lg transition-colors">
                 Reject Hostel
               </button>


               <button
                 disabled={
                   completedCount < checklist.length
                 }
                 className={`px-5 py-2 text-xs font-semibold rounded-lg transition-colors ${
                   completedCount === checklist.length
                     ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                     : "bg-blue-400 text-white opacity-80 cursor-not-allowed"
                 }`}
               >
                 Approve Hostel
               </button>


             </div>


           </div>


         </div>


       </main>


     </div>


   </div>
 );
};


export default HostelApprovalPage;


