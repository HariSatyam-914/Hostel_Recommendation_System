import React, { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  Building2,
  Bus,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  House,
  MapPin,
  Menu,
  Search,
  ShieldCheck,
  Star,
  Users,
  X,
  Zap,
  UserCircle,
  LogOut,
  UserRound,
  SlidersHorizontal,
  Sparkles,
  Navigation,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   AUTH HELPERS
   ========================================================= */

const decodeJwtPayload = (token) => {
  try {
    const base64Url = token.split(".")[1];

    if (!base64Url) {
      return null;
    }

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (char) =>
            "%" +
            ("00" + char.charCodeAt(0).toString(16)).slice(-2)
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  const possibleKeys = [
    "user",
    "userInfo",
    "loggedInUser",
  ];

  for (const key of possibleKeys) {
    try {
      const raw = localStorage.getItem(key);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed) {
          return parsed;
        }
      }
    } catch {
      // Ignore malformed localStorage values.
    }
  }

  const tokenKeys = [
    "token",
    "accessToken",
    "jwt",
  ];

  for (const key of tokenKeys) {
    const token = localStorage.getItem(key);

    if (token) {
      const payload = decodeJwtPayload(token);

      if (payload) {
        return payload;
      }
    }
  }

  return null;
};

const getUserDisplayName = (user) => {
  if (!user) {
    return "";
  }

  return (
    user.name ||
    user.fullName ||
    user.username ||
    user.firstName ||
    user.email ||
    user.sub ||
    ""
  );
};

const getUserEmail = (user) => {
  if (!user) {
    return "";
  }

  return (
    user.email ||
    user.emailAddress ||
    ""
  );
};

const getUserInitials = (user) => {
  const name = getUserDisplayName(user);

  if (!name) {
    return "U";
  }

  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
};

const isUserLoggedIn = () => {
  return Boolean(getStoredUser());
};

/* =========================================================
   HOME PAGE
   ========================================================= */

