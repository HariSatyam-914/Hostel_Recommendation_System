import React from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  Search,
  MessageCircle,
  Mail,
  Phone,
  HelpCircle,
  Clock3,
  ChevronDown,
  Menu,
  X,
  Building2,
  ShieldCheck,
  MapPin,
  UserCircle,
  Send,
  CheckCircle2,
  FileText,
  LifeBuoy,
  ExternalLink,
  Headphones,
  BookOpen,
  LogOut,
} from "lucide-react";

const HelpContact = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    React.useState(false);

  const [openFaq, setOpenFaq] =
    React.useState(null);

  const [formSubmitted, setFormSubmitted] =
    React.useState(false);

  const [profileOpen, setProfileOpen] =
    React.useState(false);

  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

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
      question: "How do I find a hostel on HostelHub?",
      answer:
        "You can search and compare hostels using location, budget, room type, amenities and other preferences. Choose the options that best match your daily needs and explore their details.",
    },
    {
      question: "How can I contact a hostel owner?",
      answer:
        "Open the hostel listing and review the available contact information and communication options provided for that property.",
    },
    {
      question: "How can I list my hostel?",
      answer:
        "Create an owner account and complete the hostel details, room information, amenities, pricing and photographs. Once submitted, the listing goes through the platform's review process.",
    },
    {
      question: "What happens after I submit my hostel?",
      answer:
        "Your hostel enters the approval process. The submitted information, photographs and required verification details are reviewed before the hostel can be approved.",
    },
    {
      question: "I forgot my password. What should I do?",
      answer:
        "Use the password reset option on the login page and follow the verification steps sent to your registered email address.",
    },
  ];

  const contactCards = [
    {
      icon: MessageCircle,
      title: "Live Support",
      description:
        "Get help with finding hostels, accounts and general platform questions.",
      action: "Start a conversation",
      detail: "Usually replies within a few minutes",
    },
    {
      icon: Mail,
      title: "Email Support",
      description:
        "Send us a detailed message and our support team will get back to you.",
      action: "support@hostelhub.com",
      detail: "Available every day",
    },
    {
      icon: Phone,
      title: "Phone Support",
      description:
        "Talk directly with our support team when you need immediate assistance.",
      action: "+91 98765 43210",
      detail: "10:00 AM – 6:00 PM",
    },
  ];

  const topics = [
    {
      icon: Search,
      title: "Finding a hostel",
      text: "Search, filters, locations and recommendations",
    },
    {
      icon: UserCircle,
      title: "Account & login",
      text: "Registration, password reset and account access",
    },
    {
      icon: Building2,
      title: "Hostel owners",
      text: "Listings, rooms, photos and approval process",
    },
    {
      icon: ShieldCheck,
      title: "Verification",
      text: "Owner verification and listing review",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq((prev) =>
      prev === index ? null : index
    );
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (formSubmitted) {
      setFormSubmitted(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    console.log(
      "Support Request:",
      formData
    );

    setFormSubmitted(true);

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#111827]">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-xl">

        <div className="mx-auto flex h-[76px] max-w-[1380px] items-center justify-between px-5 sm:px-7 lg:px-10">

          {/* Logo */}

          <button
            type="button"
            onClick={() =>
              navigate("/")
            }
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
              onClick={() =>
                navigate("/home")
              }
              className="text-sm font-medium text-gray-500 transition hover:text-black"
            >
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/search")
              }
              className="text-sm font-medium text-gray-500 transition hover:text-black"
            >
              Search
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/about")
              }
              className="text-sm font-medium text-gray-500 transition hover:text-black"
            >
              About
            </button>

            <button
              type="button"
              className="text-sm font-semibold text-black"
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
                  onClick={() =>
                    navigate("/")
                  }
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-black"
                >
                  Log in
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/register")
                  }
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

                  {/* Name + role */}

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

                {/* Profile Dropdown */}

                {profileOpen && (

                  <div className="absolute right-0 top-full z-50 mt-3 w-[285px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

                    {/* Profile Header */}

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

                    {/* Profile Details */}

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
                        onClick={
                          handleLogout
                        }
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

          {/* Mobile menu */}

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

        {/* Mobile navigation */}

        {mobileMenuOpen && (

          <div className="border-t border-gray-100 bg-white px-5 py-5 md:hidden">

            <div className="space-y-1">

              {[
                ["Home", "/"],
                ["Find a Hostel", "/hostels"],
                ["About", "/about"],
                ["Help & Contact", "/help"],
              ].map(
                ([label, path]) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(
                        false
                      );

                      navigate(path);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold ${
                      label ===
                      "Help & Contact"
                        ? "bg-[#2161F5] text-white"
                        : "text-gray-700 transition hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    {label}

                    <ArrowRight
                      size={16}
                    />

                  </button>
                )
              )}

              {/* Mobile User Profile */}

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
                        setMobileMenuOpen(
                          false
                        );

                        handleLogout();
                      }}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut
                        size={16}
                      />

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
          MAIN
      ========================================================= */}

      <main>

        {/* =======================================================
            SUPPORT HERO
        ======================================================= */}

        <section className="border-b border-gray-100 bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-14 sm:px-7 sm:py-18 lg:px-10 lg:py-20">

            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">

              {/* Intro */}

              <div>

                <div className="mb-5 flex items-center gap-2">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5]">
                    <LifeBuoy
                      size={19}
                    />
                  </div>

                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2161F5]">
                    Help Center
                  </span>

                </div>

                <h1 className="max-w-[650px] text-[48px] font-semibold leading-[0.97] tracking-[-0.055em] text-black sm:text-[64px] lg:text-[72px]">
                  How can we
                  <span className="block text-gray-300">
                    help you?
                  </span>
                </h1>

                <p className="mt-6 max-w-[560px] text-base leading-7 text-gray-500">
                  Search our help center or choose a topic below to quickly
                  find the information you need.
                </p>

              </div>

              {/* Search panel */}

              <div className="rounded-[30px] bg-blue-50 p-5 sm:p-7">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#2161F5] shadow-sm">
                    <Search size={20} />
                  </div>

                  <div>

                    <p className="text-sm font-semibold text-black">
                      Search Help Center
                    </p>

                    <p className="text-xs text-gray-400">
                      Find answers to common questions
                    </p>

                  </div>

                </div>

                <div className="relative mt-5">

                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-28 text-sm text-black shadow-sm outline-none transition placeholder:text-gray-400 focus:border-[#2161F5] focus:ring-4 focus:ring-white"
                  />

                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-xl bg-[#2161F5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174dcc]"
                  >
                    Search
                  </button>

                </div>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">

                  <span className="text-gray-400">
                    Popular:
                  </span>

                  <button
                    type="button"
                    className="font-medium text-[#2161F5] hover:underline"
                  >
                    Password reset
                  </button>

                  <button
                    type="button"
                    className="font-medium text-[#2161F5] hover:underline"
                  >
                    Owner verification
                  </button>

                  <button
                    type="button"
                    className="font-medium text-[#2161F5] hover:underline"
                  >
                    Hostel approval
                  </button>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            HELP CATEGORIES
        ======================================================= */}

        <section className="bg-gray-50/70">

          <div className="mx-auto max-w-[1380px] px-5 py-16 sm:px-7 sm:py-20 lg:px-10 lg:py-24">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2161F5]">
                  Browse by topic
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-black sm:text-4xl">
                  What can we help with?
                </h2>

              </div>

              <p className="max-w-[400px] text-sm leading-6 text-gray-500">
                Choose the area closest to your question and get to the right
                information faster.
              </p>

            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              {topics.map((topic) => {

                const Icon = topic.icon;

                return (
                  <button
                    key={topic.title}
                    type="button"
                    className="group rounded-[24px] border border-gray-200 bg-white p-6 text-left transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_45px_rgba(33,97,245,0.08)]"
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5] transition group-hover:bg-[#2161F5] group-hover:text-white">
                        <Icon size={19} />
                      </div>

                      <ArrowUpRight
                        size={18}
                        className="text-gray-300 transition group-hover:text-[#2161F5]"
                      />

                    </div>

                    <h3 className="mt-7 text-base font-semibold text-black">
                      {topic.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {topic.text}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2161F5]">
                      View help

                      <ArrowRight
                        size={14}
                      />

                    </div>

                  </button>
                );
              })}

            </div>

          </div>

        </section>

        {/* =======================================================
            CONTACT METHODS
        ======================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10">

            <div className="grid gap-12 lg:grid-cols-[0.52fr_1.48fr] lg:items-start">

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2161F5] text-white">
                  <Headphones
                    size={21}
                  />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#2161F5]">
                  Need a person?
                </p>

                <h2 className="mt-4 text-4xl font-semibold leading-[1.03] tracking-[-0.04em] text-black sm:text-5xl">
                  We are here to listen.
                </h2>

                <p className="mt-5 max-w-[390px] text-sm leading-7 text-gray-500">
                  Choose the support channel that is most convenient for you.
                </p>

                <div className="mt-7 flex items-center gap-2 text-xs text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Support team currently online
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-3">

                {contactCards.map((card) => {

                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-[26px] border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-[0_18px_50px_rgba(33,97,245,0.08)]"
                    >

                      <div className="flex items-center justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5]">
                          <Icon size={19} />
                        </div>

                        <ArrowUpRight
                          size={17}
                          className="text-gray-300"
                        />

                      </div>

                      <h3 className="mt-7 text-lg font-semibold text-black">
                        {card.title}
                      </h3>

                      <p className="mt-3 text-sm leading-6 text-gray-500">
                        {card.description}
                      </p>

                      <div className="mt-7 border-t border-gray-100 pt-5">

                        <p className="text-sm font-semibold text-[#2161F5]">
                          {card.action}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          {card.detail}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            FAQ + SUPPORT SIDE PANEL
        ======================================================= */}

        <section className="bg-gray-50/70">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10">

            <div className="grid gap-10 lg:grid-cols-[1.35fr_0.65fr]">

              {/* FAQ */}

              <div>

                <div className="mb-8">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2161F5]">
                    Frequently asked
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-black sm:text-4xl">
                    Answers to common questions
                  </h2>

                </div>

                <div className="rounded-[28px] border border-gray-200 bg-white px-5 sm:px-7">

                  {faqs.map((faq, index) => {

                    const isOpen =
                      openFaq === index;

                    return (
                      <div
                        key={faq.question}
                        className="border-b border-gray-100 last:border-b-0"
                      >

                        <button
                          type="button"
                          onClick={() =>
                            toggleFaq(index)
                          }
                          className="flex w-full items-center justify-between gap-5 py-5 text-left"
                        >

                          <span className="text-sm font-semibold text-black sm:text-base">
                            {faq.question}
                          </span>

                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#2161F5] transition-transform ${
                              isOpen
                                ? "rotate-180"
                                : ""
                            }`}
                          >
                            <ChevronDown
                              size={16}
                            />
                          </span>

                        </button>

                        {isOpen && (
                          <div className="max-w-[780px] pb-6 pr-6">

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

              {/* Helpful panel */}

              <div>

                <div className="rounded-[28px] bg-[#2161F5] p-7 text-white">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#2161F5]">
                    <BookOpen
                      size={20}
                    />
                  </div>

                  <p className="mt-8 text-xs font-semibold uppercase tracking-[0.15em] text-white/65">
                    Helpful resources
                  </p>

                  <h3 className="mt-3 text-2xl font-semibold tracking-tight">
                    Looking for something specific?
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-white/75">
                    Explore HostelHub or start with one of our main support
                    areas.
                  </p>

                  <div className="mt-7 space-y-2">

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/hostels")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15"
                    >
                      Find a Hostel

                      <ArrowRight
                        size={16}
                      />

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/about")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/15"
                    >
                      About HostelHub

                      <ArrowRight
                        size={16}
                      />

                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/register")
                      }
                      className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-3 text-left text-sm font-semibold text-[#2161F5] transition hover:bg-blue-50"
                    >
                      Create an account

                      <ArrowRight
                        size={16}
                      />

                    </button>

                  </div>

                </div>

                <div className="mt-4 rounded-[28px] border border-gray-200 bg-white p-6">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5]">
                      <Clock3
                        size={18}
                      />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-black">
                        Support hours
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Monday – Sunday
                        <br />
                        10:00 AM – 6:00 PM
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            CONTACT FORM
        ======================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 py-20 sm:px-7 sm:py-24 lg:px-10">

            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">

              {/* Form intro */}

              <div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#2161F5]">
                  <MessageCircle
                    size={21}
                  />
                </div>

                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#2161F5]">
                  Contact support
                </p>

                <h2 className="mt-4 text-4xl font-semibold leading-[1.03] tracking-[-0.045em] text-black sm:text-5xl">
                  Tell us what is going on.
                </h2>

                <p className="mt-6 max-w-[430px] text-base leading-7 text-gray-500">
                  Send us a message and our support team will help you figure
                  out the next step.
                </p>

                <div className="mt-9 space-y-4">

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5]">
                      <CheckCircle2
                        size={17}
                      />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-black">
                        Clear answers
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        We will review your question and point you in the right
                        direction.
                      </p>

                    </div>

                  </div>

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2161F5]">
                      <FileText
                        size={17}
                      />
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-black">
                        Useful details help
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-400">
                        Include your account email, hostel name or issue where
                        relevant.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

              {/* Form */}

              <div className="rounded-[30px] border border-gray-200 bg-white p-6 shadow-[0_18px_60px_rgba(0,0,0,0.05)] sm:p-8">

                {formSubmitted ? (

                  <div className="flex min-h-[500px] flex-col items-center justify-center text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#2161F5]">
                      <CheckCircle2
                        size={31}
                      />
                    </div>

                    <h3 className="mt-6 text-2xl font-semibold text-black">
                      Message sent successfully.
                    </h3>

                    <p className="mt-3 max-w-[440px] text-sm leading-6 text-gray-500">
                      Thanks for contacting HostelHub. Our support team will
                      review your message and get back to you.
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setFormSubmitted(
                          false
                        )
                      }
                      className="mt-7 rounded-full bg-[#2161F5] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#174dcc]"
                    >
                      Send another message
                    </button>

                  </div>

                ) : (

                  <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >

                    <div className="grid gap-5 sm:grid-cols-2">

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Name
                        </label>

                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange(
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Your name"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#2161F5] focus:ring-4 focus:ring-blue-50"
                        />

                      </div>

                      <div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Email
                        </label>

                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            handleInputChange(
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="you@example.com"
                          required
                          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition placeholder:text-gray-400 focus:border-[#2161F5] focus:ring-4 focus:ring-blue-50"
                        />

                      </div>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Subject
                      </label>

                      <select
                        value={formData.subject}
                        onChange={(e) =>
                          handleInputChange(
                            "subject",
                            e.target.value
                          )
                        }
                        required
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[#2161F5] focus:ring-4 focus:ring-blue-50"
                      >

                        <option value="">
                          Select a topic
                        </option>

                        <option value="Finding a hostel">
                          Finding a hostel
                        </option>

                        <option value="Account & Login">
                          Account & Login
                        </option>

                        <option value="Hostel listing">
                          Hostel listing
                        </option>

                        <option value="Verification">
                          Verification
                        </option>

                        <option value="Technical issue">
                          Technical issue
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                    <div>

                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Message
                      </label>

                      <textarea
                        value={formData.message}
                        onChange={(e) =>
                          handleInputChange(
                            "message",
                            e.target.value
                          )
                        }
                        placeholder="Tell us how we can help..."
                        rows={7}
                        required
                        className="w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-black outline-none transition placeholder:text-gray-400 focus:border-[#2161F5] focus:ring-4 focus:ring-blue-50"
                      />

                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                      <p className="max-w-[390px] text-xs leading-5 text-gray-400">
                        By submitting this form, you are sending your support
                        request to HostelHub.
                      </p>

                      <button
                        type="submit"
                        className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#2161F5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174dcc]"
                      >
                        Send message

                        <Send
                          size={16}
                          className="transition-transform group-hover:translate-x-0.5"
                        />

                      </button>

                    </div>

                  </form>

                )}

              </div>

            </div>

          </div>

        </section>

        {/* =======================================================
            FINAL CTA
        ======================================================= */}

        <section className="bg-white">

          <div className="mx-auto max-w-[1380px] px-5 pb-20 sm:px-7 sm:pb-24 lg:px-10 lg:pb-28">

            <div className="flex flex-col gap-8 rounded-[30px] border border-blue-100 bg-blue-50 p-7 sm:p-10 lg:flex-row lg:items-center lg:justify-between lg:p-12">

              <div>

                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2161F5]">
                  Still exploring?
                </p>

                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] text-black sm:text-4xl">
                  Let us help you find your next place.
                </h2>

                <p className="mt-3 text-sm leading-6 text-gray-500">
                  Explore hostels that match your budget, location and lifestyle.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/hostels")
                }
                className="group inline-flex w-fit shrink-0 items-center gap-2 rounded-full bg-[#2161F5] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#174dcc]"
              >
                Explore hostels

                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />

              </button>

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
                onClick={() =>
                  navigate("/")
                }
                className="transition hover:text-black"
              >
                Home
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/hostels")
                }
                className="transition hover:text-black"
              >
                Hostels
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/about")
                }
                className="transition hover:text-black"
              >
                About
              </button>

              <button
                type="button"
                className="font-semibold text-black"
              >
                Help & Contact
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

export default HelpContact;