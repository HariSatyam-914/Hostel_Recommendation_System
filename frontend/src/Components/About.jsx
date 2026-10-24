import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Search,
  ShieldCheck,
  MapPin,
  Wallet,
  Users,
  Building2,
  CheckCircle2,
  Sparkles,
  Heart,
  Compass,
  Clock3,
  BadgeCheck,
  MessageCircle,
  ChevronDown,
  Menu,
  X,
  LogOut,
  UserCircle,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    React.useState(false);

  const [openFaq, setOpenFaq] =
    React.useState(null);

  const [profileOpen, setProfileOpen] =
    React.useState(false);

  /* =========================================================
     GET CURRENT LOGGED-IN USER
  ========================================================= */

  const getStoredUser = React.useCallback(() => {
    try {
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("adminToken");

      if (!token) {
        return null;
      }

      /*
       * JWT format:
       * header.payload.signature
       */
      const parts = token.split(".");

      if (parts.length !== 3) {
        return null;
      }

      const base64Url = parts[1];

      const base64 = base64Url
        .replace(/-/g, "+")
        .replace(/_/g, "/");

      const paddedBase64 =
        base64 +
        "=".repeat(
          (4 - (base64.length % 4)) % 4
        );

      const decodedPayload =
        JSON.parse(
          window.atob(paddedBase64)
        );

      const name =
        decodedPayload.name ||
        decodedPayload.fullName ||
        decodedPayload.username ||
        decodedPayload.userName ||
        decodedPayload.firstName ||
        decodedPayload.email?.split("@")[0] ||
        "User";

      const email =
        decodedPayload.email ||
        decodedPayload.userEmail ||
        decodedPayload.mail ||
        "Email not available";

      const role =
        decodedPayload.role ||
        decodedPayload.userRole ||
        decodedPayload.authority ||
        "USER";

      return {
        name,
        email,
        role,
      };
    } catch (error) {
      console.error(
        "Unable to read logged-in user:",
        error
      );

      return null;
    }
  }, []);

  const [currentUser, setCurrentUser] =
    React.useState(() => getStoredUser());

  React.useEffect(() => {
    const refreshUser = () => {
      setCurrentUser(getStoredUser());
    };

    window.addEventListener(
      "storage",
      refreshUser
    );

    return () => {
      window.removeEventListener(
        "storage",
        refreshUser
      );
    };
  }, [getStoredUser]);

  /* =========================================================
     PROFILE HELPERS
  ========================================================= */

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean);

    if (words.length === 1) {
      return words[0]
        .substring(0, 2)
        .toUpperCase();
    }

    return (
      words[0][0] +
      words[words.length - 1][0]
    ).toUpperCase();
  };

  const formatRole = (role) => {
    if (!role) {
      return "User";
    }

    return role
      .replace("ROLE_", "")
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminToken");

    setCurrentUser(null);
    setProfileOpen(false);

    navigate("/");
  };

  const faqs = [
    {
      question: "What makes HostelHub different?",
      answer:
        "HostelHub is built around practical hostel discovery. Instead of making users search through endless listings, we help them compare hostels using budget, location, amenities, room options and everyday requirements.",
    },
    {
      question: "Who is HostelHub built for?",
      answer:
        "HostelHub is designed for students, working professionals and other long-term residents looking for dependable and suitable hostel accommodation.",
    },
    {
      question: "Can hostel owners list their properties?",
      answer:
        "Yes. Hostel owners can create their property profile, add rooms, amenities, pricing and photographs, and submit their listing for administrative review.",
    },
    {
      question: "How are hostel listings reviewed?",
      answer:
        "Listings go through a structured review process covering important property information, location, rooms, pricing, photographs and owner verification before approval.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Tell us what matters",
      description:
        "Set your budget, preferred area, commute needs and the facilities that matter to you.",
      icon: Search,
    },
    {
      number: "02",
      title: "Explore suitable stays",
      description:
        "Compare hostel options using meaningful information instead of relying on vague listings.",
      icon: Compass,
    },
    {
      number: "03",
      title: "Choose with confidence",
      description:
        "Review rooms, amenities, pricing and verified information before making your decision.",
      icon: CheckCircle2,
    },
  ];

  const principles = [
    {
      icon: Search,
      title: "Useful discovery",
      text: "Less scrolling. More relevant hostel options.",
    },
    {
      icon: ShieldCheck,
      title: "Trust first",
      text: "Structured reviews help keep property information dependable.",
    },
    {
      icon: Wallet,
      title: "Budget aware",
      text: "Find options that fit real monthly budgets.",
    },
    {
      icon: MapPin,
      title: "Location matters",
      text: "Stay closer to work, college and the places you actually use.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq((prev) =>
      prev === index ? null : index
    );
  };

  return (
    <div className="min-h-screen overflow-hidden bg-white text-[#111827]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-7 lg:px-10">

          {/* Logo */}

          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2161F5] text-white transition-transform group-hover:-rotate-3">
              <Building2
                size={19}
                strokeWidth={2}
              />

              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-white ring-2 ring-[#2161F5]" />
            </div>

            <div className="text-left">
              <p className="text-[17px] font-bold tracking-tight text-black">
                HostelHub
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Find your place
              </p>
            </div>
          </button>

          {/* Desktop navigation */}

          <nav className="hidden items-center gap-8 md:flex">

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="text-sm font-medium text-gray-500 transition hover:text-black"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="text-sm font-medium text-gray-500 transition hover:text-black"
            >
              Search
            </button>

            <button
              type="button"
              className="text-sm font-semibold text-black"
            >
              About
            </button>

            <button
              type="button"
              onClick={() => navigate("/help")}
              className="text-sm font-medium text-gray-500 transition hover:text-black"
            >
              Help
            </button>

          </nav>

          {/* =====================================================
              DESKTOP USER PROFILE
          ===================================================== */}

          <div className="hidden items-center gap-3 md:flex">

            {!currentUser ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-black"
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="group inline-flex items-center gap-2 rounded-full bg-[#2161F5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174dcc]"
                >
                  Get started

                  <ArrowUpRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>
              </>
            ) : (
              <div className="relative">

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      (prev) => !prev
                    )
                  }
                  className="flex items-center gap-3 rounded-full border border-gray-200 bg-white py-1.5 pl-2 pr-3 transition hover:border-gray-300 hover:bg-gray-50"
                >

                  {/* Avatar */}

                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2161F5] text-xs font-bold text-white">
                    {getInitials(
                      currentUser.name
                    )}
                  </div>

                  {/* User information */}

                  <div className="hidden text-left lg:block">

                    <p className="max-w-[135px] truncate text-sm font-semibold text-black">
                      {currentUser.name}
                    </p>

                    <p className="max-w-[135px] truncate text-[11px] text-gray-400">
                      {formatRole(
                        currentUser.role
                      )}
                    </p>

                  </div>

                  <ChevronDown
                    size={15}
                    className={`text-gray-400 transition-transform ${
                      profileOpen
                        ? "rotate-180"
                        : ""
                    }`}
                  />

                </button>

                {/* Profile dropdown */}

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-3 w-[285px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

                    {/* Profile header */}

                    <div className="border-b border-gray-100 bg-gray-50/70 p-4">

                      <div className="flex items-center gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2161F5] text-sm font-bold text-white">
                          {getInitials(
                            currentUser.name
                          )}
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-black">
                            {currentUser.name}
                          </p>

                          <p className="mt-0.5 truncate text-xs text-gray-500">
                            {currentUser.email}
                          </p>

                        </div>

                      </div>

                    </div>

                    {/* User details */}

                    <div className="p-2">

                      <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#2161F5]">
                          <UserCircle size={16} />
                        </div>

                        <div>

                          <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
                            Account
                          </p>

                          <p className="text-sm font-medium text-gray-800">
                            {formatRole(
                              currentUser.role
                            )}
                          </p>

                        </div>

                      </div>

                      {/* Logout */}

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >

                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-500">
                          <LogOut size={16} />
                        </div>

                        Logout

                      </button>

                    </div>

                  </div>
                )}

              </div>
            )}

          </div>

          {/* =====================================================
              MOBILE MENU BUTTON
          ===================================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                (prev) => !prev
              )
            }
            className="rounded-xl p-2.5 text-black md:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

        </div>

        {/* =========================================================
            MOBILE NAVIGATION
        ========================================================= */}

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white px-5 py-5 md:hidden">

            <div className="space-y-1">

              {[
                ["Home", "/home"],
                ["Search", "/search"],
                ["About", "/about"],
                ["Help", "/help"],
              ].map(([label, path]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(path);
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                    label === "About"
                      ? "bg-[#2161F5] text-white"
                      : "text-gray-700 hover:bg-gray-50 hover:text-black"
                  }`}
                >
                  {label}

                  <ArrowRight size={16} />

                </button>
              ))}

              {/* Mobile logged-in profile */}

              {currentUser ? (
                <div className="mt-4 border-t border-gray-100 pt-4">

                  <div className="rounded-2xl bg-gray-50 p-4">

                    <div className="flex items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2161F5] text-sm font-bold text-white">
                        {getInitials(
                          currentUser.name
                        )}
                      </div>

                      <div className="min-w-0">

                        <p className="truncate text-sm font-semibold text-black">
                          {currentUser.name}
                        </p>

                        <p className="truncate text-xs text-gray-500">
                          {currentUser.email}
                        </p>

                        <p className="mt-0.5 text-[11px] font-medium text-[#2161F5]">
                          {formatRole(
                            currentUser.role
                          )}
                        </p>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>

                  </div>

                </div>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/")
                    }
                    className="rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                  >
                    Log in
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/register")
                    }
                    className="rounded-xl bg-[#2161F5] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#174dcc]"
                  >
                    Get started
                  </button>

                </div>
              )}

            </div>

          </div>
        )}

      </header>

      {/* =========================================================
          HERO
      ========================================================= */}

      <main>

        <section className="relative bg-white">

          {/* Decorative background */}

          <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-50 blur-3xl" />

          <div className="pointer-events-none absolute right-[-100px] top-28 h-96 w-96 rounded-full bg-blue-50/70 blur-3xl" />

          <div className="mx-auto max-w-[1380px] px-5 pb-20 pt-14 sm:px-7 sm:pt-20 lg:px-10 lg:pb-28 lg:pt-24">

            <div className="grid items-end gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">

              {/* Left */}

              <div className="relative z-10">

                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#2161F5]">

                  <Sparkles
                    size={14}
                    className="text-[#2161F5]"
                  />

                  About HostelHub

                </div>

                <h1 className="max-w-[760px] text-[52px] font-semibold leading-[0.94] tracking-[-0.055em] text-black sm:text-[68px] lg:text-[86px]">

                  Finding a place

                  <span className="block text-gray-300">
                    should feel simple.
                  </span>

                </h1>

                <p className="mt-8 max-w-[620px] text-base leading-7 text-gray-500 sm:text-lg">
                  HostelHub helps students and professionals discover hostels
                  that fit their budget, location, lifestyle and everyday
                  needs—without making the search harder than it needs to be.
                </p>

                <div className="mt-9 flex flex-wrap gap-3">

                  <button
                    type="button"
                    onClick={() => navigate("/hostels")}
                    className="group inline-flex items-center gap-2 rounded-full bg-[#2161F5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174dcc]"
                  >
                    Explore hostels

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />

                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/register")}
                    className="rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-semibold text-black transition hover:border-gray-300 hover:bg-gray-50"
                  >
                    Join HostelHub
                  </button>

                </div>

                {/* Mini stats */}

                <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-gray-100 pt-6">

                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-black">
                      01
                    </p>

                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                      Clear goal
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-black">
                      03
                    </p>

                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                      Simple steps
                    </p>
                  </div>

                  <div>
                    <p className="text-2xl font-semibold tracking-tight text-black">
                      100%
                    </p>

                    <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-gray-400">
                      Built around you
                    </p>
                  </div>

                </div>

              </div>

              {/* Right visual */}

              <div className="relative min-h-[480px]">

                {/* Main image */}

                <div className="absolute right-0 top-0 h-[390px] w-[86%] overflow-hidden rounded-[34px] bg-gray-100 shadow-[0_30px_80px_rgba(0,0,0,0.10)] sm:h-[480px]">

                  <img
                    src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=85"
                    alt="Modern hostel interior"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

                  <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-white/30 bg-white/15 p-4 text-white backdrop-blur-md">

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/75">
                      The idea
                    </p>

                    <p className="mt-1 max-w-[300px] text-lg font-semibold leading-tight text-white">
                      Better decisions start with better information.
                    </p>

                  </div>

                </div>

                {/* Floating card */}

                <div className="absolute bottom-0 left-0 z-10 w-[230px] rounded-[28px] border border-gray-200 bg-white p-5 shadow-[0_24px_55px_rgba(0,0,0,0.12)] sm:w-[265px]">

                  <div className="flex items-center justify-between">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#2161F5] text-white">
                      <MapPin size={20} />
                    </div>

                    <ArrowUpRight
                      size={21}
                      className="text-[#2161F5]"
                    />

                  </div>

                  <p className="mt-12 text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
                    Built for real life
                  </p>

                  <p className="mt-2 text-xl font-semibold leading-tight tracking-tight text-black">
                    Budget.
                    <br />
                    Location.
                    <br />
                    Lifestyle.
                  </p>

                </div>

                {/* Accent shape */}

                <div className="absolute -right-6 bottom-8 hidden h-24 w-24 rounded-full border-[18px] border-blue-100 lg:block" />

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
            STORY SECTION
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] border-y border-gray-100 px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-32">

            <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2161F5]">
                  Why we exist
                </p>

                <h2 className="mt-5 max-w-[430px] text-4xl font-semibold leading-[1.02] tracking-[-0.04em] text-black sm:text-5xl">
                  A hostel search should not feel like detective work.
                </h2>

              </div>

              <div className="grid gap-10 sm:grid-cols-2">

                <div>

                  <p className="text-lg leading-8 text-gray-600">
                    Finding accommodation sounds simple until you actually
                    start comparing rent, distance, room types, amenities,
                    photographs, rules and whether the place fits your daily
                    routine.
                  </p>

                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    HostelHub was created to bring those decisions together in
                    one clearer experience.
                  </p>

                </div>

                <div className="border-t border-gray-200 pt-6 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2161F5]">
                      <Heart size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-black">
                        Our belief
                      </p>

                      <p className="text-xs text-gray-400">
                        Good housing choices are personal.
                      </p>
                    </div>

                  </div>

                  <p className="mt-8 text-2xl font-medium leading-[1.35] tracking-tight text-black">
                    “The right hostel is not just a room. It is the place your
                    next chapter starts.”
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
            HOW IT WORKS
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-32">

            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2161F5]">
                  How it works
                </p>

                <h2 className="mt-5 max-w-[420px] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-black sm:text-5xl">
                  From “where should I stay?” to “this feels right.”
                </h2>

                <p className="mt-6 max-w-[430px] text-base leading-7 text-gray-500">
                  We keep the process focused on the information that actually
                  helps people make a decision.
                </p>

              </div>

              <div className="space-y-4">

                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <div
                      key={step.number}
                      className="group grid gap-6 rounded-[26px] border border-gray-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(33,97,245,0.08)] sm:grid-cols-[72px_58px_1fr] sm:items-center sm:p-6"
                    >

                      <span className="text-sm font-semibold tracking-[0.1em] text-gray-300">
                        {step.number}
                      </span>

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2161F5] transition group-hover:bg-[#2161F5] group-hover:text-white">
                        <Icon size={20} />
                      </div>

                      <div>

                        <h3 className="text-xl font-semibold tracking-tight text-black">
                          {step.title}
                        </h3>

                        <p className="mt-2 max-w-[650px] text-sm leading-6 text-gray-500">
                          {step.description}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
            BENTO FEATURES
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-32">

            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2161F5]">
                  What we care about
                </p>

                <h2 className="mt-4 max-w-[620px] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-black sm:text-5xl">
                  Designed around the decisions that matter.
                </h2>

              </div>

              <p className="max-w-[390px] text-sm leading-6 text-gray-500">
                HostelHub connects discovery, comparison and trust in one
                experience.
              </p>

            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {/* Large card */}

              <div className="relative min-h-[390px] overflow-hidden rounded-[30px] border border-blue-100 bg-white p-7 md:col-span-2">

                <div className="relative z-10 max-w-[400px]">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2161F5] text-white shadow-sm">
                    <MapPin size={21} />
                  </div>

                  <h3 className="mt-20 text-3xl font-semibold leading-tight tracking-[-0.03em] text-black">
                    Location is more than a pin on a map.
                  </h3>

                  <p className="mt-4 text-sm leading-6 text-gray-500">
                    Distance to college, office, transport and the places you
                    visit every week can completely change whether a hostel
                    works for you.
                  </p>

                </div>

                {/* Decorative map */}

                <div className="absolute -bottom-16 -right-10 h-64 w-64 rounded-full border-[38px] border-blue-50" />

                <div className="absolute bottom-9 right-12 flex h-16 w-16 items-center justify-center rounded-full bg-[#2161F5] text-white shadow-xl">
                  <MapPin size={25} />
                </div>

              </div>

              {/* Budget */}

              <div className="min-h-[390px] rounded-[30px] border border-gray-200 bg-white p-7 shadow-sm">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2161F5] text-white">
                  <Wallet size={21} />
                </div>

                <h3 className="mt-24 text-3xl font-semibold leading-tight tracking-[-0.03em] text-black">
                  Your budget is part of the recommendation.
                </h3>

                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Compare rent and room choices without losing sight of what
                  you can comfortably afford.
                </p>

              </div>

              {/* Verification */}

              <div className="min-h-[390px] rounded-[30px] border border-blue-100 bg-white p-7">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2161F5] shadow-sm">
                  <ShieldCheck size={21} />
                </div>

                <h3 className="mt-24 text-3xl font-semibold leading-tight tracking-[-0.03em] text-black">
                  Trust should be visible.
                </h3>

                <p className="mt-4 text-sm leading-6 text-gray-500">
                  Structured property information and review workflows create a
                  more dependable discovery experience.
                </p>

              </div>

              {/* Community strip */}

              <div className="relative min-h-[250px] overflow-hidden rounded-[30px] border border-blue-100 bg-white p-7 md:col-span-2 lg:col-span-4">

                <div className="relative z-10 max-w-[650px]">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2161F5]">
                      <Users size={20} />
                    </div>

                    <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2161F5]">
                      Community
                    </span>

                  </div>

                  <h3 className="mt-8 text-3xl font-semibold tracking-[-0.03em] text-black sm:text-4xl">
                    Accommodation is where everyday life happens.
                  </h3>

                  <p className="mt-4 max-w-[600px] text-sm leading-7 text-gray-500">
                    We want the platform to help people find places where they
                    can study, work, recharge, meet people and feel at home.
                  </p>

                </div>

                <div className="absolute right-0 top-0 h-full w-[35%] bg-gradient-to-l from-blue-50/80 to-transparent" />

                <div className="absolute -right-10 -top-20 h-72 w-72 rounded-full border-[42px] border-blue-50" />

                <div className="absolute right-16 top-14 hidden lg:block">
                  <BadgeCheck
                    size={90}
                    strokeWidth={1}
                    className="text-blue-100"
                  />
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
            PRINCIPLES
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] border-y border-gray-100 px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-32">

            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2161F5]">
                  Our principles
                </p>

                <h2 className="mt-5 text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-black sm:text-5xl">
                  Less noise.

                  <span className="block text-gray-300">
                    Better choices.
                  </span>
                </h2>

              </div>

              <div className="grid gap-x-6 gap-y-8 sm:grid-cols-2">

                {principles.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="border-t border-gray-200 pt-5"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5]">
                          <Icon size={18} />
                        </div>

                        <h3 className="text-base font-semibold text-black">
                          {item.title}
                        </h3>

                      </div>

                      <p className="mt-3 max-w-[300px] text-sm leading-6 text-gray-500">
                        {item.text}
                      </p>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
            BIG EDITORIAL STATEMENT
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-32">

            <div className="rounded-[34px] border border-blue-100 bg-blue-50 px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">

              <div className="max-w-[1080px]">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2161F5]">
                  Our mission
                </p>

                <h2 className="mt-6 text-[43px] font-semibold leading-[0.98] tracking-[-0.055em] text-black sm:text-[62px] lg:text-[78px]">

                  Make finding a good hostel

                  <span className="text-gray-300">
                    {" "}
                    feel less like searching
                  </span>

                  <span className="block">
                    and more like discovering.
                  </span>

                </h2>

                <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">

                  <button
                    type="button"
                    onClick={() => navigate("/hostels")}
                    className="group inline-flex w-fit items-center gap-2 rounded-full bg-[#2161F5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174dcc]"
                  >
                    Find your hostel

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </button>

                  <span className="text-sm text-gray-500">
                    Built for students, professionals and modern city living.
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =========================================================
            FAQ
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1080px] px-5 py-20 sm:px-7 sm:py-24 lg:py-28">

            <div className="text-center">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2161F5]">
                Questions
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-black sm:text-5xl">
                A few things you might want to know.
              </h2>

            </div>

            <div className="mt-12 border-t border-gray-200">

              {faqs.map((faq, index) => {

                const isOpen =
                  openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className="border-b border-gray-200"
                  >

                    <button
                      type="button"
                      onClick={() =>
                        toggleFaq(index)
                      }
                      className="flex w-full items-center justify-between gap-5 py-6 text-left"
                    >

                      <span className="text-base font-semibold tracking-tight text-black sm:text-lg">
                        {faq.question}
                      </span>

                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#2161F5] transition-transform ${
                          isOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      >
                        <ChevronDown size={17} />
                      </span>

                    </button>

                    {isOpen && (
                      <div className="max-w-[780px] pb-7 pr-10">

                        <p className="text-sm leading-7 text-gray-500">
                          {faq.answer}
                        </p>

                      </div>
                    )}

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* =========================================================
            CONTACT CTA
        ========================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10 lg:py-28">

            <div className="rounded-[34px] bg-[#2161F5] px-6 py-14 sm:px-10 sm:py-16 lg:px-14 lg:py-20">

              <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">

                <div>

                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2161F5]">
                    <MessageCircle size={21} />
                  </div>

                  <h2 className="max-w-[780px] text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl lg:text-6xl">
                    Your next place might be closer than you think.
                  </h2>

                  <p className="mt-6 max-w-[620px] text-base leading-7 text-white/75">
                    Start with what matters to you and let HostelHub make the
                    search easier.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => navigate("/hostels")}
                  className="group inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#2161F5] transition hover:bg-blue-50"
                >
                  Explore hostels

                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-gray-100 bg-white text-black">

        <div className="mx-auto max-w-[1380px] px-5 py-10 sm:px-7 lg:px-10">

          <div className="flex flex-col gap-8 border-b border-gray-100 pb-8 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2161F5] text-white">
                <Building2 size={18} />
              </div>

              <div>

                <p className="text-base font-bold text-black">
                  HostelHub
                </p>

                <p className="text-xs text-gray-400">
                  Find your place.
                </p>

              </div>

            </div>

            <div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-gray-500">

              <button
                type="button"
                onClick={() => navigate("/home")}
                className="transition hover:text-black"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/search")
                }
                className="transition hover:text-black"
              >
                Search
              </button>

              <button
                type="button"
                className="font-semibold text-black"
              >
                About
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/help")
                }
                className="transition hover:text-black"
              >
                Help
              </button>

            </div>

          </div>

          <div className="flex flex-col gap-2 pt-6 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

            <p>
              © {new Date().getFullYear()} HostelHub. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <Clock3 size={13} />
              Built for everyday city living.
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};

export default About;