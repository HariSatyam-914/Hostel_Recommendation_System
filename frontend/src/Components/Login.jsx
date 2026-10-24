import React, { useEffect, useState } from "react";

import { FaEye, FaEyeSlash } from "react-icons/fa";

import {
  registerUser,
  loginUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  getOwnerHostelStatus,
} from "../services/authService";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

import { Link } from "react-router-dom";

function Login({ setUser }) {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    password: "",
    confirmPassword: "",
    hostelOwner: false,
  });


  /* ============================================================
     OTP STATE

     OTP is ONLY used for NEW REGISTRATION.

     null       -> normal login/register form
     "register" -> registration OTP verification
  ============================================================ */

  const [otpMode, setOtpMode] = useState(null);

  const [otp, setOtp] = useState("");

  const [otpEmail, setOtpEmail] = useState("");

  const [otpLoading, setOtpLoading] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);

  const [resendCountdown, setResendCountdown] = useState(0);


  /*
   * Stores the response received before registration
   * OTP verification.
   *
   * This preserves the user's role/name/email while
   * waiting for OTP verification.
   */

  const [pendingAuthData, setPendingAuthData] = useState(null);


  /* ============================================================
     OTP RESEND COUNTDOWN
  ============================================================ */

  useEffect(() => {

    if (resendCountdown <= 0) {
      return;
    }

    const timer = setInterval(() => {

      setResendCountdown((previous) =>
        previous > 0 ? previous - 1 : 0
      );

    }, 1000);

    return () => clearInterval(timer);

  }, [resendCountdown]);


  /* ============================================================
     LOGIN INPUT
  ============================================================ */

  const handleLoginChange = (e) => {

    const { name, value, type, checked } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  /* ============================================================
     REGISTER INPUT
  ============================================================ */

  const handleRegisterChange = (e) => {

    const { name, value, type, checked } = e.target;

    // Phone number validation
    if (name === "phoneNo") {

      // Allow only numbers and maximum 10 digits
      const numericValue = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setRegisterData((prev) => ({
        ...prev,
        phoneNo: numericValue,
      }));

      return;
    }

    setRegisterData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  /* ============================================================
     SAVE AUTHENTICATED USER
  ============================================================ */

  const saveAuthenticatedUser = (userData) => {

    if (userData?.token) {
      localStorage.setItem("token", userData.token);
    }

    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };


  /* ============================================================
     CLEAR OTP STATE
  ============================================================ */

  const clearOtpState = () => {

    setOtpMode(null);

    setOtp("");

    setOtpEmail("");

    setOtpLoading(false);

    setResendLoading(false);

    setResendCountdown(0);

    setPendingAuthData(null);
  };


  /* ============================================================
     OWNER ROUTING

     Existing owner flow is kept unchanged.
  ============================================================ */

  const navigateOwner = async () => {

    try {

      console.log(
        "========== OWNER APPROVAL CHECK =========="
      );

      const hostelResponse =
        await getOwnerHostelStatus();

      console.log(
        "Response:",
        hostelResponse
      );

      console.log(
        "Response data:",
        hostelResponse.data
      );

      const status =
        hostelResponse.data?.status;

      const hostelId =
        hostelResponse.data?.hostelId;

      console.log("Status:", status);

      console.log("Hostel ID:", hostelId);

      switch (status) {

        case "OWNER_VERIFICATION_PENDING": {

          const hostelId =
            hostelResponse.data?.hostelId;

          if (!hostelId) {

            console.error(
              "OWNER_VERIFICATION_PENDING but hostelId is missing"
            );

            toast.error(
              "Hostel ID is missing. Please contact support."
            );

            navigate(
              "/owner/add-hostel",
              {
                replace: true,
              }
            );

            break;
          }

          navigate(
            `/owner/email-verification/${hostelId}`,
            {
              replace: true,
            }
          );

          break;
        }

        case "PENDING":

          navigate(
            "/owner/approval-pending",
            {
              replace: true,
            }
          );

          break;

        case "APPROVED":

          navigate(
            "/owner/dashboard",
            {
              replace: true,
            }
          );

          break;

        case "REJECTED":

          navigate(
            "/owner/add-hostel",
            {
              replace: true,
            }
          );

          break;

        case "SUSPENDED":

          navigate(
            "/owner/approval-pending",
            {
              replace: true,
            }
          );

          break;

        case "DRAFT":

        case null:

        case undefined:

          navigate(
            "/owner/add-hostel",
            {
              replace: true,
            }
          );

          break;

        default:

          console.warn(
            "Unknown owner hostel status:",
            status
          );

          navigate(
            "/owner/add-hostel",
            {
              replace: true,
            }
          );

          break;
      }

    } catch (error) {

      console.error(
        "========== OWNER APPROVAL CHECK FAILED =========="
      );

      console.error(error);

      console.error(
        "Response:",
        error.response?.data
      );

      navigate(
        "/owner/add-hostel",
        {
          replace: true,
        }
      );
    }
  };


  /* ============================================================
     AUTHENTICATED USER ROUTING
  ============================================================ */

  const navigateAfterAuthentication = async (
    userData
  ) => {

    switch (userData?.role) {

      case "USER":

        navigate("/home");

        break;

      case "OWNER":

        await navigateOwner();

        break;

      case "ADMIN":

        navigate("/admin/dashboard");

        break;

      default:

        navigate("/");

    }
  };


  /* ============================================================
     LOGIN

     IMPORTANT:
     Login does NOT use OTP anymore.

     Existing USER / OWNER / ADMIN accounts go directly
     to their respective pages after successful login.
  ============================================================ */

  const loginSubmit = async (e) => {

    e.preventDefault();

    try {

      const response =
        await loginUser(loginData);

      const data = response.data;


      // =====================================================
      // LOGIN MUST RETURN JWT DIRECTLY
      // =====================================================

      if (data?.token) {

        saveAuthenticatedUser(data);

        toast.success(
          data.message || "Login Successful",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );

        await navigateAfterAuthentication(data);

        return;
      }


      // =====================================================
      // UNVERIFIED NEW REGISTRATION
      // =====================================================
      // This is only possible if an account was registered
      // but its registration OTP was never verified.
      //
      // It is NOT a login OTP.
      // =====================================================

      if (
        data?.otpRequired === true
      ) {

        setPendingAuthData(data);

        setOtpEmail(
          data.email || loginData.email
        );

        setOtpMode("register");

        setOtp("");

        setResendCountdown(60);

        toast.info(
          data.message ||
            "Please verify your registration email.",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );

        return;
      }


      toast.error(
        data?.message ||
          "Login failed.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          "Login Failed",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    }
  };


  /* ============================================================
     REGISTER

     NEW USER / OWNER:
     Registration -> OTP -> Authentication
  ============================================================ */

  const registerSubmit = async (e) => {

    e.preventDefault();


    // Phone number validation

    if (!/^\d{10}$/.test(registerData.phoneNo)) {

      toast.error(
        "Phone number must contain exactly 10 digits",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

      return;
    }


    // Password validation

    if (
      registerData.password !==
      registerData.confirmPassword
    ) {

      toast.error(
        "Passwords do not match",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

      return;
    }


    try {

      const response =
        await registerUser(registerData);

      const data = response.data;


      /* =======================================================
         REGISTRATION OTP
      ======================================================= */

      if (
        data?.otpRequired === true ||
        data?.message === "OTP_SENT" ||
        data?.message ===
          "OTP sent successfully" ||
        data?.message ===
          "Registration OTP sent"
      ) {

        setPendingAuthData(data);

        setOtpEmail(
          data.email || registerData.email
        );

        setOtpMode("register");

        setOtp("");

        setResendCountdown(60);

        toast.success(
          "Registration successful. OTP sent to your email.",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );

        return;
      }


      /* =======================================================
         BACKWARD COMPATIBILITY
      ======================================================= */

      if (data?.token) {

        saveAuthenticatedUser(data);

        toast.success(
          data.message ||
            "Registration Successful",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );

        await navigateAfterAuthentication(data);

        return;
      }


      /* =======================================================
         FALLBACK
      ======================================================= */

      setPendingAuthData(data);

      setOtpEmail(
        data?.email || registerData.email
      );

      setOtpMode("register");

      setOtp("");

      setResendCountdown(60);

      toast.success(
        "Registration successful. Please verify your email with the OTP.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          "Registration Failed",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
    }
  };


  /* ============================================================
     OTP INPUT

     Registration OTP only.
  ============================================================ */

  const handleOtpChange = (e) => {

    const numericValue = e.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(numericValue);
  };


  /* ============================================================
     VERIFY REGISTRATION OTP
  ============================================================ */

  const verifyOtpSubmit = async (e) => {

    e.preventDefault();


    if (!/^\d{6}$/.test(otp)) {

      toast.error(
        "Please enter the 6-digit OTP.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

      return;
    }


    if (!otpEmail) {

      toast.error(
        "Email address is missing. Please try again.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

      return;
    }


    setOtpLoading(true);

    try {

      const response =
        await verifyRegistrationOtp({
          email: otpEmail,
          otp: otp,
        });

      const data = response.data;


      if (!data?.token) {

        toast.error(
          data?.message ||
            "OTP verified, but authentication token was not returned.",
          {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          }
        );

        return;
      }


      saveAuthenticatedUser(data);


      toast.success(
        data.message ||
          "Email verified successfully.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );


      const authenticatedData = {
        ...pendingAuthData,
        ...data,
      };


      clearOtpState();


      await navigateAfterAuthentication(
        authenticatedData
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          "Invalid or expired OTP.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

    } finally {

      setOtpLoading(false);
    }
  };


  /* ============================================================
     RESEND REGISTRATION OTP
  ============================================================ */

  const handleResendOtp = async () => {

    if (resendCountdown > 0) {
      return;
    }


    if (!otpEmail) {

      toast.error(
        "Email address is missing.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

      return;
    }


    setResendLoading(true);

    try {

      const response =
        await resendRegistrationOtp({
          email: otpEmail,
        });

      const data = response.data;


      setResendCountdown(60);

      setOtp("");


      toast.success(
        data?.message ||
          "A new OTP has been sent to your email.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
          error.response?.data ||
          "Unable to resend OTP.",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );

    } finally {

      setResendLoading(false);
    }
  };


  /* ============================================================
     BACK TO AUTH FORM
  ============================================================ */

  const handleBackFromOtp = () => {

    clearOtpState();
  };


  /* ============================================================
     GOOGLE
  ============================================================ */

  const handleGoogleSignIn = () => {
  window.location.href =
    "http://localhost:8080/oauth2/authorization/google";
};


  return (
    <div className="min-h-screen w-full bg-[#f5f7fb] font-sans text-slate-900 flex items-center justify-center p-0 sm:p-4 lg:p-6">

      {/* ================= MAIN CONTAINER ================= */}

      <div className="w-full max-w-[1450px] min-h-screen sm:min-h-[760px] lg:min-h-[850px] bg-white rounded-none sm:rounded-[28px] overflow-hidden shadow-none sm:shadow-[0_30px_90px_rgba(15,23,42,0.12)] grid lg:grid-cols-[0.95fr_1.05fr]">

        {/* =========================================================
            LEFT VISUAL PANEL
        ========================================================= */}

        <div className="relative hidden lg:flex overflow-hidden bg-[#101828]">

          {/* Background image */}

          <div
            className="absolute inset-0 bg-cover bg-center scale-[1.02]"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1800&q=90')",
            }}
          />

          {/* Dark gradient */}

          <div className="absolute inset-0 bg-gradient-to-b from-[#07111f]/70 via-[#0b1b32]/45 to-[#07111f]/95" />

          {/* Soft blue glow */}

          <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex flex-col justify-between w-full h-full p-10 xl:p-14">

            {/* ================= BRAND ================= */}

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="h-11 w-11 rounded-2xl bg-white/15 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-lg">

                  <div className="h-5 w-5 rounded-md bg-white rotate-45" />

                </div>

                <div>

                  <div className="text-white text-xl font-bold tracking-tight">

                    FindMyHostel

                  </div>

                  <div className="text-white/55 text-[10px] uppercase tracking-[0.22em] mt-0.5">

                    Stay smarter

                  </div>

                </div>

              </div>

              <div className="rounded-full border border-white/15 bg-white/10 backdrop-blur-md px-4 py-2">

                <span className="text-[11px] font-medium text-white/80">

                  Trusted platform

                </span>

              </div>

            </div>


            {/* ================= HERO CONTENT ================= */}

            <div className="max-w-xl">

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/15 backdrop-blur-md px-3 py-1.5 mb-6">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span className="text-[11px] text-white/80 font-medium">

                  Find your next place to stay

                </span>

              </div>

              <h1 className="text-5xl xl:text-6xl font-semibold tracking-[-0.04em] text-white leading-[1.04]">

                Find a place

                <br />

                that feels like

                <br />

                <span className="text-blue-300">

                  home.

                </span>

              </h1>

              <p className="mt-6 max-w-md text-sm xl:text-base leading-7 text-white/65">

                Discover verified hostels, compare amenities,

                explore locations and find the right place for

                your next chapter.

              </p>


              {/* ================= MINI FEATURES ================= */}

              <div className="mt-9 grid grid-cols-3 gap-3 max-w-lg">

                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">

                  <div className="text-white font-semibold text-lg">

                    1K+

                  </div>

                  <div className="text-white/50 text-[11px] mt-1">

                    Hostels

                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">

                  <div className="text-white font-semibold text-lg">

                    50+

                  </div>

                  <div className="text-white/50 text-[11px] mt-1">

                    Cities

                  </div>

                </div>

                <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-md p-4">

                  <div className="text-white font-semibold text-lg">

                    24/7

                  </div>

                  <div className="text-white/50 text-[11px] mt-1">

                    Support

                  </div>

                </div>

              </div>

            </div>


            {/* ================= BOTTOM ================= */}

            <div className="flex items-center justify-between gap-5">

              <div className="flex items-center gap-3">

                <div className="flex -space-x-2">

                  <div className="h-8 w-8 rounded-full border-2 border-[#17263c] bg-slate-300 flex items-center justify-center text-[9px] font-bold text-slate-700">

                    A

                  </div>

                  <div className="h-8 w-8 rounded-full border-2 border-[#17263c] bg-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-700">

                    R

                  </div>

                  <div className="h-8 w-8 rounded-full border-2 border-[#17263c] bg-slate-400 flex items-center justify-center text-[9px] font-bold text-white">

                    S

                  </div>

                  <div className="h-8 w-8 rounded-full border-2 border-[#17263c] bg-blue-500 flex items-center justify-center text-[9px] font-bold text-white">

                    +

                  </div>

                </div>

                <div>

                  <div className="text-white text-xs font-medium">

                    Built for modern living

                  </div>

                  <div className="text-white/45 text-[10px] mt-0.5">

                    Students & professionals

                  </div>

                </div>

              </div>

              <div className="text-[10px] text-white/40">

                © 2026 FindMyHostel

              </div>

            </div>

          </div>

        </div>


        {/* =========================================================
            RIGHT AUTH PANEL
        ========================================================= */}

        <div className="relative flex flex-col min-h-screen lg:min-h-0 bg-white">

          {/* Mobile brand */}

          <div className="lg:hidden flex items-center justify-between px-6 py-5 border-b border-slate-100">

            <div className="flex items-center gap-2.5">

              <div className="h-9 w-9 rounded-xl bg-[#111827] flex items-center justify-center">

                <div className="h-4 w-4 rounded-[4px] bg-white rotate-45" />

              </div>

              <div>

                <div className="font-bold text-slate-900 tracking-tight">

                  FindMyHostel

                </div>

                <div className="text-[9px] uppercase tracking-[0.18em] text-slate-400">

                  Stay smarter

                </div>

              </div>

            </div>

          </div>


          <div className="flex-1 flex items-center justify-center px-5 py-8 sm:px-10 lg:px-12 xl:px-20 overflow-y-auto">

            <div className="w-full max-w-[480px]">


              {/* =====================================================
                  REGISTRATION OTP VERIFICATION ONLY
              ===================================================== */}

              {otpMode === "register" ? (

                <div>

                  {/* Top label */}

                  <div className="mb-7">

                    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 uppercase tracking-[0.16em] mb-3">

                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                      Email verification

                    </div>

                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.035em] text-slate-950">

                      Verify your account.

                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">

                      Enter the 6-digit OTP sent to

                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800 break-all">

                      {otpEmail}

                    </p>

                  </div>


                  {/* OTP form */}

                  <form
                    onSubmit={verifyOtpSubmit}
                    className="space-y-5"
                  >

                    {/* OTP */}

                    <div>

                      <label className="block text-sm font-medium text-slate-700 mb-2">

                        Verification code

                      </label>

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="Enter 6-digit OTP"
                        autoFocus
                        className="w-full h-14 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-center text-xl font-semibold tracking-[0.45em] text-slate-900 placeholder-slate-400 placeholder:tracking-normal outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />

                    </div>


                    {/* Verify */}

                    <button
                      type="submit"
                      disabled={
                        otpLoading ||
                        otp.length !== 6
                      }
                      className="group w-full h-13 rounded-2xl bg-[#111827] hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-300 shadow-[0_10px_30px_rgba(17,24,39,0.16)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2"
                    >

                      {otpLoading
                        ? "Verifying..."
                        : "Verify OTP"}

                      {!otpLoading && (

                        <span className="transition-transform duration-200 group-hover:translate-x-1">

                          →

                        </span>

                      )}

                    </button>


                    {/* Resend */}

                    <div className="text-center pt-1">

                      <p className="text-sm text-slate-500">

                        Didn't receive the code?

                      </p>

                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={
                          resendLoading ||
                          resendCountdown > 0
                        }
                        className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 disabled:cursor-not-allowed transition"
                      >

                        {resendLoading
                          ? "Sending..."
                          : resendCountdown > 0
                          ? `Resend OTP in ${resendCountdown}s`
                          : "Resend OTP"}

                      </button>

                    </div>


                    {/* Back */}

                    <button
                      type="button"
                      onClick={handleBackFromOtp}
                      className="w-full h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold text-sm transition"
                    >

                      ← Back

                    </button>

                  </form>


                  {/* Security note */}

                  <div className="mt-7 p-4 rounded-2xl bg-slate-50 border border-slate-100">

                    <div className="flex items-start gap-3">

                      <div className="mt-0.5 h-7 w-7 rounded-xl bg-emerald-100 flex items-center justify-center">

                        <span className="text-emerald-600 text-xs">

                          ✓

                        </span>

                      </div>

                      <div>

                        <div className="text-xs font-semibold text-slate-700">

                          Secure verification

                        </div>

                        <div className="text-[11px] leading-5 text-slate-500 mt-1">

                          Your verification code expires
                          after a short period. Never share
                          your OTP with anyone.

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                <>

                  {/* ================= TOP LABEL ================= */}

                  <div className="mb-7">

                    <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-600 uppercase tracking-[0.16em] mb-3">

                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />

                      FindMyHostel

                    </div>

                    <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.035em] text-slate-950">

                      {activeTab === "login"
                        ? "Welcome back."
                        : "Create your account."}

                    </h2>

                    <p className="mt-2 text-sm leading-6 text-slate-500">

                      {activeTab === "login"
                        ? "Sign in to continue to your FindMyHostel account."
                        : "Join FindMyHostel and discover a better way to find your stay."}

                    </p>

                  </div>


                  {/* ================= TAB SWITCHER ================= */}

                  <div className="p-1 bg-slate-100 rounded-2xl flex mb-7">

                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("login")
                      }
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        activeTab === "login"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >

                      Sign in

                    </button>


                    <button
                      type="button"
                      onClick={() =>
                        setActiveTab("register")
                      }
                      className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        activeTab === "register"
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >

                      Create account

                    </button>

                  </div>


                  {/* =====================================================
                      LOGIN FORM
                  ===================================================== */}

                  {activeTab === "login" && (

                    <form
                      onSubmit={loginSubmit}
                      className="space-y-5"
                    >

                      {/* Email */}

                      <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">

                          Email address

                        </label>

                        <div className="relative">

                          <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@example.com"
                            value={loginData.email}
                            onChange={handleLoginChange}
                            className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                        </div>

                      </div>


                      {/* Password */}

                      <div>

                        <div className="flex items-center justify-between mb-2">

                          <label className="block text-sm font-medium text-slate-700">

                            Password

                          </label>

                          <Link
                            to="/forgot-password"
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                          >

                            Forgot password?

                          </Link>

                        </div>


                        <div className="relative">

                          <input
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            name="password"
                            required
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={handleLoginChange}
                            className="w-full h-13 bg-slate-50 border border-slate-200 rounded-2xl px-4 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />


                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                !showPassword
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                          >

                            {showPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}

                          </button>

                        </div>

                      </div>


                      {/* Remember */}

                      <div className="flex items-center justify-between pt-1">

                        <label className="flex items-center gap-2.5 cursor-pointer select-none">

                          <input
                            type="checkbox"
                            name="remember"
                            checked={
                              loginData.remember
                            }
                            onChange={
                              handleLoginChange
                            }
                            className="h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                          />

                          <span className="text-sm text-slate-500">

                            Remember me

                          </span>

                        </label>

                      </div>


                      {/* Submit */}

                      <button
                        type="submit"
                        className="group w-full h-13 rounded-2xl bg-[#111827] hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-300 shadow-[0_10px_30px_rgba(17,24,39,0.16)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2"
                      >

                        Sign in

                        <span className="transition-transform duration-200 group-hover:translate-x-1">

                          →

                        </span>

                      </button>


                      {/* Divider */}

                      <div className="relative py-1">

                        <div className="absolute inset-0 flex items-center">

                          <div className="w-full border-t border-slate-100" />

                        </div>

                        <div className="relative flex justify-center">

                          <span className="bg-white px-4 text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">

                            Or continue with

                          </span>

                        </div>

                      </div>


                      {/* Google */}

                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className="w-full h-13 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-3 transition-all duration-200"
                      >

                        <svg
                          className="w-5 h-5"
                          viewBox="0 0 24 24"
                        >

                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />

                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />

                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />

                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />

                        </svg>

                        Continue with Google

                      </button>


                      {/* Terms */}

                      <div className="pt-3 text-center">

                        <p className="text-[11px] leading-5 text-slate-400">

                          By continuing, you agree to FindMyHostel's{" "}

                          <a
                            href="#terms"
                            className="text-slate-700 font-semibold hover:text-blue-600"
                          >

                            Terms of Service

                          </a>{" "}

                          and{" "}

                          <a
                            href="#privacy"
                            className="text-slate-700 font-semibold hover:text-blue-600"
                          >

                            Privacy Policy

                          </a>

                          .

                        </p>

                      </div>

                    </form>

                  )}


                  {/* =====================================================
                      REGISTER FORM
                  ===================================================== */}

                  {activeTab === "register" && (

                    <form
                      onSubmit={registerSubmit}
                      className="space-y-4"
                    >

                      {/* Name */}

                      <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">

                          Full name

                        </label>

                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="John Doe"
                          value={registerData.name}
                          onChange={handleRegisterChange}
                          className="w-full h-12.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                      </div>


                      {/* Email */}

                      <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">

                          Email address

                        </label>

                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="john@example.com"
                          value={registerData.email}
                          onChange={handleRegisterChange}
                          className="w-full h-12.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                      </div>


                      {/* Phone */}

                      <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">

                          Phone number

                        </label>

                        <div className="flex">

                          <div className="flex items-center px-3.5 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 text-sm font-medium text-slate-600">

                            +91

                          </div>

                          <input
                            type="tel"
                            name="phoneNo"
                            required
                            placeholder="9876543210"
                            value={
                              registerData.phoneNo
                            }
                            onChange={
                              handleRegisterChange
                            }
                            maxLength={10}
                            inputMode="numeric"
                            pattern="[0-9]{10}"
                            title="Phone number must contain exactly 10 digits"
                            className="flex-1 h-12.5 bg-slate-50 border border-slate-200 rounded-r-2xl px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                        </div>

                      </div>


                      {/* Password */}

                      <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">

                          Password

                        </label>

                        <div className="relative">

                          <input
                            type={
                              showPassword
                                ? "text"
                                : "password"
                            }
                            name="password"
                            required
                            placeholder="Create a password"
                            value={
                              registerData.password
                            }
                            onChange={
                              handleRegisterChange
                            }
                            className="w-full h-12.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword(
                                !showPassword
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          >

                            {showPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}

                          </button>

                        </div>

                      </div>


                      {/* Confirm Password */}

                      <div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">

                          Confirm password

                        </label>

                        <div className="relative">

                          <input
                            type={
                              showConfirmPassword
                                ? "text"
                                : "password"
                            }
                            name="confirmPassword"
                            required
                            placeholder="Confirm your password"
                            value={
                              registerData.confirmPassword
                            }
                            onChange={
                              handleRegisterChange
                            }
                            className="w-full h-12.5 bg-slate-50 border border-slate-200 rounded-2xl px-4 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(
                                !showConfirmPassword
                              )
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                          >

                            {showConfirmPassword ? (
                              <FaEyeSlash size={16} />
                            ) : (
                              <FaEye size={16} />
                            )}

                          </button>

                        </div>

                      </div>


                      {/* Hostel Owner */}

                      <label className="flex items-start gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white cursor-pointer transition">

                        <input
                          type="checkbox"
                          name="hostelOwner"
                          checked={
                            registerData.hostelOwner
                          }
                          onChange={
                            handleRegisterChange
                          }
                          className="mt-0.5 h-4 w-4 rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <div>

                          <div className="text-sm font-semibold text-slate-800">

                            I am a hostel owner

                          </div>

                          <div className="text-[11px] text-slate-500 mt-0.5 leading-4">

                            Register your property and manage
                            bookings through the owner portal.

                          </div>

                        </div>

                      </label>


                      {/* Submit */}

                      <button
                        type="submit"
                        className="group w-full h-13 rounded-2xl bg-[#111827] hover:bg-blue-600 text-white font-semibold text-sm transition-all duration-300 shadow-[0_10px_30px_rgba(17,24,39,0.16)] hover:shadow-[0_12px_32px_rgba(37,99,235,0.25)] flex items-center justify-center gap-2 mt-2"
                      >

                        Create account

                        <span className="transition-transform duration-200 group-hover:translate-x-1">

                          →

                        </span>

                      </button>


                      {/* Terms */}

                      <p className="text-[11px] text-center text-slate-400 leading-5 pt-1">

                        By creating an account, you agree to our{" "}

                        <a
                          href="#terms"
                          className="text-slate-700 font-semibold hover:text-blue-600"
                        >

                          Terms

                        </a>{" "}

                        and{" "}

                        <a
                          href="#privacy"
                          className="text-slate-700 font-semibold hover:text-blue-600"
                        >

                          Privacy Policy

                        </a>

                        .

                      </p>

                    </form>

                  )}


                  {/* ================= FOOTER ================= */}

                  <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">

                    <p className="text-[10px] text-slate-400">

                      © 2026 FindMyHostel

                    </p>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      Secure connection

                    </div>

                  </div>

                </>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;

