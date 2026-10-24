import React, { useState } from "react";

const guidelines = [
  "Always check the hostel rules before booking your stay.",
  "Keep your personal belongings secure and use lockers whenever available.",
  "Maintain cleanliness in shared areas.",
  "Respect other residents and follow hostel timings.",
  "Check the available facilities before confirming your booking.",
];

const HostelGuidelines = () => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent((prev) => (prev + 1) % guidelines.length);
  };

  const previous = () => {
    setCurrent(
      (prev) => (prev - 1 + guidelines.length) % guidelines.length
    );
  };

  return (
    <div className="mx-auto max-w-4xl text-center">

      <div className="mb-7">
        <p className="text-sm font-medium uppercase tracking-[0.25em] text-gray-600">
          Good to know
        </p>

        <h2 className="mt-2 text-3xl font-bold sm:text-4xl bg-gradient-to-r
    from-blue-600
    to-cyan-300
    bg-clip-text
    text-transparent">
          Hostel Guidelines
        </h2>
      </div>

      <div className="relative flex items-center justify-center">

        {/* Previous */}
        <button
          onClick={previous}
          className="absolute left-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white text-xl text-slate-300 backdrop-blur-sm transition hover:bg-white/10 hover:text-white sm:left-2"
        >
          ←
        </button>

        {/* Guideline */}
        <div className="mx-12 flex min-h-[110px] w-full items-center justify-center rounded-3xl border bg-white/[0.04] px-8 py-6 shadow-xl backdrop-blur-sm sm:mx-16">

          <p
            key={current}
            className="text-lg font-medium leading-7 text-emerald-500/80 sm:text-base"
          >
            {guidelines[current]}
          </p>

        </div>

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-0 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white bg-white text-xl text-slate-300 backdrop-blur-sm transition hover:bg-white/10 hover:text-white sm:right-2"
        >
          →
        </button>

      </div>

      {/* Dots */}
      <div className="mt-5 flex justify-center gap-2">

        {guidelines.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "w-7 bg-cyan-400"
                : "w-2 bg-gray-500/30"
            }`}
          ></button>
        ))}

      </div>

    </div>
  );
};

export default HostelGuidelines;