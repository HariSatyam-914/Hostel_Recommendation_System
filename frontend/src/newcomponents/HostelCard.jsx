import React from "react";
import { Link } from "react-router-dom";

const HostelCard = ({ hostel, onDetailsClick }) => {

  return (
    <article className="group overflow-hidden rounded-2xl border border-blue-100/80 bg-white shadow-lg shadow-blue-500/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/15">

      {/* Image */}

      <div className="relative h-52 overflow-hidden">

        <img
          src={hostel.image}
          alt={hostel.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
        />

        {/* Dark image overlay */}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />


        {/* Rating */}

        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1.5 text-sm font-bold shadow-lg">

          <span className="text-yellow-500">
            ★
          </span>

          <span className="text-slate-700">
            {hostel.rating}
          </span>

        </div>


        {/* Match percentage */}

        {hostel.match && (
          <div className="absolute bottom-3 left-3 rounded-full bg-blue-600/95 px-3 py-1.5 text-xs font-bold text-white shadow-lg">

            {hostel.match}% Match

          </div>
        )}

      </div>


      {/* Content */}

      <div className="p-5">

        {/* Name + Price */}

        <div className="flex items-start justify-between gap-3">

          <h3 className="text-lg font-bold text-slate-800">
            {hostel.name}
          </h3>

          <div className="shrink-0 text-right">

            <span className="text-lg font-extrabold text-blue-600">
              ₹{hostel.price}
            </span>

            <p className="text-[11px] text-slate-400">
              per month
            </p>

          </div>

        </div>


        {/* Location */}

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">

          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 shrink-0 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21s7-4.35 7-10a7 7 0 1 0-14 0c0 5.65 7 10 7 10Z"
            />

            <circle
              cx="12"
              cy="11"
              r="2"
            />

          </svg>

          <span>
            {hostel.location}
          </span>

        </div>


        {/* Amenities */}

        <div className="mt-4 flex flex-wrap gap-2">

          {hostel.amenities?.map((amenity, index) => (

            <span
              key={index}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700"
            >
              {amenity}
            </span>

          ))}

        </div>


        {/* Details Button */}

        <Link
          // to="/hosteldetails/${hostel.id}"
          to={`/hosteldetails/${hostel.id}`}
          className="inline-block mt-5 w-3xs rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98]"
        >
          View Details
        </Link>

      </div>

    </article>
  );
};

export default HostelCard;