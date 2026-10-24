// import React, { useState } from "react";

// import FilterPanel from "./FilterPanel";
// import SearchBanner from "./SearchBanner";
// import HostelCard from "./HostelCard";


// const NewSearch = () => {

//   // =====================================================
//   // SEARCH STATE
//   // =====================================================

//   const [searchResults, setSearchResults] = useState([]);

//   const [visibleCount, setVisibleCount] = useState(3);


//   // =====================================================
//   // SEARCH STATUS
//   // =====================================================

//   // IMPORTANT:
//   // false = user hasn't searched yet
//   // true  = search results have been displayed

//   const [hasSearched, setHasSearched] = useState(false);


//   // =====================================================
//   // FILTER PANEL STATUS
//   // =====================================================

//   // Controls whether the left panel is open

//   const [showFilters, setShowFilters] = useState(false);


//   // =====================================================
//   // APPLIED FILTERS
//   // =====================================================

//   // These filters actually affect the results

//   const [appliedFilters, setAppliedFilters] = useState({
//     minPrice: "",
//     maxPrice: "",
//     amenities: [],
//     roomType: "",
//   });


//   // =====================================================
//   // HOSTEL DATA
//   // =====================================================

//   const hostels = [
//     {
//       id: 1,
//       name: "Sunshine Hostel",
//       price: 6500,
//       rating: 4.7,
//       match: 92,
//       location: "KPHB, Hyderabad",
//       roomType: "Single",

//       image:
//         "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=85",

//       amenities: [
//         "Wi-Fi",
//         "Food",
//         "Parking",
//       ],
//     },

//     {
//       id: 2,
//       name: "Blue Ridge Stay",
//       price: 7200,
//       rating: 4.5,
//       match: 87,
//       location: "Madhapur, Hyderabad",
//       roomType: "Double",

//       image:
//         "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85",

//       amenities: [
//         "Wi-Fi",
//         "AC",
//         "Gym",
//       ],
//     },

//     {
//       id: 3,
//       name: "Metro Co-Live",
//       price: 8000,
//       rating: 4.8,
//       match: 95,
//       location: "Kondapur, Hyderabad",
//       roomType: "Single",

//       image:
//         "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85",

//       amenities: [
//         "Wi-Fi",
//         "Food",
//         "Laundry",
//       ],
//     },

//     {
//       id: 4,
//       name: "Green View Hostel",
//       price: 6800,
//       rating: 4.6,
//       match: 89,
//       location: "Gachibowli, Hyderabad",
//       roomType: "Triple",

//       image:
//         "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=85",

//       amenities: [
//         "Wi-Fi",
//         "Parking",
//         "Locker",
//       ],
//     },

//     {
//       id: 5,
//       name: "Urban Nest",
//       price: 7500,
//       rating: 4.4,
//       match: 84,
//       location: "Hitech City, Hyderabad",
//       roomType: "Double",

//       image:
//         "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=85",

//       amenities: [
//         "Wi-Fi",
//         "Food",
//         "AC",
//       ],
//     },

//     {
//       id: 6,
//       name: "Comfort Stay",
//       price: 6200,
//       rating: 4.3,
//       match: 81,
//       location: "Kukatpally, Hyderabad",
//       roomType: "Shared",

//       image:
//         "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=85",

//       amenities: [
//         "Wi-Fi",
//         "Hot Water",
//         "Parking",
//       ],
//     },
//   ];


//   // =====================================================
//   // SEARCH
//   // =====================================================

//   const handleSearch = (searchText) => {

//     const search = searchText.trim().toLowerCase();


//     let results;


//     // Empty search = show all hostels

//     if (!search) {

//       results = hostels;

//     } else {

//       results = hostels.filter((hostel) =>

//         hostel.name.toLowerCase().includes(search) ||

//         hostel.location.toLowerCase().includes(search)

//       );

//     }


//     // Display search results

//     setSearchResults(results);

//     setVisibleCount(3);


//     // VERY IMPORTANT
//     // Only now do we allow filters to appear

//     setHasSearched(true);


//     // Keep filter panel closed initially

//     setShowFilters(false);

//   };


//   // =====================================================
//   // APPLY FILTERS
//   // =====================================================

