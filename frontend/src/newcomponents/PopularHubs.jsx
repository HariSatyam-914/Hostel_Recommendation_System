import React from "react";
import { Link } from "react-router-dom";
const hubs = [
  {
    name: "Hyderabad",
    image:
      "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Bangalore",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Chennai",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Pune",
    image:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=500&q=80",
  },
];

const PopularHubs = () => {
  return (
    <div className="text-center">

      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-700">
          Discover
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl bg-gradient-to-r
    from-blue-600
    to-cyan-300
    bg-clip-text
    text-transparent">
          Popular Hostel Hubs
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-600">
          Explore popular areas where students and working professionals
          commonly look for hostels.
        </p>
      </div>

      {/* Hub Cards */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">

        {hubs.map((hub) => (
          <Link
            key={hub.name}
            to={`/search?city=${encodeURIComponent(hub.name)}`}
            className="group flex flex-col items-center"
          >

            {/* Circle */}
            <div className="relative h-28 w-28 overflow-hidden rounded-full border-4  shadow-xl shadow-blue-950/30 transition duration-300 group-hover:scale-110 group-hover:border-blue-400 sm:h-32 sm:w-32">

              <img
                src={hub.image}
                alt={hub.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-blue-950/30 transition group-hover:bg-blue-950/10"></div>

            </div>

            <h3 className="mt-4 text-sm font-bold text-amber-700 transition group-hover:text-black">
              {hub.name}
            </h3>

          </Link>
        ))}

      </div>

      <Link to="/allhubs" className=" inline-block mt-8 rounded-xl border px-6 py-2.5 text-sm font-medium text-gray-600 backdrop-blur-sm transition-all
    duration-300
    hover:shadow-lg
    hover:-translate-y-1">
        View All Hubs →
      </Link>

    </div>
  );
};

export default PopularHubs;