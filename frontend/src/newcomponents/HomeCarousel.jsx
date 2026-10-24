import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";

const slides = [
  {
    title: "Find Your Perfect Hostel",
    description:
      "Search hostels based on the facilities and requirements that matter most to you.",
    image:
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Compare Hostel Facilities",
    description:
      "Compare Wi-Fi, hot water, parking, lockers and other facilities before choosing.",
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
  },
  {
    title: "Explore Popular Hostel Hubs",
    description:
      "Discover popular areas and find hostels that match your preferences.",
    image:
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
  },
];

const HomeCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  return (
    <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-blue-950/30 sm:h-[480px]">

      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.title}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === currentSlide
              ? "opacity-100"
              : "pointer-events-none opacity-0"
          }`}
        >

          {/* Background Image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover"
          />

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/60 to-slate-950/20"></div>

          {/* Content */}
          <div className="relative z-10 flex h-full items-center px-7 sm:px-12 lg:px-16">

            <div className="max-w-2xl">

              <span className="mb-4 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-300 backdrop-blur-sm">
                HostelHub
              </span>

              <h2 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                {slide.title}
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-200 sm:text-base">
                {slide.description}
              </p>

              <Link to="/search" className="inline-block mt-7 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/40">
                Explore Hostels
              </Link>
              

            </div>

          </div>

        </div>
      ))}

      {/* Previous Button */}
      <button
        onClick={previousSlide}
        className="absolute left-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl backdrop-blur-md transition hover:bg-white/20"
      >
        ←
      </button>

      {/* Next Button */}
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-xl backdrop-blur-md transition hover:bg-white/20"
      >
        →
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              currentSlide === index
                ? "w-8 bg-cyan-400"
                : "w-2.5 bg-white/40"
            }`}
          ></button>
        ))}
      </div>

    </div>
  );
};

export default HomeCarousel;