//   const handleApplyFilters = (filters) => {

//     // Save filters

//     setAppliedFilters(filters);


//     // Start with the current search results

//     let filtered = [...searchResults];


//     // ---------------------------------------------------
//     // PRICE FILTER
//     // ---------------------------------------------------

//     if (filters.minPrice) {

//       filtered = filtered.filter(
//         (hostel) =>
//           hostel.price >= Number(filters.minPrice)
//       );

//     }


//     if (filters.maxPrice) {

//       filtered = filtered.filter(
//         (hostel) =>
//           hostel.price <= Number(filters.maxPrice)
//       );

//     }


//     // ---------------------------------------------------
//     // AMENITY FILTER
//     // ---------------------------------------------------

//     if (filters.amenities.length > 0) {

//       filtered = filtered.filter((hostel) =>

//         filters.amenities.every((requiredAmenity) =>

//           hostel.amenities.includes(requiredAmenity)

//         )

//       );

//     }


//     // ---------------------------------------------------
//     // ROOM TYPE FILTER
//     // ---------------------------------------------------

//     if (filters.roomType) {

//       filtered = filtered.filter(
//         (hostel) =>
//           hostel.roomType === filters.roomType
//       );

//     }


//     // ---------------------------------------------------
//     // UPDATE RESULTS
//     // ---------------------------------------------------

//     setSearchResults(filtered);

//     setVisibleCount(3);


//     // Close panel after Apply

//     setShowFilters(false);

//   };


//   // =====================================================
//   // MORE BUTTON
//   // =====================================================

//   const handleMore = () => {

//     setVisibleCount(
//       (previous) => previous + 3
//     );

//   };


//   // =====================================================
//   // HOSTEL DETAILS
//   // =====================================================

//   const handleDetailsClick = (hostel) => {

//     console.log("Selected hostel:", hostel);

//   };


//   // =====================================================
//   // VISIBLE HOSTELS
//   // =====================================================

//   const visibleHostels = searchResults.slice(
//     0,
//     visibleCount
//   );


//   return (

//     <div className="min-h-screen overflow-hidden bg-gradient-to-br from-white via-blue-50 to-blue-200">

//       <main className="mx-auto max-w-7xl px-5 pb-20 pt-28 sm:px-8 lg:px-10">


//         {/* =================================================
//             SEARCH BANNER
//         ================================================= */}

//         <SearchBanner
//           onSearch={handleSearch}
//         />


//         {/* =================================================
//             SEARCH RESULTS SECTION
//         ================================================= */}

//         <section className="mt-20">


//           {/* =================================================
//               HEADER
//           ================================================= */}

//           <div className="mb-8 flex flex-wrap items-center justify-between gap-4">


//             <div>

//               <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
//                 Recommended
//               </p>

//               <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
//                 Hostels Near You
//               </h2>

//               <p className="mt-2 text-sm text-slate-500">
//                 Explore hostels that may be a good match for you.
//               </p>

//             </div>


//             {/* =================================================
//                 FILTER BUTTON

//                 IMPORTANT:
//                 This button does NOT appear before search.
//             ================================================= */}

//             {hasSearched && (

//               <button
//                 onClick={() =>
//                   setShowFilters((previous) => !previous)
//                 }
//                 className="flex items-center gap-2 rounded-xl border-2 border-blue-600 bg-white px-5 py-3 text-sm font-bold text-blue-600 shadow-md transition hover:bg-blue-600 hover:text-white active:scale-95"
//               >

//                 {/* Filter icon */}

//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M3 5h18M6 12h12M10 19h4"
//                   />
//                 </svg>

//                 {showFilters
//                   ? "Hide Filters"
//                   : "Filters"}

//               </button>

//             )}

//           </div>


//           {/* =================================================
//               FILTER + RESULTS LAYOUT
//           ================================================= */}

//           <div className="flex flex-col gap-7 lg:flex-row lg:items-start">


//             {/* =================================================
//                 LEFT FILTER PANEL

//                 IMPORTANT:
//                 This can ONLY render when:
                
//                 hasSearched === true
//                 AND
//                 showFilters === true
//             ================================================= */}

//             {hasSearched && showFilters && (