function Home() {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [searchLocation, setSearchLocation] =
    useState("");

  const [searchBudget, setSearchBudget] =
    useState("");

  const [searchNear, setSearchNear] =
    useState("");

  const [loggedInUser, setLoggedInUser] =
    useState(() => getStoredUser());

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const profileMenuRef = useRef(null);

  /* =========================================================
     SEARCH
     ========================================================= */

  const handleHomeSearch = () => {
    const params = new URLSearchParams();

    const location =
      searchLocation.trim();

    const budget =
      searchBudget.trim();

    const near =
      searchNear.trim();

    if (location) {
      params.set("location", location);
    }

    if (budget) {
      params.set("budget", budget);
    }

    if (near) {
      params.set("near", near);
    }

    const queryString =
      params.toString();

    navigate(
      queryString
        ? `/search?${queryString}`
        : "/search"
    );
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleHomeSearch();
    }
  };

  /* =========================================================
     AUTH STATE
     ========================================================= */

  useEffect(() => {
    const checkLoginStatus = () => {
      const user = getStoredUser();

      setLoggedInUser(user);
    };

    checkLoginStatus();

    window.addEventListener(
      "storage",
      checkLoginStatus
    );

    window.addEventListener(
      "focus",
      checkLoginStatus
    );

    return () => {
      window.removeEventListener(
        "storage",
        checkLoginStatus
      );

      window.removeEventListener(
        "focus",
        checkLoginStatus
      );
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          event.target
        )
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = () => {
    const authKeys = [
      "token",
      "accessToken",
      "jwt",
      "user",
      "userInfo",
      "loggedInUser",
    ];

    authKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("jwt");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("loggedInUser");

    setLoggedInUser(null);
    setProfileMenuOpen(false);

    window.location.href = "/";
  };

  /* =========================================================
     PRODUCT JOURNEYS
     These are not fake hostel listings.
     They represent actual search intents.
     ========================================================= */

  const discoveryCards = [
    {
      icon: MapPin,
      label: "I know my area",
      title: "Search by location",
      description:
        "Start with a city, locality or area and explore hostels around it.",
      action: () => navigate("/search"),
    },
    {
      icon: Building2,
      label: "I study or work nearby",
      title: "Stay near your destination",
      description:
        "Use your college, office or another important place as your search reference.",
      action: () => navigate("/search"),
    },
    {
      icon: CircleDollarSign,
      label: "Budget comes first",
      title: "Find within your budget",
      description:
        "Set the amount you want to spend and continue your search from there.",
      action: () => navigate("/search"),
    },
    {
      icon: Bus,
      label: "Commute matters",
      title: "Search around transport",
      description:
        "Include transport or nearby connectivity in the place you are looking for.",
      action: () => navigate("/search"),
    },
  ];

  /* =========================================================
     IMAGE SOURCES
     Visuals only — no fake hostel information is attached.
     ========================================================= */

  const heroImage =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=90";

  const secondaryImage =
    "https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85";

  const tertiaryImage =
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=85";

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-100 selection:text-blue-700">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-slate-100/80 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-12">

          <div className="flex h-[76px] items-center justify-between">

            {/* LOGO */}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="group flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm transition-transform duration-300 group-hover:-rotate-3">
                <House
                  size={20}
                  strokeWidth={2.3}
                />
              </div>

              <div className="text-left">
                <div className="text-lg font-bold tracking-tight text-slate-950">
                  HostelHub
                </div>

                <div className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-slate-400 sm:block">
                  Find your place
                </div>
              </div>
            </button>

            {/* DESKTOP NAV */}

            <nav className="hidden items-center gap-1 lg:flex">

              <button
                type="button"
                onClick={() => navigate("/")}
                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() => navigate("/search")}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Search
              </button>

              <button
                type="button"
                onClick={() => navigate("/about")}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                About
              </button>

              <button
                type="button"
                onClick={() => navigate("/help")}
                className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
              >
                Help
              </button>

            </nav>

            {/* DESKTOP ACTIONS */}

            <div className="hidden items-center gap-2 lg:flex">

              <button
                type="button"
                onClick={() => navigate("/search")}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950"
                aria-label="Search"
              >
                <Search size={18} />
              </button>

              {!loggedInUser ? (
                <>
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Log in
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/signup")}
                    className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <div
                  ref={profileMenuRef}
                  className="relative"
                >

                  <button
                    type="button"
                    onClick={() =>
                      setProfileMenuOpen(
                        (previous) =>
                          !previous
                      )
                    }
                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1.5 pl-1.5 pr-3 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {getUserInitials(
                        loggedInUser
                      )}
                    </div>

                    <span className="max-w-[120px] truncate text-sm font-semibold text-slate-700">
                      {getUserDisplayName(
                        loggedInUser
                      )}
                    </span>

                    <ChevronDown
                      size={15}
                      className="text-slate-400"
                    />
                  </button>

                  {profileMenuOpen && (
                    <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.15)]">

                      <div className="border-b border-slate-100 px-3 py-3">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                            {getUserInitials(
                              loggedInUser
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-slate-900">
                              {getUserDisplayName(
                                loggedInUser
                              )}
                            </div>

                            <div className="truncate text-xs text-slate-500">
                              {getUserEmail(
                                loggedInUser
                              )}
                            </div>
                          </div>

                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(
                            false
                          );
                          navigate("/profile");
                        }}
                        className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <UserRound size={17} />
                        Profile
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(
                            false
                          );
                          navigate(
                            "/recommendations"
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <Sparkles size={17} />
                        Recommendations
                      </button>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut size={17} />
                        Log out
                      </button>

                    </div>
                  )}

                </div>
              )}

            </div>

            {/* MOBILE MENU BUTTON */}

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen(
                  (previous) => !previous
                )
              }
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

          </div>

          {/* MOBILE NAV */}

          {mobileMenuOpen && (
            <div className="border-t border-slate-100 py-4 lg:hidden">

              <div className="space-y-1">

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/");
                  }}
                  className="flex w-full items-center justify-between rounded-xl bg-blue-50 px-4 py-3 text-left text-sm font-semibold text-blue-600"
                >
                  Home
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/hostels");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hostels
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/about");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  About
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/owner/add-hostel");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  For Owners
                  <ChevronRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate("/help");
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Help
                  <ChevronRight size={16} />
                </button>

              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">

                {!loggedInUser ? (
                  <div className="grid grid-cols-2 gap-2">

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/");
                      }}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                    >
                      Log in
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/signup");
                      }}
                      className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white"
                    >
                      Sign up
                    </button>

                  </div>
                ) : (
                  <div className="space-y-2">

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                        {getUserInitials(
                          loggedInUser
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-slate-900">
                          {getUserDisplayName(
                            loggedInUser
                          )}
                        </div>

                        <div className="truncate text-xs text-slate-500">
                          {getUserEmail(
                            loggedInUser
                          )}
                        </div>
                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/profile");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <UserRound size={17} />
                      Profile
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Log out
                    </button>

                  </div>
                )}

              </div>

            </div>
          )}

        </div>
      </header>

      {/* =====================================================
          HERO
      ===================================================== */}

      <main>

        <section className="relative overflow-hidden">

          {/* Background decoration */}

          <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-blue-50 blur-3xl" />

          <div className="pointer-events-none absolute -right-40 top-40 h-[500px] w-[500px] rounded-full bg-blue-50 blur-3xl" />

          <div className="mx-auto max-w-[1400px] px-5 pb-20 pt-12 sm:px-8 sm:pt-16 lg:px-12 lg:pb-28 lg:pt-20">

            <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">

              {/* HERO COPY */}

              <div className="relative z-10">

                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-blue-600">
                  <Sparkles size={14} />
                  A simpler way to find your next stay
                </div>

                <h1 className="max-w-3xl text-[clamp(3.4rem,7vw,6.8rem)] font-semibold leading-[0.91] tracking-[-0.065em] text-slate-950">

                  Find a place

                  <span className="block text-blue-600">
                    that fits you.
                  </span>

                </h1>

                <p className="mt-7 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                  Search for hostels around the places that matter to you —
                  your college, office, preferred area, budget or daily
                  commute.
                </p>

                {/* SEARCH PANEL */}

                <div className="mt-9 rounded-[28px] border border-slate-200 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">

                  <div className="grid lg:grid-cols-[1.05fr_0.8fr_1fr_auto]">

                    {/* LOCATION */}

                    <div className="group flex min-h-[74px] items-center gap-3 rounded-2xl px-4 transition hover:bg-slate-50">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <MapPin size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor="home-location"
                          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"
                        >
                          Where
                        </label>

                        <input
                          id="home-location"
                          type="text"
                          value={searchLocation}
                          onChange={(event) =>
                            setSearchLocation(
                              event.target.value
                            )
                          }
                          onKeyDown={
                            handleSearchKeyDown
                          }
                          placeholder="City or area"
                          className="mt-1 w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>

                    </div>

                    {/* BUDGET */}

                    <div className="group flex min-h-[74px] items-center gap-3 border-t border-slate-100 px-4 transition hover:bg-slate-50 lg:border-l lg:border-t-0">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CircleDollarSign
                          size={19}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor="home-budget"
                          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"
                        >
                          Budget
                        </label>

                        <input
                          id="home-budget"
                          type="text"
                          value={searchBudget}
                          onChange={(event) =>
                            setSearchBudget(
                              event.target.value
                            )
                          }
                          onKeyDown={
                            handleSearchKeyDown
                          }
                          placeholder="Monthly budget"
                          className="mt-1 w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>

                    </div>

                    {/* NEAR */}

                    <div className="group flex min-h-[74px] items-center gap-3 border-t border-slate-100 px-4 transition hover:bg-slate-50 lg:border-l lg:border-t-0">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Navigation size={18} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <label
                          htmlFor="home-near"
                          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400"
                        >
                          Near
                        </label>

                        <input
                          id="home-near"
                          type="text"
                          value={searchNear}
                          onChange={(event) =>
                            setSearchNear(
                              event.target.value
                            )
                          }
                          onKeyDown={
                            handleSearchKeyDown
                          }
                          placeholder="College, office, transport"
                          className="mt-1 w-full border-none bg-transparent p-0 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
                        />
                      </div>

                    </div>

                    {/* SEARCH BUTTON */}

                    <button
                      type="button"
                      onClick={handleHomeSearch}
                      className="m-1 flex min-h-[64px] items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
                    >
                      <Search size={18} />
                      <span className="hidden sm:inline">
                        Find my hostel
                      </span>
                      <span className="sm:hidden">
                        Search
                      </span>
                    </button>

                  </div>
                </div>

                {/* PRODUCT SIGNALS — NO FAKE NUMBERS */}

                <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">

                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      size={16}
                      className="text-blue-600"
                    />
                    Search what matters
                  </div>

                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      size={16}
                      className="text-blue-600"
                    />
                    Filter your options
                  </div>

                  <div className="flex items-center gap-2">
                    <Sparkles
                      size={16}
                      className="text-blue-600"
                    />
                    Get recommendations
                  </div>

                </div>

              </div>

              {/* HERO VISUAL */}

              <div className="relative">

                <div className="relative aspect-[0.94] overflow-hidden rounded-[38px] bg-slate-100 shadow-[0_35px_90px_rgba(15,23,42,0.16)]">

                  <img
                    src={heroImage}
                    alt="Modern shared living space"
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

                  {/* Floating location card */}

                  <div className="absolute left-5 top-5 max-w-[220px] rounded-2xl border border-white/60 bg-white/90 p-3.5 shadow-xl backdrop-blur-xl sm:left-7 sm:top-7">

                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                        <MapPin size={18} />
                      </div>

                      <div>
                        <div className="text-xs font-medium text-slate-400">
                          Start with
                        </div>

                        <div className="text-sm font-bold text-slate-900">
                          Where you want to live
                        </div>
                      </div>

                    </div>

                  </div>

                  {/* Floating filter card */}

                  <div className="absolute bottom-5 right-5 max-w-[240px] rounded-2xl border border-white/60 bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:bottom-7 sm:right-7">

                    <div className="mb-3 flex items-center justify-between gap-4">

                      <div className="flex items-center gap-2">
                        <SlidersHorizontal
                          size={16}
                          className="text-blue-600"
                        />

                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                          Your search
                        </span>
                      </div>

                      <Check
                        size={16}
                        className="text-blue-600"
                      />

                    </div>

                    <div className="space-y-2">

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Location
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Budget
                      </div>

                      <div className="flex items-center gap-2 text-sm text-slate-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                        Nearby destination
                      </div>

                    </div>

                  </div>

                </div>

                {/* Decorative image strip */}

                <div className="absolute -bottom-8 -left-8 hidden w-44 overflow-hidden rounded-[24px] border-8 border-white shadow-2xl sm:block">

                  <img
                    src={secondaryImage}
                    alt=""
                    className="aspect-square w-full object-cover"
                  />

                </div>

                <div className="absolute -right-5 -top-5 hidden h-28 w-28 overflow-hidden rounded-[24px] border-8 border-white shadow-xl md:block">

                  <img
                    src={tertiaryImage}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                </div>

              </div>

            </div>

          </div>
        </section>

        {/* =====================================================
            DISCOVERY SECTION
        ===================================================== */}

        <section className="border-y border-slate-100 bg-slate-50/70">

          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">

              <div>

                <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Start anywhere
                </div>

                <h2 className="max-w-xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                  Search the way you actually think about living.
                </h2>

              </div>

              <p className="max-w-xl text-base leading-7 text-slate-500 lg:justify-self-end">
                You don't have to know the perfect hostel before you start.
                Begin with the thing that matters most to you and narrow it
                down from there.
              </p>

            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">

              {discoveryCards.map(
                (card, index) => {
                  const Icon = card.icon;

                  return (
                    <button
                      key={card.title}
                      type="button"
                      onClick={card.action}
                      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] sm:p-7"
                    >

                      <div className="flex items-start justify-between gap-5">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                          <Icon size={21} />
                        </div>

                        <ArrowUpRight
                          size={19}
                          className="text-slate-300 transition group-hover:text-blue-600"
                        />

                      </div>

                      <div className="mt-8">

                        <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                          {card.label}
                        </div>

                        <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                          {card.title}
                        </h3>

                        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
                          {card.description}
                        </p>

                      </div>

                      <div className="mt-7 flex items-center gap-2 text-sm font-semibold text-blue-600">
                        Start searching
                        <ArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>

                      <div className="absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-blue-50 opacity-0 transition duration-500 group-hover:opacity-100" />

                    </button>
                  );
                }
              )}

            </div>

          </div>
        </section>

        {/* =====================================================
            SMART MATCH
        ===================================================== */}

        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12 lg:py-32">

          <div className="overflow-hidden rounded-[38px] bg-blue-600">

            <div className="grid lg:grid-cols-[1fr_0.9fr]">

              <div className="relative overflow-hidden p-8 sm:p-12 lg:p-16">

                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10" />

                <div className="relative">

                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white">
                    <Brain size={14} />
                    Personalised discovery
                  </div>

                  <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                    Not sure what to search for?
                  </h2>

                  <p className="mt-5 max-w-xl text-base leading-7 text-blue-100">
                    Tell HostelHub what matters to you. Your preferences can
                    be used to explore options through the recommendation
                    experience.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/recommendations"
                      )
                    }
                    className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    Explore recommendations
                    <ArrowRight size={17} />
                  </button>

                </div>

              </div>

              {/* UI MOCKUP — NO FAKE RESULTS */}

              <div className="relative flex items-center justify-center bg-blue-700 p-8 sm:p-12 lg:p-16">

                <div className="w-full max-w-md rounded-[28px] border border-white/20 bg-white p-5 shadow-2xl">

                  <div className="flex items-center justify-between">

                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Your preferences
                      </div>

                      <div className="mt-1 text-lg font-semibold tracking-tight text-slate-950">
                        What matters to you?
                      </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Sparkles size={18} />
                    </div>

                  </div>

                  <div className="mt-6 space-y-3">

                    {[
                      {
                        icon: MapPin,
                        label: "Location",
                      },
                      {
                        icon: CircleDollarSign,
                        label: "Budget",
                      },
                      {
                        icon: Building2,
                        label: "College or office",
                      },
                      {
                        icon: Bus,
                        label: "Transport",
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.label}
                          className="flex items-center justify-between rounded-2xl border border-slate-200 p-3.5"
                        >

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                              <Icon size={17} />
                            </div>

                            <span className="text-sm font-semibold text-slate-700">
                              {item.label}
                            </span>

                          </div>

                          <ChevronRight
                            size={17}
                            className="text-slate-300"
                          />

                        </div>
                      );
                    })}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/recommendations"
                      )
                    }
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    Build my recommendations
                    <ArrowRight size={16} />
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">

            <div className="mb-12 max-w-2xl">

              <div className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                How it works
              </div>

              <h2 className="text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-5xl">
                From "where should I stay?"
                to a search you can actually use.
              </h2>

            </div>

            <div className="grid gap-4 lg:grid-cols-3">

              {[
                {
                  number: "01",
                  icon: Search,
                  title: "Describe your needs",
                  text: "Enter the area, budget and nearby destination that matter to you.",
                },
                {
                  number: "02",
                  icon: SlidersHorizontal,
                  title: "Refine your search",
                  text: "Use the available search and filtering options to narrow down what you need.",
                },
                {
                  number: "03",
                  icon: Sparkles,
                  title: "Explore your options",
                  text: "Browse the available results or use recommendations when you want more guidance.",
                },
              ].map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="group rounded-[28px] border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.07)]"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-sm font-bold text-slate-300">
                        {step.number}
                      </span>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon size={19} />
                      </div>

                    </div>

                    <h3 className="mt-10 text-xl font-semibold tracking-tight text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      {step.text}
                    </p>

                  </div>
                );
              })}

            </div>

          </div>

        </section>

        {/* =====================================================
            VISUAL FEATURE SECTION
        ===================================================== */}

        <section className="border-y border-slate-100 bg-slate-50/70">

          <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

            <div className="grid items-center gap-14 lg:grid-cols-[1fr_0.9fr] lg:gap-20">

              <div className="relative">

                <div className="overflow-hidden rounded-[38px] shadow-[0_30px_80px_rgba(15,23,42,0.12)]">

                  <img
                    src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=90"
                    alt="People sharing a modern living environment"
                    className="aspect-[1.08] w-full object-cover"
                  />

                </div>

                <div className="absolute -bottom-7 right-5 max-w-[280px] rounded-[24px] border border-slate-200 bg-white p-5 shadow-xl sm:right-8">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <ShieldCheck size={19} />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-slate-950">
                        Make the search yours
                      </div>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Compare places based on the things that matter to
                        your everyday life.
                      </p>
                    </div>

                  </div>

                </div>

              </div>

              <div>

                <div className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                  Designed around you
                </div>

                <h2 className="text-4xl font-semibold leading-[1.05] tracking-[-0.05em] text-slate-950 sm:text-5xl">
                  A hostel search should feel personal, not overwhelming.
                </h2>

                <p className="mt-6 max-w-xl text-base leading-7 text-slate-500">
                  HostelHub is designed around the decisions you actually
                  make when choosing where to live — location, cost,
                  convenience and the places you need to reach every day.
                </p>

                <div className="mt-8 space-y-4">

                  {[
                    "Search around the places that matter to you",
                    "Use budget as a real part of your search",
                    "Explore recommendations when you need guidance",
                    "Keep your preferences at the centre of the experience",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3"
                    >

                      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                        <Check size={13} />
                      </div>

                      <span className="text-sm font-medium leading-6 text-slate-700">
                        {item}
                      </span>

                    </div>
                  ))}

                </div>

                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="mt-9 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700 hover:shadow-lg"
                >
                  Start exploring
                  <ArrowRight size={17} />
                </button>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            OWNER / USER SPLIT
        ===================================================== */}

        <section className="mx-auto max-w-[1400px] px-5 py-20 sm:px-8 lg:px-12 lg:py-28">

          <div className="grid gap-4 lg:grid-cols-2">

            {/* USER */}

            <button
              type="button"
              onClick={() => navigate("/search")}
              className="group rounded-[32px] bg-slate-950 p-8 text-left transition hover:-translate-y-1 sm:p-10"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-blue-400">
                  <Users size={21} />
                </div>

                <ArrowUpRight
                  size={22}
                  className="text-slate-500 transition group-hover:text-white"
                />

              </div>

              <div className="mt-16">

                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  For people looking for a place
                </div>

                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Start your search.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                  Search by location, budget, destination and the things
                  that shape your everyday commute.
                </p>

                <div className="mt-7 flex items-center gap-2 text-sm font-bold text-blue-400">
                  Find a hostel
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>

              </div>

            </button>

            {/* OWNER */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/owner/add-hostel"
                )
              }
              className="group rounded-[32px] border border-slate-200 bg-white p-8 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_25px_60px_rgba(15,23,42,0.08)] sm:p-10"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Building2 size={21} />
                </div>

                <ArrowUpRight
                  size={22}
                  className="text-slate-300 transition group-hover:text-blue-600"
                />

              </div>

              <div className="mt-16">

                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                  For hostel owners
                </div>

                <h3 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">
                  Bring your property to HostelHub.
                </h3>

                <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                  Add your hostel and manage its information through the
                  owner experience.
                </p>

                <div className="mt-7 flex items-center gap-2 text-sm font-bold text-blue-600">
                  Add your hostel
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>

              </div>

            </button>

          </div>

        </section>

        {/* =====================================================
            FINAL CTA
        ===================================================== */}

        <section className="mx-auto max-w-[1400px] px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">

          <div className="relative overflow-hidden rounded-[38px] bg-blue-600 px-7 py-14 text-center sm:px-12 sm:py-20">

            <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-white/10" />

            <div className="relative mx-auto max-w-3xl">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                <House size={21} />
              </div>

              <h2 className="mt-7 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-6xl">
                Your next place starts with a search.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-blue-100">
                Tell us where you want to live, what you want to spend and
                what you need nearby.
              </p>

              <button
                type="button"
                onClick={() => navigate("/search")}
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Find my hostel
                <ArrowRight size={17} />
              </button>

            </div>

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-100 bg-white">

        <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-12">

          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">

            {/* BRAND */}

            <div>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="flex items-center gap-3"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <House size={19} />
                </div>

                <span className="text-lg font-bold tracking-tight text-slate-950">
                  HostelHub
                </span>

              </button>

              <p className="mt-5 max-w-sm text-sm leading-6 text-slate-500">
                A simpler way to discover hostels around the places that
                matter to you.
              </p>

            </div>

            {/* EXPLORE */}

            <div>

              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Explore
              </div>

              <div className="mt-5 space-y-3">

                <button
                  type="button"
                  onClick={() => navigate("/search")}
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Search
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/recommendations"
                    )
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Recommendations
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/locations")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Locations
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/hostels")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Hostels
                </button>

              </div>

            </div>

            {/* COMPANY */}

            <div>

              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Company
              </div>

              <div className="mt-5 space-y-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate("/about")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  About
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/help")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Help
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/contact")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Contact
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/support")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Support
                </button>

              </div>

            </div>

            {/* OWNERS */}

            <div>

              <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Owners
              </div>

              <div className="mt-5 space-y-3">

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/owner/add-hostel"
                    )
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Add a hostel
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/owner/")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Owner portal
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/privacy")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Privacy
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/terms")
                  }
                  className="block text-sm text-slate-600 transition hover:text-blue-600"
                >
                  Terms
                </button>

              </div>

            </div>

          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-slate-100 pt-6 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">

            <div>
              © {new Date().getFullYear()} HostelHub. All rights reserved.
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={14}
                className="text-blue-600"
              />
              Built around your search.
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Home;