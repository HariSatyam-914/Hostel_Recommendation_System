import React from "react";
import HomeCarousel from "./HomeCarousel";
import PopularHubs from "./PopularHubs";
import HostelGuidelines from "./HostelGuidelines";
import {User} from "lucide-react";

const NewHome = ({user}) => {
  return (
    <div className="min-h-screen overflow-hidden text-white">

     

      {/* 
        pt-24 makes sure the content doesn't get hidden
        behind a fixed navbar.
      */}
      <main className="mx-auto max-w-7xl px-5 pt-5 pb-16 sm:px-8 lg:px-10">

        {/* Welcome Section */}
        <section className="mb-12 text-center">

          <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-blue-900">
            HostelHub
          </p>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-black">
            Welcome 👋,{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              {user.name || "My Account"}
            </span>
          </h1>

          <p className="mx-auto mt-5 font-bold max-w-2xl text-base leading-7 text-gray-700/80 sm:text-lg">
            Find the perfect hostel based on your requirements, compare
            facilities, explore popular hostel hubs and make a better choice
            for your stay.
          </p>

        </section>
      
      <div
                className="
                    fixed
                    inset-0
                    -z-10
              bg-gradient-to-r
    from-cyan-300
      via-blue-200
    to-cyan-100
     
    bg-cover
    bg-center
    bg-no-repeat
    "
/>
               
        {/* Carousel */}
        <section className="mb-16">
          <HomeCarousel />
        </section>

        {/* Popular Hubs */}
        <section className="mb-16">
          <PopularHubs />
        </section>

        {/* Hostel Guidelines */}
        <section className="mb-16">
          <HostelGuidelines />
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/10 px-5 py-8 text-center backdrop-blur-sm">
        <p className="text-sm text-slate-400">
          © 2026 HostelHub. Find your perfect stay.
        </p>
      </footer>

    </div>
  );
};

export default NewHome;