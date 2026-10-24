import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  Star,
  Share2,
  Heart,
  MapPin,
  Tag,
  ShieldCheck,
  Wifi,
  Shirt,
  Coffee,
  Snowflake,
  Dumbbell,
  KeyRound,
  Clock,
  LogOut,
  Volume2,
  CigaretteOff,
  Train,
  Utensils,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";

function HostelDetails() {
  const { hostelId } = useParams();

  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [showFullDescription, setShowFullDescription] =
    useState(false);

  const [showAllAmenities, setShowAllAmenities] =
    useState(false);

  const [showAllReviews, setShowAllReviews] =
    useState(false);

  const [checkInDate, setCheckInDate] =
    useState("");

  const [duration, setDuration] =
    useState(1);

  const [tenants, setTenants] =
    useState(1);

  /*
  ============================================================
  AMENITY ICONS
  ============================================================
  */

  const amenityIcons = {
    WIFI: Wifi,
    WI_FI: Wifi,
    LAUNDRY: Shirt,
    COFFEE: Coffee,
    AC: Snowflake,
    AIR_CONDITIONING: Snowflake,
    GYM: Dumbbell,
    SECURITY: KeyRound,
  };

  /*
  ============================================================
  FETCH HOSTEL DETAILS
  ============================================================
  */

  useEffect(() => {
    fetchHostel();
  }, [hostelId]);

  const fetchHostel = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `http://localhost:8080/api/hostels/${hostelId}`
      );

      console.log("Hostel Response:", response.data);

      setHostel(response.data);

    } catch (error) {
      console.error("Error loading hostel:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load hostel details"
      );

    } finally {
      setLoading(false);
    }
  };

  /*
  ============================================================
  FAVORITE FUNCTION
  ============================================================
  */

  const handleFavorite = async () => {
    try {
      setIsFavorite((previous) => !previous);

      /*
      Uncomment this when backend API is ready

      await axios.post(
        `http://localhost:8080/api/user/favorites/${hostelId}`
      );
      */

    } catch (error) {
      console.error("Favorite error:", error);

      setIsFavorite((previous) => !previous);
    }
  };

  /*
  ============================================================
  SHARE FUNCTION
  ============================================================
  */

  const handleShare = async () => {
    try {
      const shareData = {
        title: hostel?.hostelName || "Hostel",
        text: `Check out ${
          hostel?.hostelName || "this hostel"
        }`,
        url: window.location.href,
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          window.location.href
        );

        alert("Hostel link copied to clipboard");
      }

    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  /*
  ============================================================
  SCHEDULE VISIT
  ============================================================
  */

  const handleScheduleVisit = async () => {
    if (!checkInDate) {
      alert("Please select a visit date");
      return;
    }

    try {
      const requestData = {
        visitDate: checkInDate,
        duration: duration,
        tenants: tenants,
      };

      console.log("Visit Request:", requestData);

      /*
      Uncomment when backend endpoint is created

      await axios.post(
        `http://localhost:8080/api/hostels/${hostelId}/visit`,
        requestData
      );
      */

      alert("Visit request submitted successfully");

    } catch (error) {
      console.error("Schedule visit error:", error);

      alert("Failed to schedule visit");
    }
  };

  /*
  ============================================================
  CONTACT PROPERTY
  ============================================================
  */

  const handleContactProperty = () => {
    if (hostel?.ownerPhone) {
      window.location.href =
        `tel:${hostel.ownerPhone}`;
    } else {
      alert("Owner contact information is not available");
    }
  };

  /*
  ============================================================
  LOADING
  ============================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>

          <p className="mt-4 text-slate-600">
            Loading hostel details...
          </p>
        </div>
      </div>
    );
  }

  /*
  ============================================================
  ERROR
  ============================================================
  */

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">

        <p className="text-red-500 text-lg">
          {error}
        </p>

        <button
          onClick={fetchHostel}
          className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg"
        >
          Try Again
        </button>

      </div>
    );
  }

  /*
  ============================================================
  NO DATA
  ============================================================
  */

  if (!hostel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Hostel not found
      </div>
    );
  }

  /*
  ============================================================
  DYNAMIC DATA
  ============================================================
  */

  const amenities = hostel.amenities || [];

  const reviews = hostel.reviews || [];

  const images = hostel.images || [];

  const displayedAmenities = showAllAmenities
    ? amenities
    : amenities.slice(0, 6);

  const displayedReviews = showAllReviews
    ? reviews
    : reviews.slice(0, 2);

  const totalAmount =
    Number(hostel.monthlyRent || 0) +
    Number(hostel.serviceFee || 0);

  const ratings = [
    {
      name: "Cleanliness",
      value: Number(
        hostel.cleanlinessRating || 0
      ),
    },
    {
      name: "Safety",
      value: Number(
        hostel.safetyRating || 0
      ),
    },
    {
      name: "Food Quality",
      value: Number(
        hostel.foodRating || 0
      ),
    },
  ];

  const averageRating =
    Number(hostel.averageRating || 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          <div className="flex items-center space-x-8">

            <span className="text-xl font-bold text-blue-600 tracking-tight">
              HostelHub
            </span>

            <nav className="hidden md:flex space-x-6 text-sm font-medium text-slate-600">

              <a
                href="/"
                className="hover:text-blue-600 transition-colors"
              >
                Home
              </a>

            </nav>

          </div>

          <button className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
            Hi, User
          </button>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* BREADCRUMB */}

        <nav className="flex items-center space-x-2 text-xs text-slate-500">

          <span className="text-slate-800 font-medium">
            {hostel.hostelName}
          </span>

        </nav>

        {/* =====================================================
            IMAGE GALLERY
        ===================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[420px] rounded-2xl overflow-hidden shadow-sm">

          <div className="lg:col-span-2 h-full relative group">

            <img
              src={
                images[0] ||
                "https://via.placeholder.com/1200x800?text=No+Image"
              }
              alt={hostel.hostelName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

          </div>

          <div className="hidden lg:grid grid-rows-2 gap-4 h-full">

            <div className="overflow-hidden">

              <img
                src={
                  images[1] ||
                  images[0] ||
                  "https://via.placeholder.com/800x400?text=No+Image"
                }
                alt="Hostel"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />

            </div>

            <div className="overflow-hidden relative">

              <img
                src={
                  images[2] ||
                  images[0] ||
                  "https://via.placeholder.com/800x400?text=No+Image"
                }
                alt="Hostel"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />

              <button className="absolute bottom-4 right-4 bg-white text-slate-800 text-xs font-semibold px-3 py-2 rounded-lg shadow-md">

                View all {images.length} photos

              </button>

            </div>

          </div>

        </section>

        {/* =====================================================
            HOSTEL HEADER
        ===================================================== */}

        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">

          <div>

            <div className="flex items-center space-x-3">

              <h1 className="text-2xl font-bold text-slate-900">

                {hostel.hostelName}

              </h1>

              {hostel.verified && (

                <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">

                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />

                  <span>Verified</span>

                </span>

              )}

            </div>

            {/* ADDRESS */}

            <div className="flex items-center space-x-2 text-sm text-slate-500 mt-2">

              <MapPin className="w-4 h-4 text-slate-400" />

              <span>
                {hostel.address || "Address not available"}
              </span>

            </div>

            {/* PRICE */}

            <div className="flex items-center space-x-3 mt-4">

              <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full border border-blue-100">

                <Tag className="w-3.5 h-3.5" />

                <span>
                  Rent: ₹{hostel.monthlyRent || 0}/month
                </span>

              </span>

              <span className="inline-flex items-center space-x-1 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1 rounded-full border border-slate-200">

                <ShieldCheck className="w-3.5 h-3.5" />

                <span>
                  Deposit: ₹{hostel.deposit || 0}
                </span>

              </span>

            </div>

          </div>

          {/* SHARE AND FAVORITE */}

          <div className="flex items-center space-x-2">

            <button
              onClick={handleShare}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100"
            >

              <Share2 className="w-4 h-4" />

            </button>

            <button
              onClick={handleFavorite}
              className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-100"
            >

              <Heart
                className={`w-4 h-4 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-slate-600"
                }`}
              />

            </button>

          </div>

        </section>

        {/* =====================================================
            CONTENT GRID
        ===================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}

          <div className="lg:col-span-2 space-y-8">

            {/* ABOUT */}

            <section>

              <h2 className="text-lg font-bold text-slate-900 mb-3">

                About this property

              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">

                {showFullDescription
                  ? hostel.description
                  : hostel.description?.length > 300
                  ? `${hostel.description.substring(
                      0,
                      300
                    )}...`
                  : hostel.description ||
                    "No description available"}

              </p>

              {hostel.description?.length > 300 && (

                <button
                  onClick={() =>
                    setShowFullDescription(
                      !showFullDescription
                    )
                  }
                  className="mt-2 text-sm font-medium text-blue-600 hover:underline flex items-center space-x-1"
                >

                  <span>

                    {showFullDescription
                      ? "Show less"
                      : "Read more"}

                  </span>

                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFullDescription
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

              )}

            </section>

            {/* =================================================
                AMENITIES
            ================================================= */}

            <section className="pt-6 border-t border-slate-200">

              <h2 className="text-lg font-bold text-slate-900 mb-4">

                What this place offers

              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm text-slate-700">

                {displayedAmenities.map(
                  (amenity, index) => {

                    const amenityType =
                      typeof amenity === "string"
                        ? amenity
                        : amenity.type;

                    const amenityName =
                      typeof amenity === "string"
                        ? amenity
                        : amenity.name;

                    const Icon =
                      amenityIcons[
                        amenityType?.toUpperCase()
                      ] || ShieldCheck;

                    return (
                      <div
                        key={index}
                        className="flex items-center space-x-3"
                      >

                        <Icon className="w-5 h-5 text-blue-600" />

                        <span>
                          {amenityName}
                        </span>

                      </div>
                    );
                  }
                )}

              </div>

              {amenities.length > 6 && (

                <button
                  onClick={() =>
                    setShowAllAmenities(
                      !showAllAmenities
                    )
                  }
                  className="mt-6 border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs px-4 py-2.5 rounded-lg"
                >

                  {showAllAmenities
                    ? "Show less"
                    : `Show all ${amenities.length} amenities`}

                </button>

              )}

            </section>

            {/* =================================================
                RATINGS
            ================================================= */}

            <section className="p-6 bg-slate-100/70 rounded-2xl border border-slate-200/60">

              <h2 className="text-sm font-semibold text-slate-800 mb-4">

                Performance Ratings

              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">

                {ratings.map((rating) => (

                  <div key={rating.name}>

                    <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5 font-medium">

                      <span>
                        {rating.name}
                      </span>

                      <span className="font-bold text-slate-800">

                        {rating.value.toFixed(1)}

                      </span>

                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">

                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{
                          width: `${Math.min(
                            rating.value * 20,
                            100
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                ))}

              </div>

            </section>

            {/* =================================================
                REVIEWS
            ================================================= */}

            <section className="pt-6 border-t border-slate-200">

              <div className="flex items-center justify-between mb-6">

                <h2 className="text-lg font-bold text-slate-900">

                  Verified Reviews

                </h2>

                <div className="flex items-center space-x-1 text-sm font-semibold text-slate-800">

                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />

                  <span>
                    {averageRating.toFixed(1)}
                  </span>

                  <span className="text-slate-400 font-normal text-xs">

                    ({reviews.length} reviews)

                  </span>

                </div>

              </div>

              {displayedReviews.length === 0 ? (

                <p className="text-sm text-slate-500">

                  No reviews available yet.

                </p>

              ) : (

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {displayedReviews.map(
                    (review, index) => (

                      <div
                        key={review.id || index}
                        className="p-4 bg-white border border-slate-200 rounded-xl space-y-3"
                      >

                        <div className="flex items-center space-x-3">

                          <img
                            src={
                              review.userImage ||
                              "https://via.placeholder.com/100"
                            }
                            alt={
                              review.userName || "User"
                            }
                            className="w-10 h-10 rounded-full object-cover"
                          />

                          <div>

                            <h4 className="text-xs font-bold text-slate-900">

                              {review.userName || "Anonymous"}

                            </h4>

                            <p className="text-[11px] text-slate-400">

                              {review.createdAt ||
                                "Recently"}

                            </p>

                          </div>

                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">

                          "
                          {review.comment ||
                            "No review comment"}
                          "

                        </p>

                      </div>

                    )
                  )}

                </div>

              )}

              {reviews.length > 2 && (

                <button
                  onClick={() =>
                    setShowAllReviews(
                      !showAllReviews
                    )
                  }
                  className="mt-4 text-xs font-semibold text-blue-600 hover:underline"
                >

                  {showAllReviews
                    ? "Show less"
                    : "Show more reviews"}

                </button>

              )}

            </section>

            {/* =================================================
                HOUSE RULES
            ================================================= */}

            <section className="pt-6 border-t border-slate-200">

              <h2 className="text-lg font-bold text-slate-900 mb-4">

                House Rules

              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-xs text-slate-600">

                <div className="flex items-start space-x-3">

                  <Clock className="w-4 h-4 text-slate-400 mt-0.5" />

                  <div>

                    <span className="font-semibold text-slate-800 block">

                      Check-in

                    </span>

                    <span>

                      {hostel.rules?.checkIn ||
                        "Not specified"}

                    </span>

                  </div>

                </div>

                <div className="flex items-start space-x-3">

                  <LogOut className="w-4 h-4 text-slate-400 mt-0.5" />

                  <div>

                    <span className="font-semibold text-slate-800 block">

                      Check-out

                    </span>

                    <span>

                      {hostel.rules?.checkOut ||
                        "Not specified"}

                    </span>

                  </div>

                </div>

                <div className="flex items-start space-x-3">

                  <Volume2 className="w-4 h-4 text-slate-400 mt-0.5" />

                  <div>

                    <span className="font-semibold text-slate-800 block">

                      Quiet Hours

                    </span>

                    <span>

                      {hostel.rules?.quietHours ||
                        "Not specified"}

                    </span>

                  </div>

                </div>

                <div className="flex items-start space-x-3">

                  <CigaretteOff className="w-4 h-4 text-red-500 mt-0.5" />

                  <div>

                    <span className="font-semibold text-red-600 block">

                      Smoking

                    </span>

                    <span className="text-red-500 font-medium">

                      {hostel.rules?.smokingAllowed
                        ? "Allowed"
                        : "Not Allowed"}

                    </span>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                LOCATION
            ================================================= */}

            <section className="pt-6 border-t border-slate-200">

              <h2 className="text-lg font-bold text-slate-900 mb-4">

                Location & Neighborhood

              </h2>

              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-72">

                <iframe
                  title="Hostel Location"
                  width="100%"
                  height="100%"
                  className="border-0"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(
                    hostel.address || ""
                  )}&output=embed`}
                />

              </div>

            </section>

          </div>

          {/* =====================================================
              RIGHT BOOKING CARD
          ===================================================== */}

          <div className="lg:col-span-1">

            <div className="sticky top-24 space-y-4">

              <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-lg space-y-6">

                <div className="flex justify-between items-baseline">

                  <div>

                    <span className="text-2xl font-bold text-slate-900">

                      ₹{hostel.monthlyRent || 0}

                    </span>

                    <span className="text-xs text-slate-500">

                      {" "} / month

                    </span>

                  </div>

                  <span className="inline-flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">

                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>

                    <span>

                      {hostel.available
                        ? "Available"
                        : "Not Available"}

                    </span>

                  </span>

                </div>

                {/* BOOKING FORM */}

                <div className="space-y-3">

                  <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded-xl p-2 bg-slate-50">

                    <div>

                      <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">

                        Visit Date

                      </label>

                      <input
                        type="date"
                        value={checkInDate}
                        min={
                          new Date()
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) =>
                          setCheckInDate(
                            e.target.value
                          )
                        }
                        className="text-xs font-semibold text-slate-700 bg-transparent outline-none w-full"
                      />

                    </div>

                    <div className="border-l border-slate-200 pl-2">

                      <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">

                        Duration

                      </label>

                      <select
                        value={duration}
                        onChange={(e) =>
                          setDuration(
                            Number(e.target.value)
                          )
                        }
                        className="text-xs font-semibold text-slate-700 bg-transparent outline-none w-full"
                      >

                        <option value="1">
                          1 Month
                        </option>

                        <option value="3">
                          3 Months
                        </option>

                        <option value="6">
                          6 Months
                        </option>

                        <option value="12">
                          12 Months
                        </option>

                      </select>

                    </div>

                  </div>

                  <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50">

                    <label className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block">

                      Tenants

                    </label>

                    <select
                      value={tenants}
                      onChange={(e) =>
                        setTenants(
                          Number(e.target.value)
                        )
                      }
                      className="text-xs font-semibold text-slate-700 bg-transparent outline-none w-full"
                    >

                      <option value="1">
                        1 Adult
                      </option>

                      <option value="2">
                        2 Adults
                      </option>

                      <option value="3">
                        3 Adults
                      </option>

                      <option value="4">
                        4 Adults
                      </option>

                    </select>

                  </div>

                </div>

                {/* BUTTONS */}

                <div className="space-y-2.5">

                  <button
                    onClick={handleScheduleVisit}
                    disabled={!hostel.available}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 px-4 rounded-xl"
                  >

                    Schedule Visit

                  </button>

                  <button
                    onClick={handleContactProperty}
                    className="w-full bg-white hover:bg-slate-50 text-blue-600 border border-blue-600 font-semibold py-3 px-4 rounded-xl"
                  >

                    Contact Property

                  </button>

                </div>

                <p className="text-[11px] text-slate-400 text-center">

                  You won't be charged yet. This is for an initial inquiry only.

                </p>

                {/* PRICE SUMMARY */}

                <div className="border-t border-slate-100 pt-4 space-y-2 text-xs text-slate-600">

                  <div className="flex justify-between">

                    <span>
                      Monthly Rent
                    </span>

                    <span className="font-semibold text-slate-800">

                      ₹{hostel.monthlyRent || 0}

                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span>
                      Service Fee
                    </span>

                    <span className="font-semibold text-slate-800">

                      ₹{hostel.serviceFee || 0}

                    </span>

                  </div>

                  <div className="flex justify-between font-bold text-slate-900 pt-2 border-t border-slate-100 text-sm">

                    <span>
                      Total (Est. Monthly)
                    </span>

                    <span>
                      ₹{totalAmount}
                    </span>

                  </div>

                </div>

              </div>

              {/* VERIFIED */}

              {hostel.verified && (

                <div className="p-3.5 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center space-x-2 text-xs font-semibold text-slate-700">

                  <ShieldCheck className="w-4 h-4 text-amber-500" />

                  <span>
                    Identity Verified Hostel
                  </span>

                </div>

              )}

            </div>

          </div>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="mt-16 bg-white border-t border-slate-200 py-6 text-xs text-slate-500">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">

          <div className="flex items-center space-x-6">

            <span className="font-bold text-blue-600 text-sm">
              HostelHub
            </span>

            <a href="/">
              Home
            </a>

            <a href="#">
              Privacy Policy
            </a>

            <a href="#">
              Terms of Service
            </a>

          </div>

          <div>
            © 2026 HostelHub. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  );
}

export default HostelDetails;