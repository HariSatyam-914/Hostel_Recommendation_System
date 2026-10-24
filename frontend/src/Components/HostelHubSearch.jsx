import React, { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Heart,
  Star,
  MapPin,
  Wifi,
  Wind,
  UtensilsCrossed,
  Shirt,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Crown,
} from "lucide-react";

const PROPERTIES = [
  {
    id: 1,
    name: "The Urban Oasis",
    location: "Koramangala, Block 4",
    rating: 4.8,
    match: 96,
    premium: true,
    price: 8500,
    amenities: ["wifi", "ac", "food"],
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Nomad House",
    location: "HSR Layout, Sector 7",
    rating: 4.6,
    match: 92,
    premium: false,
    price: 7200,
    amenities: ["wifi", "laundry", "food"],
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Elite Stays",
    location: "Indiranagar, 10th Road",
    rating: 4.4,
    match: 85,
    premium: false,
    price: 6000,
    amenities: ["wifi"],
    image:
      "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Skyline Co-living",
    location: "Electronic City, Phase 1",
    rating: 4.9,
    match: 95,
    premium: false,
    price: 9000,
    amenities: ["wifi", "ac", "laundry"],
    image:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80",
  },
];

const AMENITY_ICON = {
  wifi: Wifi,
  ac: Wind,
  food: UtensilsCrossed,
  laundry: Shirt,
};

const AMENITY_OPTIONS = [
  { key: "wifi", label: "WiFi", Icon: Wifi },
  { key: "ac", label: "AC", Icon: Wind },
  { key: "food", label: "Food", Icon: UtensilsCrossed },
  { key: "laundry", label: "Laundry", Icon: Shirt },
];

const ACCOMMODATION_OPTIONS = ["Boys Only", "Girls Only", "Co-living Space"];