//               <FilterPanel
//                 onApply={handleApplyFilters}
//                 onClose={() => setShowFilters(false)}
//               />

//             )}


//             {/* =================================================
//                 HOSTEL RESULTS
//             ================================================= */}

//             <div className="min-w-0 flex-1">


//               {visibleHostels.length > 0 ? (

//                 <div className="grid grid-cols-1 gap-7 md:grid-cols-2">

//                   {visibleHostels.map((hostel) => (

//                     <HostelCard
//                       key={hostel.id}
//                       hostel={hostel}
//                       onDetailsClick={handleDetailsClick}
//                     />

//                   ))}

//                 </div>

//               ) : (

//                 <div className="rounded-2xl border border-blue-100 bg-white/70 p-12 text-center shadow-lg backdrop-blur-md">

//                   <div className="text-4xl">
//                     🔍
//                   </div>

//                   <h3 className="mt-4 text-lg font-bold text-slate-700">
//                     No hostels found
//                   </h3>

//                   <p className="mt-2 text-sm text-slate-500">
//                     Try changing your search or filters.
//                   </p>

//                 </div>

//               )}


//               {/* =================================================
//                   MORE BUTTON
//               ================================================= */}

//               {visibleCount < searchResults.length && (

//                 <div className="mt-10 flex justify-center">

//                   <button
//                     onClick={handleMore}
//                     className="rounded-xl border-2 border-blue-600 bg-white/70 px-10 py-3 text-sm font-bold text-blue-600 shadow-md backdrop-blur-md transition hover:bg-blue-600 hover:text-white active:scale-95"
//                   >
//                     More
//                   </button>

//                 </div>

//               )}

//             </div>

//           </div>

//         </section>

//       </main>

//     </div>

//   );
// };

// export default NewSearch;



