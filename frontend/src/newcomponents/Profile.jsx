import React, { useState } from "react";
import {
    FiEdit3,
    FiMail,
    FiPhone,
    FiMapPin,
    FiLock,
    FiShield,
    FiCheckCircle,
    FiX,
    FiEye,
    FiEyeOff,
} from "react-icons/fi";

function Profile({ user }) {

    // Edit profile state
    const [isEditing, setIsEditing] = useState(false);

    // Password modal state
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    // Show/hide password
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);


    /*
     * We create a separate state for editing.
     *
     * This prevents the original user information
     * from changing while the user is typing.
     */
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        location: user?.location || "",
    });


    // Password form
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });


    /*
     * Get first letter of user's name
     */
    const getInitial = () => {
        const name = user?.name || "User";

        return name.charAt(0).toUpperCase();
    };


    /*
     * Handle profile input changes
     */
    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /*
     * Cancel editing
     */
    const handleCancel = () => {

        setFormData({
            name: user?.name || "",
            email: user?.email || "",
            phone: user?.phone || "",
            location: user?.location || "",
        });

        setIsEditing(false);
    };


    /*
     * Save profile
     *
     * For now this only exits edit mode.
     *
     * Later we will connect this function
     * with your Spring Boot PUT/PATCH API.
     */
    const handleSave = (event) => {

        event.preventDefault();

        console.log("Updated profile:", formData);

        setIsEditing(false);
    };


    /*
     * Handle password input
     */
    const handlePasswordChange = (event) => {

        const { name, value } = event.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };


    /*
     * Change password
     *
     * Backend API will be connected later.
     */
    const handlePasswordSubmit = (event) => {

        event.preventDefault();

        if (
            passwordData.newPassword !==
            passwordData.confirmPassword
        ) {
            alert("New password and confirm password do not match.");
            return;
        }

        console.log("Password update requested");

        setPasswordData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setShowPasswordModal(false);
    };


    return (
        <div className="w-full">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                    <div className="mb-2 flex items-center gap-2">

                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>

                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                            Account
                        </span>

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                        My Profile
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 md:text-base">
                        Manage your personal information and account settings.
                    </p>

                </div>


                {/* Edit / Cancel button */}

                {!isEditing ? (

                    <button
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
                    >
                        <FiEdit3 size={17} />
                        Edit Profile
                    </button>

                ) : (

                    <button
                        onClick={handleCancel}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        <FiX size={17} />
                        Cancel
                    </button>

                )}

            </div>


            {/* =====================================================
                PROFILE IDENTITY CARD
            ====================================================== */}

            <div className="relative mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 text-white shadow-xl md:p-8">

                {/* Decorative circles */}

                <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10"></div>

                <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-white/5"></div>


                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

                    {/* Avatar */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border border-white/30 bg-white/20 text-4xl font-bold shadow-lg backdrop-blur-md">
                        {getInitial()}
                    </div>


                    {/* User information */}

                    <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-3">

                            <h2 className="truncate text-2xl font-bold md:text-3xl">
                                {user?.name || "User"}
                            </h2>

                            <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                                <FiCheckCircle size={13} />
                                Verified
                            </span>

                        </div>


                        <p className="mt-2 flex items-center gap-2 text-sm text-blue-100">
                            <FiMail size={15} />
                            {user?.email || "No email available"}
                        </p>


                        <p className="mt-1 text-sm text-blue-200">
                            Hostel Seeker
                        </p>

                    </div>

                </div>

            </div>


            {/* =====================================================
                PERSONAL INFORMATION
            ====================================================== */}

            <form onSubmit={handleSave}>

                <div className="mb-8">

                    <div className="mb-5">

                        <h2 className="text-xl font-bold text-gray-900">
                            Personal Information
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Your basic account and contact information.
                        </p>

                    </div>


                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                        {/* ===============================
                            FULL NAME
                        ================================ */}

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">

                            <div className="mb-4 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FiEdit3 size={18} />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Full Name
                                    </p>

                                </div>

                            </div>


                            {isEditing ? (

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Enter your name"
                                />

                            ) : (

                                <p className="text-lg font-semibold text-gray-800">
                                    {user?.name || "Not provided"}
                                </p>

                            )}

                        </div>


                        {/* ===============================
                            EMAIL
                        ================================ */}

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">

                            <div className="mb-4 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FiMail size={18} />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Email Address
                                    </p>

                                </div>

                            </div>


                            {isEditing ? (

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Enter your email"
                                />

                            ) : (

                                <p className="break-all text-lg font-semibold text-gray-800">
                                    {user?.email || "Not provided"}
                                </p>

                            )}

                        </div>


                        {/* ===============================
                            PHONE
                        ================================ */}

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">

                            <div className="mb-4 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FiPhone size={18} />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Phone Number
                                    </p>

                                </div>

                            </div>


                            {isEditing ? (

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Enter your phone number"
                                />

                            ) : (

                                <p className="text-lg font-semibold text-gray-800">
                                    {user?.phone || "Not provided"}
                                </p>

                            )}

                        </div>


                        {/* ===============================
                            LOCATION
                        ================================ */}

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md">

                            <div className="mb-4 flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <FiMapPin size={18} />
                                </div>

                                <div>

                                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                        Location
                                    </p>

                                </div>

                            </div>


                            {isEditing ? (

                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    placeholder="Enter your location"
                                />

                            ) : (

                                <p className="text-lg font-semibold text-gray-800">
                                    {user?.location || "Not provided"}
                                </p>

                            )}

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    SAVE CHANGES
                ====================================================== */}

                {isEditing && (

                    <div className="mb-10 flex flex-col justify-end gap-3 border-t border-gray-100 pt-6 sm:flex-row">

                        <button
                            type="button"
                            onClick={handleCancel}
                            className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                        >
                            Save Changes
                        </button>

                    </div>

                )}

            </form>


            {/* =====================================================
                ACCOUNT SECURITY
            ====================================================== */}

            <div>

                <div className="mb-5">

                    <h2 className="text-xl font-bold text-gray-900">
                        Account Security
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Manage your password and account security.
                    </p>

                </div>


                <div className="space-y-4">


                    {/* PASSWORD */}

                    <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="group flex w-full items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-100 hover:shadow-md"
                    >

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <FiLock size={19} />
                            </div>

                            <div>

                                <p className="font-semibold text-gray-800">
                                    Password
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Keep your account protected with a strong password.
                                </p>

                            </div>

                        </div>


                        <span className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600">
                            →
                        </span>

                    </button>


                    {/* ACCOUNT STATUS */}

                    <div className="flex items-center justify-between rounded-2xl border border-green-100 bg-green-50/60 p-5">

                        <div className="flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-green-600 shadow-sm">
                                <FiShield size={19} />
                            </div>

                            <div>

                                <p className="font-semibold text-gray-800">
                                    Account Status
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    Your account is active and verified.
                                </p>

                            </div>

                        </div>


                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <FiCheckCircle size={18} />
                        </div>

                    </div>

                </div>

            </div>


            {/* =====================================================
                CHANGE PASSWORD MODAL
            ====================================================== */}

            {showPasswordModal && (

                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl md:p-8">

                        {/* Modal header */}

                        <div className="mb-6 flex items-start justify-between">

                            <div>

                                <h2 className="text-2xl font-bold text-gray-900">
                                    Change Password
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Update your password to keep your account secure.
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() => setShowPasswordModal(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            >
                                <FiX size={19} />
                            </button>

                        </div>


                        <form onSubmit={handlePasswordSubmit} className="space-y-5">


                            {/* Current password */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Current Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showCurrentPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowCurrentPassword(
                                                !showCurrentPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                    >
                                        {showCurrentPassword
                                            ? <FiEyeOff />
                                            : <FiEye />
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* New password */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    New Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showNewPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowNewPassword(
                                                !showNewPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                    >
                                        {showNewPassword
                                            ? <FiEyeOff />
                                            : <FiEye />
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* Confirm password */}

                            <div>

                                <label className="mb-2 block text-sm font-semibold text-gray-700">
                                    Confirm New Password
                                </label>

                                <div className="relative">

                                    <input
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                !showConfirmPassword
                                            )
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                    >
                                        {showConfirmPassword
                                            ? <FiEyeOff />
                                            : <FiEye />
                                        }
                                    </button>

                                </div>

                            </div>


                            {/* Buttons */}

                            <div className="flex flex-col gap-3 pt-3 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPasswordModal(false)
                                    }
                                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                                >
                                    Update Password
                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Profile;