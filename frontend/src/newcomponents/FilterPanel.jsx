// import React, { useState } from "react";

// const FilterPanel = ({ onApply, onClose }) => {

//   // Temporary selections
//   // These are NOT applied until Apply Filters is clicked
//   const [filters, setFilters] = useState({
//     minPrice: "",
//     maxPrice: "",
//     amenities: [],
//     roomType: "",
//   });


//   // Handle checkbox changes
//   const handleAmenityChange = (amenity) => {

//     setFilters((previous) => {

//       const alreadySelected =
//         previous.amenities.includes(amenity);

//       return {
//         ...previous,

//         amenities: alreadySelected
//           ? previous.amenities.filter(
//               (item) => item !== amenity
//             )
//           : [...previous.amenities, amenity],
//       };

//     });

//   };


//   // Apply filters
//   const handleApply = () => {

//     // Send selected filters to Search.jsx
//     onApply(filters);

//   };


//   // Clear filters
//   const handleClear = () => {

//     setFilters({
//       minPrice: "",
//       maxPrice: "",
//       amenities: [],
//       roomType: "",
//     });

//   };


//   return (
//     <aside className="w-full rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-500/10 lg:w-72 lg:shrink-0">

//       {/* Header */}

//       <div className="flex items-center justify-between">

//         <div>

//           <h3 className="text-lg font-bold text-slate-800">
//             Filters
//           </h3>

//           <p className="mt-1 text-xs text-slate-400">
//             Refine your hostel search
//           </p>

//         </div>


//         {/* Close button */}

//         <button
//           onClick={onClose}
//           className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
//           title="Close filters"
//         >
//           ✕
//         </button>

//       </div>


//       <div className="my-5 h-px bg-slate-100" />


//       {/* ================= PRICE ================= */}

//       <div>

//         <h4 className="mb-3 text-sm font-bold text-slate-700">
//           Price Range
//         </h4>

//         <div className="grid grid-cols-2 gap-3">

//           <input
//             type="number"
//             placeholder="Min"
//             value={filters.minPrice}
//             onChange={(e) =>
//               setFilters({
//                 ...filters,
//                 minPrice: e.target.value,
//               })
//             }
//             className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//           />

//           <input
//             type="number"
//             placeholder="Max"
//             value={filters.maxPrice}
//             onChange={(e) =>
//               setFilters({
//                 ...filters,
//                 maxPrice: e.target.value,
//               })
//             }
//             className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
//           />

//         </div>

//       </div>


//       {/* ================= AMENITIES ================= */}

//       <div className="mt-6">

//         <h4 className="mb-3 text-sm font-bold text-slate-700">
//           Amenities
//         </h4>


//         <div className="space-y-3">

//           {[
//             "Wi-Fi",
//             "Hot Water",
//             "Parking",
//             "Food",
//             "Laundry",
//             "Locker",
//             "AC",
//           ].map((amenity) => (

//             <label
//               key={amenity}
//               className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
//             >

//               <input
//                 type="checkbox"
//                 checked={filters.amenities.includes(amenity)}
//                 onChange={() =>
//                   handleAmenityChange(amenity)
//                 }
//                 className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
//               />

//               {amenity}

//             </label>

//           ))}

//         </div>

//       </div>


//       {/* ================= ROOM TYPE ================= */}

//       <div className="mt-6">

//         <h4 className="mb-3 text-sm font-bold text-slate-700">
//           Room Type
//         </h4>

//         <div className="space-y-3">

//           {[
//             "Single",
//             "Double",
//             "Triple",
//             "Shared",
//           ].map((type) => (

//             <label
//               key={type}
//               className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
//             >

//               <input
//                 type="radio"
//                 name="roomType"
//                 value={type}
//                 checked={filters.roomType === type}
//                 onChange={(e) =>
//                   setFilters({
//                     ...filters,
//                     roomType: e.target.value,
//                   })
//                 }
//                 className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
//               />

//               {type}

//             </label>

//           ))}

//         </div>

//       </div>


//       {/* ================= BUTTONS ================= */}

//       <div className="mt-7 flex gap-3">

//         <button
//           onClick={handleClear}
//           className="flex-1 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
//         >
//           Clear
//         </button>


//         <button
//           onClick={handleApply}
//           className="flex-1 rounded-xl bg-blue-600 px-3 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 active:scale-95"
//         >
//           Apply
//         </button>

//       </div>

//     </aside>
//   );
// };

// export default FilterPanel;


// new filter panel
import React, { useState } from "react";

