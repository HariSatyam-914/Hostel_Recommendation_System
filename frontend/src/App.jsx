import { Routes, Route, Navigate } from "react-router-dom";

import { useState } from "react";

import Login from "./Components/Login";

import Home from "./Components/Home";

import Search from "./Components/Search";

import AddHostelDetails from "./Components/AddHostelDetails";

import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

import ForgotPassword from "./Components/ForgotPassword";

import VerifyOtp from "./Components/VerifyOtp";

import ResetPassword from "./Components/ResetPassword";

import { Toaster } from "react-hot-toast";

import AdminProtectedRoute from "./Components/AdminProtectedRoute";

import AdminDashboard from "./Components/AdminDashboard";

import UserIssues from "./Components/UserIssues";

import PendingApprovals from "./Components/PendingApprovals";

import HostelRequest from "./Components/HostelRequest";

import ApprovalPending from "./Components/ApprovalPending";

import OwnerHostelRoute from "./Components/OwnerHostelRoute";

import AdminAnalytics from "./Components/AdminAnalytics";

import OwnerEmailVerification from "./Components/OwnerEmailVerification";

import OwnerApprovalPendingRoute from "./Components/OwnerApprovalPendingRoute";

import HostelReviewStatus from "./Components/HostelReviewStatus";

import OwnerDashboard from "./Components/OwnerDashboard";

import HostelProfile from "./Components/HostelProfile";

import Rooms from "./Components/Rooms";

import Amenity from "./Components/Amenity";

import Photos from "./Components/Photos";

import Issues from "./Components/Issues";

import Reviews from "./Components/Reviews";

import Analytics from "./Components/Analytics";

import Settings from "./Components/Settings";

import Support from "./Components/Support";

import Subscription from "./Components/Subscription";

// ADDED: Owner Verification
import OwnerVerification from "./Components/OwnerVerification";

import Reports from "./Components/Reports";

import Users from "./Components/Users";

import SystemSettings from "./Components/SystemSettings";

import AuditLogs from "./Components/AuditLogs";

import About from "./Components/About";

import HelpContact from "./Components/HelpContact";

import ReUploadReview from "./Components/ReUploadReview";

import ViewDetails from "./Components/ViewDetails";

import GoogleOAuthCallback from "./Components/GoogleOAuthCallback";

// Google OAuth new-user profile completion
import GoogleOAuth2CompleteProfile from "./Components/GoogleOAuth2CompleteProfile";


function App() {

    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem("user"))
    );

    const logout = () => {

        localStorage.removeItem("user");

        setUser(null);

    };

    const [hostelId, setHostelId] = useState(null);

    // const ownerStatus = response.data?.status;
    // const ownerHostelId = response.data?.hostelId;
    // setStatus(ownerStatus);
    // setHostelId(ownerHostelId);

    return (

        <>

            <Toaster position="top-center" />

            <Routes>

                {/* Public */}

                <Route
                    path="/"
                    element={
                        <Login setUser={setUser} />
                    }
                />

                {/* =====================================================
                    GOOGLE OAUTH - EXISTING USER
                    ===================================================== */}

                <Route
                    path="/oauth2/callback"
                    element={
                        <GoogleOAuthCallback
                            setUser={setUser}
                        />
                    }
                />

                {/* =====================================================
                    GOOGLE OAUTH - NEW USER PROFILE COMPLETION
                    ===================================================== */}

                <Route
                    path="/oauth2/complete-profile"
                    element={
                        <GoogleOAuth2CompleteProfile
                            setUser={setUser}
                        />
                    }
                />

                <Route
                    path="/forgot-password"
                    element={<ForgotPassword />}
                />

                <Route
                    path="/verify-otp"
                    element={<VerifyOtp />}
                />

                <Route
                    path="/reset-password"
                    element={<ResetPassword />}
                />

                {/* User */}

                <Route
                    path="/home"
                    element={
                        user
                            ? (
                                <Home
                                    user={user}
                                    onLogout={logout}
                                />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                {/* Search */}

                <Route
                    path="/search"
                    element={<Search />}
                />

                <Route
                    path="/about"
                    element={<About />}
                />

                <Route
                    path="/help"
                    element={<HelpContact />}
                />

                <Route
                    path="/hostels/:id"
                    element={<ViewDetails />}
                />

                {/* Owner */}

                <Route
                    path="/owner/add-hostel"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <OwnerHostelRoute>
                                    <AddHostelDetails />
                                </OwnerHostelRoute>
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/approval-pending"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <OwnerApprovalPendingRoute>
                                    <ApprovalPending />
                                </OwnerApprovalPendingRoute>
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                {/* 
                <Route
                    path="/owner/approval-pending"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <OwnerApprovalPendingRoute>
                                    <HostelReviewStatus />
                                </OwnerApprovalPendingRoute>
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />
                */}

                <Route
                    path="/owner/email-verification"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <OwnerEmailVerification />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/email-verification/:hostelId"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <OwnerEmailVerification />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/rooms"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Rooms />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/review-status/:hostelId"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <HostelReviewStatus />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/dashboard"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <OwnerDashboard />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/hostel"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <HostelProfile />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/hostel/rooms/:hostelId"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Rooms />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/amenities"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Amenity />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/photos"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Photos />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/issues"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Issues />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/reviews"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Reviews />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/analytics"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Analytics />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/settings"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Settings />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                <Route
                    path="/owner/support"
                    element={
                        user?.role === "OWNER"
                            ? (
                                <Support />
                            )
                            : (
                                <Navigate
                                    to="/"
                                    replace
                                />
                            )
                    }
                />

                {/* Admin */}

                <Route element={<AdminProtectedRoute />}>

                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/hostel-management"
                        element={<HostelRequest />}
                    />

                    <Route
                        path="/admin/pending-approvals/:hostelId"
                        element={<PendingApprovals />}
                    />

                    <Route
                        path="/admin/reupload"
                        element={<ReUploadReview />}
                    />

                    <Route
                        path="/admin/user-issues"
                        element={<UserIssues />}
                    />

                    {/* ADDED: Owner Verification */}

                    <Route
                        path="/admin/owner-verification"
                        element={<OwnerVerification />}
                    />

                    <Route
                        path="/admin/analytics"
                        element={<AdminAnalytics />}
                    />

                    <Route
                        path="/admin/subscription"
                        element={<Subscription />}
                    />

                    <Route
                        path="/admin/reports"
                        element={<Reports />}
                    />

                    <Route
                        path="/admin/users"
                        element={<Users />}
                    />

                    <Route
                        path="/admin/settings"
                        element={<SystemSettings />}
                    />

                    <Route
                        path="/admin/audit-logs"
                        element={<AuditLogs />}
                    />

                </Route>

            </Routes>

            <ToastContainer
                position="top-center"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
            />

        </>

    );
}

export default App;