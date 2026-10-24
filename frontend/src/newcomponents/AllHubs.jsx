import React from "react";
import { Link } from "react-router-dom";
const hubs = [
  {
    name: "Hyderabad",
    state: "Telangana",
    place: "Charminar",
    image:
      "https://staybook.in/_next/image?q=100&url=https%3A%2F%2Fimages.staybook.in%2Fthings-to-do%2Fcharminar-fast-entry-pass-flexible-timings%2F5.jpg&w=1920",
  },

  {
    name: "Bengaluru",
    state: "Karnataka",
    place: "Vidhana Soudha",
    image:
      "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80",
  },

  {
    name: "Mumbai",
    state: "Maharashtra",
    place: "Gateway of India",
    image:
      "https://s1.dmcdn.net/v/K9ZjU1P5FwdYQgNEc/x1080",
  },

  {
    name: "Kolkata",
    state: "West Bengal",
    place: "Victoria Memorial",
    image:
      "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
  },

  {
    name: "Jaipur",
    state: "Rajasthan",
    place: "Hawa Mahal",
    image:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=80",
  },

  {
    name: "Chennai",
    state: "Tamil Nadu",
    place: "Marina Beach",
    image:
      "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
  },

  {
    name: "Ahmedabad",
    state: "Gujarat",
    place: "Sabarmati Ashram",
    image:
      "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=80",
  },

  {
    name: "Agra",
    state: "Uttar Pradesh",
    place: "Taj Mahal",
    image:
      "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80",
  },
];

const AllHubs = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br  from-blue-100 via-blue-100 to-cyan-100 px-4 py-12 sm:px-6 lg:px-8">

      {/* Page Header */}

      <div className="mx-auto max-w-7xl">

        <div className="mb-12 text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">
            Explore India
          </p>

          <h1 className="mt-3 text-4xl font-extrabold text-slate-900 sm:text-5xl">
            Explore Hostels by Cities
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            Discover hostels across major cities in every state of India.
            Choose a city to explore available hostels.
          </p>

        </div>


        {/* Cities */}

        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">

          {hubs.map((hub) => (

            <Link
              key={hub.name}
              to={`/search?city=${encodeURIComponent(hub.name)}`}
              className="group flex flex-col items-center"
            >

              {/* Circle */}

              <div
                className="
                  relative
                  h-28
                  w-28
                  overflow-hidden
                  rounded-full
                  border-4
                  border-white
                  shadow-xl
                  shadow-blue-950/30
                  transition
                  duration-300
                  group-hover:scale-110
                  group-hover:border-blue-400
                  sm:h-32
                  sm:w-32
                "
              >

                <img
                  src={hub.image}
                  alt={hub.place}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition
                    duration-500
                    group-hover:scale-110
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-blue-950/30
                    transition
                    group-hover:bg-blue-950/10
                  "
                />

              </div>


              {/* City */}

              <h3
                className="
                  mt-4
                  text-sm
                  font-bold
                  text-amber-700
                  transition
                  group-hover:text-blue-700
                "
              >
                {hub.name}
              </h3>


              {/* State */}

              <p className="mt-1 text-xs text-slate-500">
                {hub.state}
              </p>

            </Link>

          ))}

        </div>

      </div>

    </div>
  );
};

export default AllHubs;