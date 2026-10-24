import React, { useEffect, useRef } from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import { toast } from "react-toastify";

import api from "../api/axiosConfig";

import {
  getOwnerHostelStatus,
} from "../services/authService";



function GoogleOAuthCallback({ setUser }) {

  const navigate = useNavigate();

  const location = useLocation();

  const hasProcessed = useRef(false);



  useEffect(() => {

    if (hasProcessed.current) {

      return;

    }

    hasProcessed.current = true;



    const finishGoogleLogin = async () => {

      try {

        // =====================================================
        // READ QUERY PARAMETERS
        // =====================================================

        const params =
          new URLSearchParams(
            location.search
          );

        const code =
          params.get("code");

        const error =
          params.get("error");



        // =====================================================
        // GOOGLE AUTHENTICATION ERROR
        // =====================================================

        if (error) {

          throw new Error(
            error
          );

        }



        // =====================================================
        // CODE REQUIRED
        // =====================================================

        if (!code) {

          throw new Error(
            "Google OAuth login code is missing."
          );

        }



        // =====================================================
        // EXCHANGE CODE FOR EXISTING JWT
        // =====================================================

        console.log(
          "========== GOOGLE OAUTH CALLBACK =========="
        );

        console.log(
          "OAuth code received successfully."
        );

        console.log(
          "Exchanging OAuth code for JWT..."
        );



        const response =
          await api.post(
            "/api/auth/oauth2/exchange",
            {
              code: code,
            }
          );



        const userData =
          response.data;



        // =====================================================
        // VALIDATE RESPONSE
        // =====================================================

        if (!userData?.token) {

          throw new Error(
            "Google login did not return an authentication token."
          );

        }



        console.log(
          "Google OAuth exchange successful."
        );

        console.log(
          "User ID:",
          userData.userId
        );

        console.log(
          "User Email:",
          userData.email
        );

        console.log(
          "User Role:",
          userData.role
        );



        // =====================================================
        // SAVE JWT
        // =====================================================

        localStorage.setItem(
          "token",
          userData.token
        );



        // =====================================================
        // SAVE USER
        // =====================================================

        localStorage.setItem(
          "user",
          JSON.stringify(userData)
        );



        // =====================================================
        // UPDATE APP STATE
        // =====================================================

        setUser(userData);



        toast.success(
          userData.message ||
            "Google Login Successful",
          {
            position: "top-right",
            autoClose: 2500,
            theme: "colored",
          }
        );



        // =====================================================
        // ROLE ROUTING
        // =====================================================

        switch (userData.role) {

          // ===================================================
          // USER
          // ===================================================

          case "USER":

            console.log(
              "Existing USER account found."
            );

            console.log(
              "Redirecting existing USER to /home..."
            );



            navigate(
              "/home",
              {
                replace: true,
              }
            );

            return;



          // ===================================================
          // OWNER
          // ===================================================

          case "OWNER": {

            try {

              console.log(
                "========== GOOGLE OWNER APPROVAL CHECK =========="
              );



              const hostelResponse =
                await getOwnerHostelStatus();



              console.log(
                "Owner hostel response:",
                hostelResponse
              );



              const status =
                hostelResponse.data?.status;



              const hostelId =
                hostelResponse.data?.hostelId;



              switch (status) {

                // -------------------------------------------
                // OWNER EMAIL VERIFICATION
                // -------------------------------------------

                case "OWNER_VERIFICATION_PENDING": {

                  if (!hostelId) {

                    toast.error(
                      "Hostel ID is missing. Please contact support.",
                      {
                        position: "top-right",
                        autoClose: 3000,
                        theme: "colored",
                      }
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



                // -------------------------------------------
                // PENDING
                // -------------------------------------------

                case "PENDING":

                  navigate(
                    "/owner/approval-pending",
                    {
                      replace: true,
                    }
                  );

                  break;



                // -------------------------------------------
                // APPROVED
                // -------------------------------------------

                case "APPROVED":

                  navigate(
                    "/owner/dashboard",
                    {
                      replace: true,
                    }
                  );

                  break;



                // -------------------------------------------
                // REJECTED
                // -------------------------------------------

                case "REJECTED":

                  navigate(
                    "/owner/add-hostel",
                    {
                      replace: true,
                    }
                  );

                  break;



                // -------------------------------------------
                // SUSPENDED
                // -------------------------------------------

                case "SUSPENDED":

                  navigate(
                    "/owner/approval-pending",
                    {
                      replace: true,
                    }
                  );

                  break;



                // -------------------------------------------
                // DRAFT / NO HOSTEL
                // -------------------------------------------

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



                // -------------------------------------------
                // UNKNOWN
                // -------------------------------------------

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

            } catch (ownerError) {

              console.error(
                "========== GOOGLE OWNER STATUS CHECK FAILED =========="
              );



              console.error(
                ownerError
              );



              navigate(
                "/owner/add-hostel",
                {
                  replace: true,
                }
              );

            }

            break;

          }



          // ===================================================
          // ADMIN
          // ===================================================

          case "ADMIN":

            navigate(
              "/admin/dashboard",
              {
                replace: true,
              }
            );

            break;



          // ===================================================
          // UNKNOWN
          // ===================================================

          default:

            navigate(
              "/",
              {
                replace: true,
              }
            );

            break;

        }

      } catch (error) {

        console.error(
          "========== GOOGLE LOGIN FAILED =========="
        );



        console.error(
          error
        );



        toast.error(
          error.response?.data?.message ||
            error.response?.data ||
            error.message ||
            "Google Login Failed",
          {
            position: "top-right",
            autoClose: 3500,
            theme: "colored",
          }
        );



        localStorage.removeItem(
          "token"
        );



        navigate(
          "/",
          {
            replace: true,
          }
        );

      }

    };



    finishGoogleLogin();

  }, [
    location.search,
    navigate,
    setUser,
  ]);



  // =========================================================
  // LOADING SCREEN
  // =========================================================

  return (

    <div className="min-h-screen bg-slate-50 flex items-center justify-center">

      <div className="text-center">

        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <h2 className="text-lg font-semibold text-slate-900">

          Signing you in with Google...

        </h2>

        <p className="mt-2 text-sm text-slate-500">

          Please wait while we complete your login.

        </p>

      </div>

    </div>

  );

}

export default GoogleOAuthCallback;