function PropertyCard({ property, isFavorite, onToggleFavorite }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md            transition-shadow overflow-hidden">
      <div  className="relative h-40">
        <img
          src={property.image}
          alt={property.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 items-start">
          {property.premium && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
              <Crown className="w-3 h-3" />
              Premium
            </span>
          )}
          <span className="flex items-center gap-1 bg-blue-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            {property.match}% Match
          </span>
        </div>

        <button
          onClick={() => onToggleFavorite(property.id)}
          aria-label="Toggle favorite"
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart
            className={`w-3.5 h-3.5 ${
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"
            }`}
          />
        </button>
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-900 text-[15px] leading-tight">
            {property.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 text-[13px] font-medium text-gray-700">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {property.rating}
          </div>
        </div>

        <div className="flex items-center gap-1 text-gray-500 text-[13px] mt-1">
          <MapPin className="w-3.5 h-3.5" />
          {property.location}
        </div>

        <div className="flex items-center gap-2.5 mt-2.5 text-gray-400">
          {property.amenities.map((key) => {
            const Icon = AMENITY_ICON[key];
            return <Icon key={key} className="w-4 h-4" />;
          })}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <div>
            <p className="text-[11px] text-gray-400 leading-none">Starts at</p>
            <p className="text-[15px] font-bold text-gray-900 leading-tight">
              ₹{property.price.toLocaleString("en-IN")}
              <span className="text-[12px] font-medium text-gray-500">/mo</span>
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium px-4 py-2 rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  budget,
  setBudget,
  accommodation,
  setAccommodation,
  amenities,
  toggleAmenity,
  resultCount,
}) {
  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-6">
      <div>
        <h2 className="font-semibold text-gray-900 text-sm">Filters</h2>
        <p className="text-blue-600 text-[13px] mt-0.5">
          Refine your {resultCount} results
        </p>
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-700 mb-2">
          Budget Range
        </p>
        <input
          type="range"
          min={2000}
          max={25000}
          step={500}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-[11px] text-gray-400 mt-1">
          <span>₹2,000</span>
          <span>₹25,000+</span>
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-700 mb-2">
          Accommodation For
        </p>
        <div className="space-y-2">
          {ACCOMMODATION_OPTIONS.map((option) => (
            <label
              key={option}
              className="flex items-center gap-2 text-[13px] text-gray-700 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={accommodation === option}
                onChange={() => setAccommodation(option)}
                className="w-4 h-4 rounded accent-blue-600"
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-700 mb-2">
          Must-have Amenities
        </p>
        <div className="grid grid-cols-2 gap-2">
          {AMENITY_OPTIONS.map(({ key, label, Icon }) => {
            const active = amenities.includes(key);
            return (
              <button
                key={key}
                onClick={() => toggleAmenity(key)}
                className={`flex items-center gap-1.5 justify-center text-[12px] font-medium py-2 rounded-lg border transition-colors ${
                  active
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-[13px] font-medium text-gray-700 mb-2">
          Proximity
        </p>
        <select className="w-full text-[13px] border border-gray-200 rounded-lg px-3 py-2 text-gray-700 bg-white">
          <option>Within 2km of Metro</option>
          <option>Within 5km of Metro</option>
          <option>Any distance</option>
        </select>
      </div>

      <div className="bg-blue-600 rounded-xl p-4 text-white">
        <Sparkles className="w-5 h-5 mb-2" />
        <p className="font-semibold text-[14px]">Upgrade to Premium</p>
        <p className="text-[12px] text-blue-100 mt-1 leading-snug">
          Get early access to exclusive property listings.
        </p>
        <button className="mt-3 w-full bg-white text-blue-600 text-[13px] font-semibold py-2 rounded-lg hover:bg-blue-50 transition-colors">
          Learn More
        </button>
      </div>
    </aside>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  const pages = [1, 2, 3];
  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        aria-label="Previous page"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40"
        disabled={page === 1}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
            page === p
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {p}
        </button>
      ))}

      <span className="w-8 h-8 flex items-center justify-center text-gray-400 text-[13px]">
        ...
      </span>

      <button
        onClick={() => onPageChange(totalPages)}
        className={`w-8 h-8 flex items-center justify-center rounded-lg text-[13px] font-medium transition-colors ${
          page === totalPages
            ? "bg-blue-600 text-white"
            : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {totalPages}
      </button>

      <button
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        aria-label="Next page"
        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-40"
        disabled={page === totalPages}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function HostelHubSearch() {
  const [budget, setBudget] = useState(12000);
  const [accommodation, setAccommodation] = useState("Co-living Space");
  const [amenities, setAmenities] = useState(["wifi"]);
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);

  const toggleAmenity = (key) =>
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key]
    );

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            defaultValue="Bangalore, Karnataka"
            className="bg-transparent text-[14px] text-gray-800 w-full outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-[13px] text-blue-600 font-medium shrink-0">
          <SlidersHorizontal className="w-4 h-4" />
          Budget: ₹5,000 – ₹12,000 / mo
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 flex flex-col lg:flex-row gap-6 max-w-screen-2xl mx-auto w-full">
        <Sidebar
          budget={budget}
          setBudget={setBudget}
          accommodation={accommodation}
          setAccommodation={setAccommodation}
          amenities={amenities}
          toggleAmenity={toggleAmenity}
          resultCount={42}
        />

        <section className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {PROPERTIES.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                isFavorite={favorites.includes(property.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={14} onPageChange={setPage} />
        </section>
      </main>

      <footer className="bg-white border-t border-gray-100 px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div>
          <p className="font-bold text-blue-600 text-[15px]">HostelHub</p>
          <p className="text-[12px] text-gray-400">
            © 2024 HostelHub SaaS. All rights reserved.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 text-[13px] text-gray-500">
          <a href="#" className="hover:text-gray-700">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-gray-700">
            Terms of Service
          </a>
          <a href="#" className="hover:text-gray-700">
            Help Center
          </a>
          <a href="#" className="hover:text-gray-700">
            Career
          </a>
        </div>
      </footer>
    </div>
  );
}
