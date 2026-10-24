import React, { useState } from "react";
import {
    FiHeart,
    FiMapPin,
    FiStar,
    FiTrash2,
    FiExternalLink,
    FiAlertTriangle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function SavedHostels({ user }) {

    const navigate = useNavigate();

    /*
     * Temporary saved-hostel data.
     *
     * Later this will come from your Spring Boot backend.
     */
    const [savedHostels, setSavedHostels] = useState([
        {
            id: 1,
            name: "Sri Sai Residency",
            location: "KPHB, Hyderabad",
            price: "₹8,500",
            rating: 4.5,
            image: "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 2,
            name: "Urban Nest",
            location: "Madhapur, Hyderabad",
            price: "₹9,000",
            rating: 4.3,
            image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        },
        {
            id: 3,
            name: "Comfort Stay",
            location: "Kukatpally, Hyderabad",
            price: "₹7,800",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        },
    ]);


    /*
     * Remove one hostel
     */
    const handleRemoveHostel = (id) => {

        const hostel = savedHostels.find(
            (hostel) => hostel.id === id
        );

        if (!hostel) return;

        const confirmed = window.confirm(
            `Remove "${hostel.name}" from your saved hostels?`
        );

        if (!confirmed) return;

        setSavedHostels((previous) =>
            previous.filter(
                (hostel) => hostel.id !== id
            )
        );

        /*
         * Later:
         *
         * axios.delete(
         *   `http://localhost:8080/api/saved-hostels/${id}`
         * )
         */
    };


    /*
     * Remove all saved hostels
     */
    const handleRemoveAll = () => {

        if (savedHostels.length === 0) return;

        const confirmed = window.confirm(
            "Are you sure you want to remove all saved hostels?"
        );

        if (!confirmed) return;

        setSavedHostels([]);

        /*
         * Later:
         *
         * axios.delete(
         *   `http://localhost:8080/api/users/${user.id}/saved-hostels`
         * )
         */
    };


    /*
     * Navigate to hostel details
     */
    const handleViewHostel = (id) => {

        navigate(`/hosteldetails/${id}`);
    };


    return (
        <div className="w-full">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                <div>

                    <div className="mb-2 flex items-center gap-2">

                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>

                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                            Your Collection
                        </span>

                    </div>

                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                        Saved Hostels
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 md:text-base">
                        Hostels you've saved for later.
                    </p>

                </div>


                {/* Remove All */}

                {savedHostels.length > 0 && (

                    <button
                        onClick={handleRemoveAll}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                    >
                        <FiTrash2 size={17} />

                        Remove All
                    </button>

                )}

            </div>


            {/* =====================================================
                SAVED HOSTELS COUNT
            ====================================================== */}

            {savedHostels.length > 0 && (

                <div className="mb-6 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <FiHeart size={18} />
                    </div>

                    <div>

                        <p className="text-sm font-semibold text-gray-800">
                            {savedHostels.length}{" "}
                            {savedHostels.length === 1
                                ? "Hostel"
                                : "Hostels"}{" "}
                            Saved
                        </p>

                        <p className="text-xs text-gray-500">
                            Your saved places are waiting for you.
                        </p>

                    </div>

                </div>

            )}


            {/* =====================================================
                HOSTEL LIST
            ====================================================== */}

            {savedHostels.length > 0 ? (

                <div className="space-y-5">

                    {savedHostels.map((hostel) => (

                        <div
                            key={hostel.id}
                            className="group overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
                        >

                            <div className="flex flex-col md:flex-row">


                                {/* =================================================
                                    HOSTEL IMAGE
                                ================================================== */}

                                <div className="relative h-56 w-full shrink-0 overflow-hidden md:h-auto md:w-64">

                                    <img
                                        src={hostel.image}
                                        alt={hostel.name}
                                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                    />


                                    {/* Image overlay */}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>


                                    {/* Saved badge */}

                                    <div className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-red-500 shadow-md backdrop-blur-sm">
                                        <FiHeart
                                            size={17}
                                            fill="currentColor"
                                        />
                                    </div>

                                </div>


                                {/* =================================================
                                    HOSTEL INFORMATION
                                ================================================== */}

                                <div className="flex flex-1 flex-col p-5 md:p-6">

                                    {/* Hostel name */}

                                    <div className="flex items-start justify-between gap-4">

                                        <div>

                                            <h2 className="text-xl font-bold text-gray-900 transition group-hover:text-blue-700">
                                                {hostel.name}
                                            </h2>


                                            {/* Location */}

                                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">

                                                <FiMapPin
                                                    size={15}
                                                    className="shrink-0 text-blue-500"
                                                />

                                                <span>
                                                    {hostel.location}
                                                </span>

                                            </div>

                                        </div>


                                        {/* Rating */}

                                        <div className="flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-600">

                                            <FiStar
                                                size={15}
                                                fill="currentColor"
                                            />

                                            {hostel.rating}

                                        </div>

                                    </div>


                                    {/* Divider */}

                                    <div className="my-5 h-px bg-gray-100"></div>


                                    {/* Price */}

                                    <div>

                                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                                            Monthly Rent
                                        </p>

                                        <p className="mt-1 text-xl font-bold text-gray-900">
                                            {hostel.price}
                                            <span className="ml-1 text-sm font-normal text-gray-400">
                                                / month
                                            </span>
                                        </p>

                                    </div>


                                    {/* =================================================
                                        ACTIONS
                                    ================================================== */}

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                                        {/* View Hostel */}

                                        <button
                                            onClick={() =>
                                                handleViewHostel(hostel.id)
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl"
                                        >
                                            View Hostel

                                            <FiExternalLink
                                                size={16}
                                            />

                                        </button>


                                        {/* Remove */}

                                        <button
                                            onClick={() =>
                                                handleRemoveHostel(
                                                    hostel.id
                                                )
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:bg-red-100 hover:text-red-700"
                                        >
                                            <FiTrash2 size={16} />

                                            Remove
                                        </button>

                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            ) : (

                /* =====================================================
                    EMPTY STATE
                ====================================================== */

                <div className="flex min-h-[450px] items-center justify-center rounded-3xl border border-dashed border-blue-200 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/40 p-8">

                    <div className="max-w-md text-center">

                        {/* Icon */}

                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-blue-600 shadow-sm">

                            <FiHeart
                                size={34}
                            />

                        </div>


                        <h2 className="text-2xl font-bold text-gray-900">
                            No Saved Hostels
                        </h2>


                        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-500">
                            You haven't saved any hostels yet.
                            Explore hostels and save the ones you
                            like so you can easily find them later.
                        </p>


                        {/* Explore button */}

                        <button
                            onClick={() => navigate("/newsearch")}
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                            Explore Hostels

                            <FiExternalLink
                                size={16}
                            />

                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default SavedHostels;