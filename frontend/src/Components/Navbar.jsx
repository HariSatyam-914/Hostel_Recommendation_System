// import React, { useState } from "react";
// import { User, LogOut } from "lucide-react";
// import { useNavigate , Link } from "react-router-dom";

// export default function Navbar({ user, onLogout }) {

//     const navigate = useNavigate();
//     const [showProfileMenu, setShowProfileMenu] = useState(false);

//     const handleLogout = () => {
//         onLogout();
//         navigate("/");
//     };

//     return (
//         <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">

//             <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">

//                 {/* Logo */}
//                 <span className="text-3xl font-black text-blue-600 tracking-tight">
//                     FindMyHostel
//                 </span>

//                 {/* Navigation Links */}
//                 <nav className="hidden md:flex items-center gap-10 font-bold text-lg text-slate-700">

//                     <Link
//                         to="/home"
//                         className="hover:text-blue-600 transition-colors"
//                     >
//                         Home
//                     </Link>

//                     <Link
//                         to="/search"
//                         className="hover:text-blue-600 transition-colors"
//                     >
//                         Search
//                     </Link>

//                     <Link
//                         to="/about"
//                         className="hover:text-blue-600 transition-colors"
//                     >
//                         About
//                     </Link>

//                     <Link
//                         to="/contact"
//                         className="hover:text-blue-600 transition-colors"
//                     >
//                         Contact
//                     </Link>

//                 </nav>

//                 {/* Authentication Section */}
//                 <div className="flex items-center gap-4 relative">

//                     {user ? (

//                         /* Logged In */
//                         <div className="relative">

//                             {/* Profile Button */}
//                             <button
//                                 onClick={() =>
//                                     setShowProfileMenu(!showProfileMenu)
//                                 }
//                                 className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl transition-all border border-slate-200"
//                             >

//                                 {user.avatar ? (

//                                     <img
//                                         src={user.avatar}
//                                         alt="Profile"
//                                         className="w-10 h-10 rounded-full object-cover"
//                                     />

//                                 ) : (

//                                     <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">

//                                         {user.name ? (
//                                             user.name.charAt(0)
//                                         ) : (
//                                             <User className="w-5 h-5" />
//                                         )}

//                                     </div>

//                                 )}

//                                 <span className="font-bold text-slate-800 pr-1">
//                                     {user.name || "My Account"}
//                                 </span>

//                             </button>

//                             {/* Profile Dropdown */}
//                             {showProfileMenu && (

//                                 <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden">

//                                     {/* User Information */}
//                                     <div className="px-5 py-3 border-b border-slate-100">

//                                         <p className="text-sm text-slate-500 font-medium">
//                                             Signed in as
//                                         </p>

//                                         <p className="font-bold text-slate-900 truncate">
//                                             {user.name}
//                                         </p>

//                                     </div>

//                                     {/* View Profile */}
//                                     <a
//                                         href="#profile"
//                                         className="flex items-center gap-3 px-5 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
//                                     >
//                                         <User className="w-5 h-5 text-slate-500" />

//                                         View Profile
//                                     </a>

//                                     {/* Logout */}
//                                     <button
//                                         onClick={handleLogout}
//                                         className="w-full flex items-center gap-3 px-5 py-3 text-base font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
//                                     >
//                                         <LogOut className="w-5 h-5" />

//                                         Logout
//                                     </button>

//                                 </div>

//                             )}

//                         </div>

//                     ) : (

//                         /* Logged Out */
//                         <>
//                             <button
//                                 className="px-6 py-3 text-lg font-bold text-slate-700 hover:text-blue-600 transition-colors"
//                             >
//                                 Login
//                             </button>

//                             <button
//                                 className="px-8 py-3.5 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md"
//                             >
//                                 Register
//                             </button>
//                         </>

//                     )}

//                 </div>

//             </div>

//         </header>
//     );
// }


import React, { useState } from "react";
import { User, LogOut } from "lucide-react";
import { useNavigate , Link } from "react-router-dom";




export default function Navbar({ user, onLogout }) {

    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = () => {
        onLogout();
        navigate("/");
    };

   

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">

            <div className="max-w-7xl mx-auto px-8 h-24 flex items-center justify-between">

                {/* Logo */}
                <span className="text-3xl font-black text-blue-600 tracking-tight">
                    FindMyHostel
                </span>

                {/* Navigation Links */}
                <nav className="hidden md:flex items-center gap-10 font-bold text-lg text-slate-700">



                    <Link
                        to="/home"  
                        className="hover:text-blue-600 transition-colors"
                    >
                        Home
                    </Link>

                    <Link
                        to="/search"
                        className="hover:text-blue-600 transition-colors"
                    >
                        Search
                    </Link>

                    <Link
                        to="/about"
                        className="hover:text-blue-600 transition-colors"
                    >
                        About
                    </Link>

                    <Link
                        to="/contact"  
                        className="hover:text-blue-600 transition-colors"
                    >
                        Contact
                    </Link>

                </nav>

                {/* Authentication Section */}
                <div className="flex items-center gap-4 relative">

                    {user ? (

                        /* Logged In */
                        <div className="relative">

                            {/* Profile Button */}
                            <button
                                onClick={() =>
                                    setShowProfileMenu(!showProfileMenu)
                                }
                                className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl transition-all border border-slate-200"
                            >

                                {user.avatar ? (

                                    <img
                                        src={user.avatar}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover"
                                    />

                                ) : (

                                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">

                                        {user.name ? (
                                            user.name.charAt(0)
                                        ) : (
                                            <User className="w-5 h-5" />
                                        )}

                                    </div>

                                )}

                                <span className="font-bold text-slate-800 pr-1">
                                    {user.name || "My Account"}
                                </span>

                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (

                                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-50 overflow-hidden">

                                    {/* User Information */}
                                    <div className="px-5 py-3 border-b border-slate-100">

                                        <p className="text-sm text-slate-500 font-medium">
                                            Signed in as
                                        </p>

                                        <p className="font-bold text-slate-900 truncate">
                                            {user.name}
                                        </p>

                                    </div>

                                    {/* View Profile */}
                                    <Link
                                        to="/dashboard"
                                        className="flex items-center gap-3 px-5 py-3 text-base font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                                    >
                                        <User className="w-5 h-5 text-slate-500" />

                                        View Profile
                                    </Link>

                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-5 py-3 text-base font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <LogOut className="w-5 h-5" />

                                        Logout
                                    </button>

                                </div>

                            )}

                        </div>

                    ) : (

                        /* Logged Out */
                        <>
                            <button
                                className="px-6 py-3 text-lg font-bold text-slate-700 hover:text-blue-600 transition-colors"
                            >
                                Login
                            </button>

                            <button
                                className="px-8 py-3.5 text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md"
                            >
                                Register
                            </button>
                        </>

                    )}

                   

                </div>

            </div>

        </header>
    );
}
