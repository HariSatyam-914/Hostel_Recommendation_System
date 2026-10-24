import React, { useState } from "react";
import Profile from "./Profile";
import SavedHostels from "./SavedHostels";
import Subscriptions from "./Subscriptions";

function Dashboard({ user }) {

    // Sidebar is open when Dashboard loads
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // My Profile is selected by default
    const [activeSection, setActiveSection] = useState("profile");


    // Render the selected component
    const renderContent = () => {

        switch (activeSection) {

            case "profile":
                return <Profile user={user} />;

            case "savedHostels":
                return <SavedHostels user={user} />;

            case "subscriptions":
                return <Subscriptions user={user} />;

            default:
                return <Profile user={user} />;
        }
    };


    // Change selected section
    const handleSectionChange = (section) => {
        setActiveSection(section);
    };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">

            {/* =================================================
                COLLAPSED SIDEBAR
            ================================================= */}

            {!isSidebarOpen && (
                <div className="fixed left-0 top-0 z-50 flex h-screen w-16 flex-col items-center border-r border-blue-100 bg-white/95 py-5 shadow-lg backdrop-blur-md">

                    {/* Open Sidebar */}
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl text-xl text-blue-700 transition hover:bg-blue-100"
                        title="Open Dashboard"
                    >
                        ☰
                    </button>


                    {/* Divider */}
                    <div className="mb-5 h-px w-8 bg-blue-100"></div>


                    {/* My Profile */}
                    <button
                        onClick={() => handleSectionChange("profile")}
                        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition
                            ${
                                activeSection === "profile"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-blue-700 hover:bg-blue-100"
                            }
                        `}
                        title="My Profile"
                    >
                        👤
                    </button>


                    {/* Saved Hostels */}
                    <button
                        onClick={() => handleSectionChange("savedHostels")}
                        className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold transition
                            ${
                                activeSection === "savedHostels"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-blue-700 hover:bg-blue-100"
                            }
                        `}
                        title="Saved Hostels"
                    >
                        🔖
                    </button>


                    {/* Subscriptions */}
                    <button
                        onClick={() => handleSectionChange("subscriptions")}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold transition
                            ${
                                activeSection === "subscriptions"
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "text-blue-700 hover:bg-blue-100"
                            }
                        `}
                        title="Subscriptions"
                    >
                        ⭐
                    </button>

                </div>
            )}


            {/* =================================================
                MAIN DASHBOARD LAYOUT
            ================================================= */}

            <div
                className={`flex min-h-screen transition-all duration-300 ${
                    isSidebarOpen ? "pl-72" : "pl-16"
                }`}
            >

                {/* =================================================
                    OPEN SIDEBAR
                ================================================= */}

                {isSidebarOpen && (
                    <aside className="fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-blue-100 bg-white/95 shadow-xl backdrop-blur-md">

                        {/* -------------------------------
                            SIDEBAR HEADER
                        -------------------------------- */}

                        <div className="border-b border-blue-100 p-6">

                            <div className="flex items-center justify-between">

                                <h1 className="text-xl font-bold tracking-wide text-blue-800">
                                    USER DASHBOARD
                                </h1>

                                {/* Close Sidebar */}
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-gray-500 transition hover:bg-blue-100 hover:text-blue-700"
                                    title="Close Dashboard"
                                >
                                    ×
                                </button>

                            </div>


                            {/* User Name */}
                            <p className="mt-2 truncate text-sm font-medium text-gray-600">
                                {user?.name || "User"}
                            </p>

                        </div>


                        {/* -------------------------------
                            SIDEBAR BODY
                        -------------------------------- */}

                        <div className="flex-1 p-4">

                            {/* My Profile */}
                            <button
                                onClick={() =>
                                    handleSectionChange("profile")
                                }
                                className={`mb-3 flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200
                                    ${
                                        activeSection === "profile"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    }
                                `}
                            >

                                <span className="text-xl">
                                    👤
                                </span>

                                <span>
                                    My Profile
                                </span>

                            </button>


                            {/* Saved Hostels */}
                            <button
                                onClick={() =>
                                    handleSectionChange("savedHostels")
                                }
                                className={`mb-3 flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200
                                    ${
                                        activeSection === "savedHostels"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    }
                                `}
                            >

                                <span className="text-xl">
                                    🔖
                                </span>

                                <span>
                                    Saved Hostels
                                </span>

                            </button>


                            {/* Subscriptions */}
                            <button
                                onClick={() =>
                                    handleSectionChange("subscriptions")
                                }
                                className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left font-medium transition-all duration-200
                                    ${
                                        activeSection === "subscriptions"
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                                    }
                                `}
                            >

                                <span className="text-xl">
                                    ⭐
                                </span>

                                <span>
                                    Subscriptions
                                </span>

                            </button>

                        </div>

                    </aside>
                )}


                {/* =================================================
                    DASHBOARD CONTENT
                ================================================= */}

                <main className="min-w-0 flex-1 p-6 md:p-8">

                    <div className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm md:p-8">

                        {renderContent()}

                    </div>

                </main>

            </div>

        </div>
    );
}

export default Dashboard;