import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  Star,
  MapPin,
  Wifi,
  Utensils,
  Car,
  Dumbbell,
  WashingMachine,
  Snowflake,
  Droplets,
  LockKeyhole,
  CheckCircle2,
  Phone,
} from "lucide-react";

import { hostels } from "../data/hostels";


const HostelDetails = () => {

  // Get hostel ID from URL
  // Example: /hostels/3 → id = "3"

  const { id } = useParams();


  // Find the hostel with the matching ID

  const hostel = hostels.find(
    (item) => item.id === Number(id)
  );


  // If hostel doesn't exist

  if (!hostel) {

    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 px-4 py-20">

        <div className="mx-auto max-w-xl rounded-3xl border border-blue-100 bg-white p-10 text-center shadow-xl">

          <h1 className="text-2xl font-bold text-slate-900">
            Hostel Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            The hostel you are looking for does not exist.
          </p>

          <Link
            to="/search"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft size={18} />
            Back to Search
          </Link>

        </div>

      </div>
    );
  }


  // =========================================================
  // AMENITY ICONS
  // =========================================================

  const amenityIcons = {

    "Wi-Fi": <Wifi size={20} />,

    "Food": <Utensils size={20} />,

    "Parking": <Car size={20} />,

    "Gym": <Dumbbell size={20} />,

    "Laundry": <WashingMachine size={20} />,

    "AC": <Snowflake size={20} />,

    "Hot Water": <Droplets size={20} />,

    "Locker": <LockKeyhole size={20} />,
  };


  return (

    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 px-4 pb-16 pt-8 sm:px-6 lg:px-8">

      <main className="mx-auto max-w-7xl">


        {/* =====================================================
            BACK TO SEARCH
        ===================================================== */}

        <Link
          to="/search"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-800"
        >
          <ArrowLeft size={18} />

          Back to Search
        </Link>


        {/* =====================================================
            MAIN HOSTEL CARD
        ===================================================== */}

        <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-900/10">


          {/* =====================================================
              IMAGE + BASIC DETAILS
          ===================================================== */}

          <div className="grid lg:grid-cols-2">


            {/* =================================================
                HOSTEL IMAGE
            ================================================= */}

            <div className="relative h-[320px] sm:h-[420px] lg:h-[520px]">

              <img
                src={hostel.image}
                alt={hostel.name}
                className="h-full w-full object-cover"
              />


              {/* Image overlay */}

              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/70 via-blue-950/10 to-transparent" />


              {/* Match percentage */}

              <div className="absolute left-6 top-6 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg">

                {hostel.match}% Match

              </div>


              {/* Rating */}

              <div className="absolute bottom-6 left-6 flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 shadow-lg backdrop-blur">

                <Star
                  size={18}
                  className="fill-amber-400 text-amber-400"
                />

                <span className="font-bold text-slate-800">
                  {hostel.rating}
                </span>

                <span className="text-sm text-slate-500">
                  Rating
                </span>

              </div>

            </div>


            {/* =================================================
                BASIC INFORMATION
            ================================================= */}

            <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">


              {/* Small heading */}

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Hostel Details
              </p>


              {/* Hostel name */}

              <h1 className="mt-3 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">

                {hostel.name}

              </h1>


              {/* Location */}

              <div className="mt-6 flex items-start gap-3">

                <MapPin
                  size={22}
                  className="mt-1 shrink-0 text-blue-600"
                />

                <div>

                  <p className="font-semibold text-slate-800">
                    {hostel.location}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Hyderabad, Telangana
                  </p>

                </div>

              </div>


              {/* Room type */}

              <div className="mt-6">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Room Type
                </p>

                <div className="mt-2 inline-flex rounded-xl bg-blue-50 px-4 py-2">

                  <span className="text-sm font-bold text-blue-700">
                    {hostel.roomType}
                  </span>

                </div>

              </div>


              {/* Price */}

              <div className="mt-7">

                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Monthly Rent
                </p>

                <div className="mt-1 flex items-baseline gap-2">

                  <span className="text-3xl font-extrabold text-blue-700">
                    ₹{hostel.price.toLocaleString("en-IN")}
                  </span>

                  <span className="text-sm text-slate-500">
                    / month
                  </span>

                </div>

              </div>


              {/* Buttons */}

              <div className="mt-8 flex flex-wrap gap-3">

                <button
                  className="
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-blue-600
                    to-cyan-500
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-blue-500/20
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-blue-500/40
                  "
                >

                  <Phone size={18} />

                  Contact Hostel

                </button>


                <Link
                  to="/search"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-blue-200
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-blue-600
                    transition
                    hover:bg-blue-50
                  "
                >
                  Back to Results
                </Link>

              </div>

            </div>

          </div>


          {/* =====================================================
              AMENITIES
          ===================================================== */}

          <section className="border-t border-slate-100 px-6 py-8 sm:px-10 lg:px-12">

            <div className="mb-6">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Amenities
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                Facilities Available
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Everything available at this hostel.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">

              {hostel.amenities.map((amenity) => (

                <div
                  key={amenity}
                  className="
                    flex
                    items-center
                    gap-3
                    rounded-xl
                    border
                    border-blue-100
                    bg-blue-50/70
                    px-4
                    py-4
                    text-sm
                    font-semibold
                    text-slate-700
                    transition
                    hover:-translate-y-1
                    hover:border-blue-200
                    hover:bg-blue-50
                  "
                >

                  {/* Icon */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white
                      text-blue-600
                      shadow-sm
                    "
                  >

                    {amenityIcons[amenity] || (
                      <CheckCircle2 size={20} />
                    )}

                  </div>


                  {/* Amenity name */}

                  <span>
                    {amenity}
                  </span>

                </div>

              ))}

            </div>

          </section>


          {/* =====================================================
              HOSTEL SUMMARY
          ===================================================== */}

          <section className="border-t border-slate-100 bg-gradient-to-br from-blue-50/70 to-white px-6 py-8 sm:px-10 lg:px-12">

            <div className="mb-6">

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                Overview
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-900">
                Hostel Information
              </h2>

            </div>


            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


              {/* Location */}

              <div className="rounded-2xl border border-blue-100 bg-white p-5">

                <MapPin
                  size={22}
                  className="text-blue-600"
                />

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Location
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {hostel.location}
                </p>

              </div>


              {/* Room */}

              <div className="rounded-2xl border border-blue-100 bg-white p-5">

                <CheckCircle2
                  size={22}
                  className="text-blue-600"
                />

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Room Type
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {hostel.roomType}
                </p>

              </div>


              {/* Rent */}

              <div className="rounded-2xl border border-blue-100 bg-white p-5">

                <p className="text-2xl font-extrabold text-blue-600">
                  ₹{hostel.price.toLocaleString("en-IN")}
                </p>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Monthly Rent
                </p>

              </div>


              {/* Match */}

              <div className="rounded-2xl border border-blue-100 bg-white p-5">

                <p className="text-2xl font-extrabold text-green-600">
                  {hostel.match}%
                </p>

                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Requirement Match
                </p>

              </div>

            </div>

          </section>


          {/* =====================================================
              BOTTOM CONTACT SECTION
          ===================================================== */}

          <div className="flex flex-col gap-4 border-t border-slate-100 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-10 lg:px-12">

            <div>

              <p className="text-sm font-semibold text-slate-800">
                Interested in {hostel.name}?
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Contact the hostel to check availability and booking details.
              </p>

            </div>


            <button
              className="
                rounded-xl
                bg-blue-600
                px-7
                py-3
                text-sm
                font-bold
                text-white
                shadow-lg
                shadow-blue-500/20
                transition
                hover:bg-blue-700
              "
            >
              Contact Now
            </button>

          </div>

        </div>

      </main>

    </div>
  );
};

export default HostelDetails;