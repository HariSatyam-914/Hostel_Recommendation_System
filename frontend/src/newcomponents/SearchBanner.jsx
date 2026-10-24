// import React, { useState } from "react";

// const SearchBanner = ({ onSearch }) => {
//   const [searchText, setSearchText] = useState("");

//   const handleSearch = () => {
//     onSearch?.(searchText);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter") {
//       handleSearch();
//     }
//   };

//   return (
//     <section className="relative mx-auto w-full max-w-7xl overflow-hidden rounded-[2rem] shadow-2xl shadow-blue-900/20">

//       {/* =====================================================
//           BACKGROUND IMAGE
//       ===================================================== */}

//       <img
//         src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1800&q=85"
//         alt="Hostel interior"
//         className="absolute inset-0 h-full w-full object-cover"
//       />

//       {/* =====================================================
//           BLUE OVERLAY
//       ===================================================== */}

//       <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-blue-700/45" />

//       {/* =====================================================
//           CONTENT
//       ===================================================== */}

//       <div className="relative z-10 flex min-h-[430px] flex-col items-center justify-center px-5 py-16 text-center sm:px-10 lg:min-h-[480px]">

//         {/* Small label */}

//         <div className="mb-5 rounded-full border border-white/30 bg-white/10 px-5 py-2 backdrop-blur-md">

//           <span className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-100">
//             Hostel Recommendation System
//           </span>

//         </div>


//         {/* Main Heading */}

//         <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">

//           Find Your
//           <span className="text-blue-200"> Perfect Hostel</span>

//         </h1>


//         {/* Description */}

//         <p className="mt-5 max-w-2xl text-sm leading-7 text-blue-50 sm:text-base">

//           Search for hostels based on your location,
//           preferences and requirements.

//         </p>


//         {/* =================================================
//             SEARCH BAR
//         ================================================= */}

//         <div className="mt-8 w-full max-w-3xl">

//           <div className="relative">

//             {/* Search Icon */}

//             <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-blue-500">

//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 sm:h-6 sm:w-6"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
//                 />
//               </svg>

//             </div>


//             {/* Input */}

//             <input
//               type="text"
//               value={searchText}
//               onChange={(e) => setSearchText(e.target.value)}
//               onKeyDown={handleKeyDown}
//               placeholder="Search by city, area or landmark..."
//               className="w-full rounded-2xl border border-white/50 bg-white py-4 pl-14 pr-32 text-sm text-slate-800 shadow-2xl outline-none placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-300/30 sm:py-5 sm:text-base"
//             />


//             {/* Search Button */}

//             <button
//               onClick={handleSearch}
//               className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-95 sm:px-7"
//             >
//               Search
//             </button>

//           </div>

//         </div>


//         {/* Small hint */}

//         <p className="mt-4 text-xs text-blue-100/80">

//           Try searching for "Hyderabad", "KPHB" or "Madhapur"

//         </p>

//       </div>

//     </section>
//   );
// };

// export default SearchBanner;



// new banner
import React, { useState } from "react";

const SearchBanner = ({ onSearch, searched }) => {

  const [searchText, setSearchText] = useState("");


  const handleSubmit = (e) => {
    e.preventDefault();

    onSearch(searchText);
  };


  return (
    <>

      {/* =====================================================
          BEFORE SEARCH
      ===================================================== */}

      {!searched && (

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-8 py-16 shadow-2xl shadow-blue-500/20 sm:px-12">

          {/* Background decoration */}

          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />


          <div className="relative z-10 mx-auto max-w-4xl text-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
              Find Your Perfect Stay
            </p>

            <h1 className="text-3xl font-extrabold text-white sm:text-5xl">
              Search for your ideal hostel
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
              Find hostels based on location, price,
              amenities and your personal requirements.
            </p>


            {/* Search bar */}

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white/10 p-2 backdrop-blur-md sm:flex-row"
            >

              <div className="flex flex-1 items-center rounded-xl bg-white px-4">

                <svg
                  className="mr-3 h-5 w-5 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
                  />
                </svg>

                <input
                  type="text"
                  value={searchText}
                  onChange={(e) =>
                    setSearchText(e.target.value)
                  }
                  placeholder="Search by hostel, location..."
                  className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />

              </div>


              <button
                type="submit"
                className="rounded-xl bg-blue-700 px-8 py-3 font-bold text-white transition hover:bg-blue-800 active:scale-95"
              >
                Search
              </button>

            </form>

          </div>

        </section>

      )}


      {/* =====================================================
          AFTER SEARCH
      ===================================================== */}

      {searched && (

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex max-w-5xl gap-3 rounded-2xl border border-blue-100 bg-white p-2 shadow-lg shadow-blue-500/10"
        >

          <div className="flex flex-1 items-center px-4">

            <svg
              className="mr-3 h-5 w-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-4.35-4.35m2.35-5.65a8 8 0 11-16 0 8 8 0 0116 0z"
              />
            </svg>

            <input
              type="text"
              value={searchText}
              onChange={(e) =>
                setSearchText(e.target.value)
              }
              placeholder="Search hostels..."
              className="w-full bg-transparent py-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />

          </div>


          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white transition hover:bg-blue-700 active:scale-95"
          >
            Search
          </button>

        </form>

      )}

    </>
  );
};

export default SearchBanner;