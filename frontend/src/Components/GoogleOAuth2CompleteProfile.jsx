import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { completeGoogleProfile } from "../services/authService";

function GoogleOAuth2CompleteProfile({ setUser }) {

  const location = useLocation();
  const navigate = useNavigate();

  const queryParams =
    new URLSearchParams(location.search);

  const code =
    queryParams.get("code");

  const [phoneNo, setPhoneNo] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handlePhoneChange = (e) => {

    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 10);

    setPhoneNo(value);
  };


  const handleSubmit = async (e) => {

    e.preventDefault();


    if (!code) {

      toast.error(
        "Google registration session is missing or expired."
      );

      navigate("/", {
        replace: true,
      });

      return;
    }


    if (!/^\d{10}$/.test(phoneNo)) {

      toast.error(
        "Phone number must contain exactly 10 digits."
      );

      return;
    }


    setLoading(true);


    try {

      const response =
        await completeGoogleProfile({
          code,
          phoneNo,
        });


      const data =
        response.data;


      if (!data?.token) {

        toast.error(
          data?.message ||
          "Google registration failed."
        );

        return;
      }


      /*
       * Save JWT.
       */
      localStorage.setItem(
        "token",
        data.token
      );


      /*
       * Save authenticated user.
       */
      localStorage.setItem(
        "user",
        JSON.stringify(data)
      );


      setUser(data);


      toast.success(
        "Google account created successfully!"
      );


      /*
       * New Google registrations are USER accounts.
       */
      navigate(
        "/home",
        {
          replace: true,
        }
      );

    } catch (error) {

      console.error(
        "Google profile completion failed:",
        error
      );


      toast.error(
        error.response?.data?.message ||
        error.response?.data ||
        "Unable to complete Google registration."
      );

    } finally {

      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#f5f7fb] flex items-center justify-center px-5">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

        <div className="text-center mb-8">

          <div className="mx-auto h-12 w-12 rounded-2xl bg-[#111827] flex items-center justify-center mb-5">

            <div className="h-5 w-5 rounded-md bg-white rotate-45" />

          </div>

          <h1 className="text-2xl font-semibold text-slate-900">

            Complete your profile

          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">

            Your Google account is verified.
            Please provide your phone number to
            complete your FindMyHostel account.

          </p>

        </div>


        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-medium text-slate-700 mb-2">

              Phone number

            </label>

            <div className="flex">

              <div className="flex items-center px-4 rounded-l-2xl border border-r-0 border-slate-200 bg-slate-100 text-sm font-medium text-slate-600">

                +91

              </div>

              <input
                type="tel"
                value={phoneNo}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
                required
                autoFocus
                className="flex-1 h-13 bg-slate-50 border border-slate-200 rounded-r-2xl px-4 text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />

            </div>

            <p className="mt-2 text-xs text-slate-400">

              Enter your 10-digit Indian mobile number.

            </p>

          </div>


          <button
            type="submit"
            disabled={
              loading ||
              phoneNo.length !== 10
            }
            className="w-full h-13 rounded-2xl bg-[#111827] hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all"
          >

            {loading
              ? "Creating account..."
              : "Complete registration →"}

          </button>


          <button
            type="button"
            onClick={() =>
              navigate("/", {
                replace: true,
              })
            }
            className="w-full h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-sm"
          >

            Cancel

          </button>

        </form>

      </div>

    </div>
  );
}

export default GoogleOAuth2CompleteProfile;