const FilterPanel = ({ onApply, onClose }) => {

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    amenities: [],
    roomType: "",
  });


  // =====================================================
  // AMENITY SELECTION
  // =====================================================

  const handleAmenityChange = (amenity) => {

    setFilters((previous) => {

      const alreadySelected =
        previous.amenities.includes(amenity);

      return {
        ...previous,

        amenities: alreadySelected
          ? previous.amenities.filter(
              (item) => item !== amenity
            )
          : [
              ...previous.amenities,
              amenity,
            ],
      };

    });

  };


  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {

    setFilters({
      minPrice: "",
      maxPrice: "",
      amenities: [],
      roomType: "",
    });

  };


  // =====================================================
  // APPLY
  // =====================================================

  const handleApply = () => {

    onApply(filters);

  };


  return (

    <aside
      className="
        flex
        h-[600px]
        w-72
        flex-col
        overflow-hidden
        rounded-2xl
        border
        border-blue-100
        bg-white
        shadow-xl
        shadow-blue-500/10
      "
    >

      {/* =================================================
          HEADER
          Fixed at the top
      ================================================= */}

      <div
        className="
          flex
          shrink-0
          items-center
          justify-between
          border-b
          border-slate-100
          px-5
          py-4
        "
      >

        <h2 className="text-lg font-bold text-slate-800">
          Filters
        </h2>


        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            border
            border-slate-200
            text-slate-500
            transition
            hover:bg-blue-50
            hover:text-blue-600
          "
        >
          ✕
        </button>

      </div>


      {/* =================================================
          SCROLLABLE FILTER CONTENT
      ================================================= */}

      <div
        className="
          min-h-0
          flex-1
          overflow-y-auto
          px-5
          py-5

          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-blue-200
          hover:scrollbar-thumb-blue-300
        "
      >

        {/* =================================================
            PRICE RANGE
        ================================================= */}

        <div>

          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Price Range
          </h3>


          <div className="grid grid-cols-2 gap-2">

            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  minPrice: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />


            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  maxPrice: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-sm
                outline-none
                transition
                focus:border-blue-500
                focus:ring-2
                focus:ring-blue-100
              "
            />

          </div>

        </div>


        {/* =================================================
            AMENITIES
        ================================================= */}

        <div className="mt-7">

          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Amenities
          </h3>


          <div className="space-y-3">

            {[
              "Wi-Fi",
              "Hot Water",
              "Parking",
              "Food",
              "Laundry",
              "Locker",
              "AC",
              "Gym",
              "TV",
              "Security",
            ].map((amenity) => (

              <label
                key={amenity}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  text-sm
                  text-slate-600
                "
              >

                <input
                  type="checkbox"
                  checked={filters.amenities.includes(
                    amenity
                  )}
                  onChange={() =>
                    handleAmenityChange(amenity)
                  }
                  className="
                    h-4
                    w-4
                    accent-blue-600
                  "
                />

                <span>
                  {amenity}
                </span>

              </label>

            ))}

          </div>

        </div>


        {/* =================================================
            ROOM TYPE
        ================================================= */}

        <div className="mt-7">

          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Room Type
          </h3>


          <div className="space-y-3">

            {[
              "Single",
              "Double",
              "Triple",
              "Shared",
            ].map((type) => (

              <label
                key={type}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  text-sm
                  text-slate-600
                "
              >

                <input
                  type="radio"
                  name="roomType"
                  checked={
                    filters.roomType === type
                  }
                  onChange={() =>
                    setFilters({
                      ...filters,
                      roomType: type,
                    })
                  }
                  className="
                    h-4
                    w-4
                    accent-blue-600
                  "
                />

                <span>
                  {type}
                </span>

              </label>

            ))}

          </div>

        </div>


        {/* =================================================
            ADDITIONAL FILTER EXAMPLE
        ================================================= */}

        <div className="mt-7">

          <h3 className="mb-3 text-sm font-bold text-slate-700">
            Rating
          </h3>


          <div className="space-y-3">

            {[
              "4.5 and above",
              "4.0 and above",
              "3.5 and above",
            ].map((rating) => (

              <label
                key={rating}
                className="
                  flex
                  cursor-pointer
                  items-center
                  gap-3
                  text-sm
                  text-slate-600
                "
              >

                <input
                  type="checkbox"
                  className="h-4 w-4 accent-blue-600"
                />

                {rating}

              </label>

            ))}

          </div>

        </div>


        {/* Extra space at bottom of scroll area */}

        <div className="h-5" />

      </div>


      {/* =================================================
          FOOTER
          Fixed at the bottom
      ================================================= */}

      <div
        className="
          flex
          shrink-0
          gap-3
          border-t
          border-slate-100
          bg-white
          px-5
          py-4
        "
      >

        <button
          type="button"
          onClick={handleClear}
          className="
            flex-1
            rounded-xl
            border
            border-slate-200
            bg-white
            py-3
            text-sm
            font-semibold
            text-slate-600
            transition
            hover:bg-slate-50
          "
        >
          Clear
        </button>


        <button
          type="button"
          onClick={handleApply}
          className="
            flex-1
            rounded-xl
            bg-blue-600
            py-3
            text-sm
            font-bold
            text-white
            transition
            hover:bg-blue-700
            active:scale-95
          "
        >
          Apply
        </button>

      </div>

    </aside>

  );
};

export default FilterPanel;