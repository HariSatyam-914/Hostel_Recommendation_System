import React from "react";

import {
  Search,
  SlidersHorizontal,
  MapPin,
  ShieldCheck,
  Heart,
  Target,
  Users,
  Sparkles,
} from "lucide-react";


const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-cyan-100 px-4 pb-16 pt-10 sm:px-6 lg:px-8">

      <main className="mx-auto max-w-7xl">


        {/* =====================================================
            HERO SECTION
        ===================================================== */}

        <section className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-2xl shadow-blue-900/10">

          <div className="relative px-6 py-16 text-center sm:px-10 sm:py-20 lg:px-20">


            {/* Background decoration */}

            <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-blue-100/60 blur-3xl" />

            <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-cyan-100/60 blur-3xl" />


            <div className="relative">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20">

                <Sparkles size={26} />

              </div>


              <p className="mt-6 text-xs font-bold uppercase tracking-[0.3em] text-blue-600">
                About Our Platform
              </p>


              <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold leading-tight text-slate-900 sm:text-5xl lg:text-6xl">

                Find a Hostel That
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  {" "}Fits You
                </span>

              </h1>


              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">

                Finding the right hostel should be simple. Our platform
                helps students and working professionals discover hostels
                based on their location, budget, room preferences and
                required facilities.

              </p>

            </div>

          </div>

        </section>



        {/* =====================================================
            WHO WE ARE
        ===================================================== */}

        <section className="mt-8 grid gap-6 lg:grid-cols-2">


          {/* Left */}

          <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-xl shadow-blue-900/5 sm:p-10">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Who We Are
            </p>


            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Making hostel discovery easier
            </h2>


            <p className="mt-5 leading-7 text-slate-600">

              Our platform is designed to make the process of finding
              accommodation faster, easier and more personalized.

            </p>


            <p className="mt-4 leading-7 text-slate-600">

              Instead of searching through multiple sources, users can
              provide their requirements and discover hostels that match
              their needs.

            </p>


            <p className="mt-4 leading-7 text-slate-600">

              From location and rent to room type and facilities, we bring
              important hostel information together in one place.

            </p>

          </div>


          {/* Right - Mission */}

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-500 p-7 text-white shadow-xl shadow-blue-500/20 sm:p-10">

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">

              <Target size={24} />

            </div>


            <p className="mt-7 text-xs font-bold uppercase tracking-[0.25em] text-blue-100">
              Our Mission
            </p>


            <h2 className="mt-3 text-3xl font-extrabold">
              The right place for the right person
            </h2>


            <p className="mt-5 leading-7 text-blue-50">

              Our goal is to simplify hostel discovery by helping users
              compare their requirements with available hostel options
              and make better accommodation decisions.

            </p>

          </div>

        </section>



        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="mt-8 rounded-3xl border border-blue-100 bg-white px-6 py-10 shadow-xl shadow-blue-900/5 sm:px-10">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              How It Works
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Find your hostel in a few simple steps
            </h2>

          </div>


          <div className="mt-10 grid gap-6 md:grid-cols-3">


            {/* Step 1 */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                <Search size={23} />

              </div>


              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-600">
                Step 01
              </p>


              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Search
              </h3>


              <p className="mt-3 text-sm leading-6 text-slate-600">

                Enter your preferred city, location or other search
                requirements.

              </p>

            </div>



            {/* Step 2 */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                <SlidersHorizontal size={23} />

              </div>


              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-600">
                Step 02
              </p>


              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Filter
              </h3>


              <p className="mt-3 text-sm leading-6 text-slate-600">

                Refine the results based on rent, room type, amenities
                and other preferences.

              </p>

            </div>



            {/* Step 3 */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">

                <ShieldCheck size={23} />

              </div>


              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-blue-600">
                Step 03
              </p>


              <h3 className="mt-2 text-xl font-bold text-slate-900">
                Choose
              </h3>


              <p className="mt-3 text-sm leading-6 text-slate-600">

                Compare the available hostels and choose the one that
                best matches your requirements.

              </p>

            </div>

          </div>

        </section>



        {/* =====================================================
            FEATURES
        ===================================================== */}

        <section className="mt-8">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
              Why Choose Us
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">
              Everything you need to find your stay
            </h2>

          </div>


          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">


            <FeatureCard
              icon={<MapPin size={23} />}
              title="Location Based"
              description="Discover hostels based on your preferred city and location."
            />


            <FeatureCard
              icon={<SlidersHorizontal size={23} />}
              title="Smart Filters"
              description="Narrow down results according to your specific requirements."
            />


            <FeatureCard
              icon={<Heart size={23} />}
              title="Personalized"
              description="Find hostels that better match your preferences."
            />


            <FeatureCard
              icon={<ShieldCheck size={23} />}
              title="Easy Comparison"
              description="View important hostel information in one convenient place."
            />

          </div>

        </section>



        {/* =====================================================
            FINAL SECTION
        ===================================================== */}

        <section className="mt-8 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-12 text-center text-white shadow-xl shadow-blue-500/20 sm:px-10">

          <Users className="mx-auto" size={30} />

          <h2 className="mt-4 text-3xl font-extrabold">
            Your search for the right hostel starts here.
          </h2>


          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-50">

            Explore different hostels, compare your options and find
            accommodation that fits your needs.

          </p>

        </section>

      </main>

    </div>
  );
};



const FeatureCard = ({ icon, title, description }) => {

  return (

    <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg shadow-blue-900/5 transition duration-300 hover:-translate-y-1 hover:shadow-xl">

      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

        {icon}

      </div>


      <h3 className="mt-5 text-lg font-bold text-slate-900">
        {title}
      </h3>


      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

    </div>

  );
};


export default About;