// new search
import React, { useState , useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import FilterPanel from "./FilterPanel";
import SearchBanner from "./SearchBanner";
import HostelCard from "./HostelCard";
import { hostels } from "../data/hostels";

const NewSearch = () => {

  // =====================================================
  // HOSTEL DATA
  // =====================================================




  // =====================================================
  // STATE
  // =====================================================

  // Initially show nearby hostels

  const [results, setResults] = useState(hostels);


  // Has user performed search?

  const [searched, setSearched] = useState(false);


  // Is filter panel open?

  const [filterOpen, setFilterOpen] = useState(false);


  // Were filters actually applied?

  const [filtersApplied, setFiltersApplied] = useState(false);


  // Number of cards displayed

  const [visibleCount, setVisibleCount] = useState(3);


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = (searchText) => {

    const query = searchText
      .trim()
      .toLowerCase();


    let filteredResults;


    if (!query) {

      filteredResults = hostels;

    } else {

      filteredResults = hostels.filter((hostel) =>

        hostel.name
          .toLowerCase()
          .includes(query) ||

        hostel.location
          .toLowerCase()
          .includes(query)

      );

    }


    setResults(filteredResults);

    setVisibleCount(6);

    setSearched(true);

    // A new search means previous filter state
    // should not remain visible.

    setFilterOpen(false);

    setFiltersApplied(false);

  };


  // =====================================================
  // APPLY FILTERS
  // =====================================================

  const handleApplyFilters = (filters) => {

    let filteredResults = [...results];


    // PRICE

    if (filters.minPrice) {

      filteredResults = filteredResults.filter(
        (hostel) =>
          hostel.price >= Number(filters.minPrice)
      );

    }


    if (filters.maxPrice) {

      filteredResults = filteredResults.filter(
        (hostel) =>
          hostel.price <= Number(filters.maxPrice)
      );

    }


    // AMENITIES

    if (filters.amenities.length > 0) {

      filteredResults = filteredResults.filter(
        (hostel) =>

          filters.amenities.every(
            (amenity) =>
              hostel.amenities.includes(amenity)
          )

      );

    }


    // ROOM TYPE

    if (filters.roomType) {

      filteredResults = filteredResults.filter(
        (hostel) =>
          hostel.roomType === filters.roomType
      );

    }


    setResults(filteredResults);

    setVisibleCount(6);


    // THIS is important.

    // Match percentage appears only after
    // Apply is clicked.

    setFiltersApplied(true);


    // Close panel

    setFilterOpen(false);

  };


  // =====================================================
  // MORE
  // =====================================================

  const handleMore = () => {

    setVisibleCount(
      (previous) => previous + 3
    );

  };


  // =====================================================
  // DETAILS
  // =====================================================

  const handleDetailsClick = (hostel) => {

    console.log("Selected hostel:", hostel);

  };


  // =====================================================
  // VISIBLE RESULTS
  // =====================================================

  const visibleResults = results.slice(
    0,
    visibleCount
  );

  const [searchParams] = useSearchParams();

const cityFromUrl = searchParams.get("city");

useEffect(() => {
  if (cityFromUrl) {
    handleSearch(cityFromUrl);
  }
}, [cityFromUrl]);


  return (

    <div className="min-h-screen bg-gradient-to-br from-white via-cyan-100 to-blue-200">

      <main className="mx-auto max-w-[1800px] py-20 px-3 sm:px-4 lg:px-5">


        {/* =================================================
            SEARCH BANNER
        ================================================= */}

        <SearchBanner
          onSearch={handleSearch}
          searched={searched}
        />


        {/* =================================================
            MAIN AREA
        ================================================= */}

       <section className="mt-10">

  <div className="flex items-start gap-5">


    {/* =================================================
        FILTER AREA
    ================================================= */}

    {filterOpen ? (

      /* OPEN FILTER PANEL */

      <div className="w-72 shrink-0">

        <FilterPanel
          onApply={handleApplyFilters}
          onClose={() => setFilterOpen(false)}
        />

      </div>

    ) : (

      /* COLLAPSED FILTER BUTTON */

      <div className="w-14 shrink-0">

        <button
          onClick={() => setFilterOpen(true)}
          className="
            flex
            h-72
            w-14
            items-center
            justify-center
            rounded-r-2xl
            border
            border-blue-100
            bg-white
            shadow-xl
            shadow-blue-500/10
            transition
            hover:w-16
            hover:bg-blue-50
          "
        >

          <span
            className="
              text-sm
              font-bold
              tracking-[0.5em]
              text-blue-600
            "
            style={{
              writingMode: "vertical-lr",
              textOrientation: "upright"
            }}
          >
            FILTERS
          </span>

        </button>

      </div>

    )}


    {/* =================================================
        RESULTS AREA
    ================================================= */}

    <div className="min-w-0 flex-1">

      {/* =================================================
          BEFORE SEARCH
      ================================================= */}

      {!searched && (

        <div>

          <div className="mb-5">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Recommended
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
              Hostels Near You
            </h2>

          </div>


          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

            {visibleResults.map((hostel) => (

              <HostelCard
                key={hostel.id}
                hostel={hostel}
                onDetailsClick={handleDetailsClick}
                showMatch={false}
              />

            ))}

          </div>

        </div>

      )}


      {/* =================================================
          AFTER SEARCH
      ================================================= */}

      {searched && (

        <div>

          <div className="mb-5">

            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">
              Search Results
            </p>

            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
              Results Near Your Search
            </h2>

          </div>


          {visibleResults.length > 0 ? (

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

              {visibleResults.map((hostel) => (

                <HostelCard
                  key={hostel.id}
                  hostel={hostel}
                  onDetailsClick={handleDetailsClick}
                  showMatch={filtersApplied}
                />

              ))}

            </div>

          ) : (

            <div className="rounded-2xl border border-blue-100 bg-white p-12 text-center">

              <div className="text-4xl">
                🔍
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-700">
                No hostels found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>

            </div>

          )}

        </div>

      )}


      {/* =================================================
          MORE BUTTON
      ================================================= */}

      {visibleCount < results.length && (

        <div className="mt-8 flex justify-center">

          <button
            onClick={handleMore}
            className="
              rounded-xl
              border-2
              border-blue-600
              bg-white
              px-10
              py-3
              text-sm
              font-bold
              text-blue-600
              shadow-md
              transition
              hover:bg-blue-600
              hover:text-white
              active:scale-95
            "
          >
            More
          </button>

        </div>

      )}

    </div>

  </div>

</section>

      </main>

    </div>
  );
};

export default NewSearch;