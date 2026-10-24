import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Clock3,
  FileText,
  ArrowRight,
  MailCheck,
  ShieldCheck,
  Home,
} from "lucide-react";

/**
 * HostelReviewStatus
 *
 * Purpose:
 * Shows the owner the current status of their hostel submission
 * after owner email verification and before admin approval.
 *
 * No fake hostel/property information is used.
 *
 * Props:
 *
 * hostel = {
 *   name?: string,
 *   type?: string,
 *   city?: string,
 *   area?: string,
 *   coverImage?: string,
 * }
 *
 * status:
 * "UNDER_REVIEW"
 * "APPROVED"
 * "REJECTED"
 * "CHANGES_REQUIRED"
 *
 * submittedSections:
 * [
 *   "Hostel Information",
 *   "Location",
 *   "Rooms & Pricing",
 *   "Amenities",
 *   "Rules & Policies",
 *   "Photos"
 * ]
 *
 * onViewSubmittedInformation:
 * callback when owner clicks the button
 *
 * onGoToMyHostel:
 * callback when hostel is approved
 *
 * onUpdateHostel:
 * callback when changes are required/rejected
 */

function HostelReviewStatus({
  hostel = {},
  status = "UNDER_REVIEW",
  submittedSections = [],
  onViewSubmittedInformation,
  onGoToMyHostel,
  onUpdateHostel,
}) {
  const navigate = useNavigate();

  const isUnderReview = status === "UNDER_REVIEW";
  const isApproved = status === "APPROVED";
  const isRejected = status === "REJECTED";
  const isChangesRequired = status === "CHANGES_REQUIRED";

  const hasPropertyIdentity =
    hostel.name ||
    hostel.type ||
    hostel.city ||
    hostel.area ||
    hostel.coverImage;

  const getStatusContent = () => {
    if (isApproved) {
      return {
        title: "Hostel Approved",
        subtitle: "Your hostel has been approved.",
        description:
          "Your hostel submission has completed the admin review process.",
      };
    }

    if (isRejected) {
      return {
        title: "Review Completed",
        subtitle: "Your hostel submission was not approved.",
        description:
          "Please review the admin feedback and update your hostel information.",
      };
    }

    if (isChangesRequired) {
      return {
        title: "Changes Required",
        subtitle: "Your hostel needs some updates.",
        description:
          "Please review the admin feedback and make the required changes.",
      };
    }

    return {
      title: "Submission Received",
      subtitle: "Your hostel is waiting for admin review.",
      description:
        "Your email has been verified successfully. Your hostel submission is now waiting for admin review.",
    };
  };

  const content = getStatusContent();

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 antialiased">
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl">

          {/* Main Card */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">

            {/* Header */}
            <div className="px-6 pt-8 text-center sm:px-8 sm:pt-10">

              {/* Status Icon */}
              <div
                className={[
                  "mx-auto flex h-11 w-11 items-center justify-center rounded-full border",
                  isApproved
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                    : isRejected || isChangesRequired
                    ? "border-red-100 bg-red-50 text-red-600"
                    : "border-blue-100 bg-blue-50 text-blue-600",
                ].join(" ")}
              >
                {isApproved ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : isRejected || isChangesRequired ? (
                  <FileText className="h-5 w-5" />
                ) : (
                  <MailCheck className="h-5 w-5" />
                )}
              </div>

              {/* Heading */}
              <div className="mt-4 space-y-1">
                <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
                  {content.title}
                </h1>

                <p className="text-sm font-medium text-zinc-600">
                  {content.subtitle}
                </p>
              </div>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
                {content.description}
              </p>
            </div>

            {/* Property Identity */}
            {hasPropertyIdentity && (
              <div className="mx-6 mt-7 rounded-lg border border-zinc-200 bg-zinc-50/70 p-3 sm:mx-8">
                <div className="flex items-center gap-3">

                  {/* Cover Image */}
                  {hostel.coverImage ? (
                    <img
                      src={hostel.coverImage}
                      alt={hostel.name || "Hostel"}
                      className="h-14 w-14 shrink-0 rounded-md border border-zinc-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-400">
                      <Home className="h-5 w-5" />
                    </div>
                  )}

                  {/* Property Information */}
                  <div className="min-w-0 flex-1">
                    {hostel.name && (
                      <p className="truncate text-sm font-semibold text-zinc-900">
                        {hostel.name}
                      </p>
                    )}

                    {hostel.type && (
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {hostel.type}
                      </p>
                    )}

                    {(hostel.area || hostel.city) && (
                      <p className="mt-1 truncate text-xs text-zinc-500">
                        {[hostel.area, hostel.city]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Status Timeline */}
            <div className="mx-6 mt-7 rounded-lg border border-zinc-200 bg-white p-5 sm:mx-8">
              <div className="space-y-0">

                {/* Email Verified */}
                <TimelineStep
                  icon={<Check className="h-3.5 w-3.5 stroke-[2.5]" />}
                  title="Email Verified"
                  description="Completed"
                  state="completed"
                  showConnector
                />

                {/* Admin Review */}
                <TimelineStep
                  icon={
                    isUnderReview ? (
                      <Clock3 className="h-3.5 w-3.5" />
                    ) : isApproved ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : isRejected || isChangesRequired ? (
                      <FileText className="h-3.5 w-3.5" />
                    ) : (
                      <Clock3 className="h-3.5 w-3.5" />
                    )
                  }
                  title="Admin Review"
                  description={
                    isUnderReview
                      ? "Pending approval"
                      : isApproved
                      ? "Completed"
                      : isRejected
                      ? "Review completed"
                      : "Changes required"
                  }
                  state={
                    isUnderReview
                      ? "current"
                      : isApproved
                      ? "completed"
                      : "attention"
                  }
                  showConnector
                />

                {/* Approval */}
                <TimelineStep
                  icon={
                    isApproved ? (
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    ) : isRejected || isChangesRequired ? (
                      <FileText className="h-3.5 w-3.5" />
                    ) : null
                  }
                  title="Hostel Approval"
                  description={
                    isApproved
                      ? "Approved"
                      : isRejected
                      ? "Not approved"
                      : isChangesRequired
                      ? "Changes required"
                      : "Awaiting decision"
                  }
                  state={
                    isApproved
                      ? "completed"
                      : isRejected || isChangesRequired
                      ? "attention"
                      : "future"
                  }
                  showConnector={false}
                />
              </div>
            </div>

            {/* Submission Summary */}
            {submittedSections.length > 0 && (
              <div className="mx-6 mt-6 border-t border-zinc-100 pt-6 sm:mx-8">
                <div className="mb-3">
                  <h2 className="text-sm font-semibold text-zinc-900">
                    Submission Summary
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Information included in your hostel submission.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {submittedSections.map((section) => (
                    <div
                      key={section}
                      className="flex min-w-0 items-center gap-2 text-xs text-zinc-600"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-zinc-400" />

                      <span className="truncate">{section}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What Happens Next */}
            {!isApproved && !isRejected && !isChangesRequired && (
              <div className="mx-6 mt-6 rounded-lg border border-blue-100 bg-blue-50/50 p-4 sm:mx-8">
                <div className="flex gap-3">

                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm ring-1 ring-blue-100">
                    <ShieldCheck className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      What happens next?
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Our admin team will review your submitted hostel
                      information and notify you once the review is complete.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approved Message */}
            {isApproved && (
              <div className="mx-6 mt-6 rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 sm:mx-8">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                    <Check className="h-4 w-4 stroke-[2.5]" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      Your hostel has been approved
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      You can now manage your hostel and view its guest-facing
                      listing.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Rejection / Changes Required */}
            {(isRejected || isChangesRequired) && (
              <div className="mx-6 mt-6 rounded-lg border border-red-100 bg-red-50/50 p-4 sm:mx-8">
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white text-red-600 shadow-sm ring-1 ring-red-100">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold text-zinc-900">
                      {isChangesRequired
                        ? "Changes are required"
                        : "Review requires attention"}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Review the feedback provided by the admin and update your
                      hostel information as required.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-6 pb-8 pt-7 sm:px-8">

              {isApproved ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={onGoToMyHostel}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                  >
                    Go to My Hostel
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-zinc-400">
                    Your hostel is ready to manage.
                  </p>
                </div>
              ) : isRejected || isChangesRequired ? (
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={onUpdateHostel}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                  >
                    Update Hostel
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-center text-xs text-zinc-400">
                    Review the admin feedback before making changes.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={onViewSubmittedInformation}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                  >
                    <FileText className="h-4 w-4" />
                    View Submitted Information
                  </button>

                  <p className="text-center text-xs text-zinc-400">
                    We'll notify you when the review is complete.
                  </p>
                </div>
              )}

              {/* Back to Login */}
              <div className="mt-5 border-t border-zinc-100 pt-5">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ============================================================
   Timeline Step
   ============================================================ */

function TimelineStep({
  icon,
  title,
  description,
  state,
  showConnector,
}) {
  const stateStyles = {
    completed: {
      circle:
        "bg-emerald-50 text-emerald-600 border-emerald-100",
      title: "text-zinc-900",
      description: "text-zinc-500",
      connector: "bg-zinc-200",
    },

    current: {
      circle:
        "bg-blue-50 text-blue-600 border-blue-100",
      title: "text-zinc-900",
      description: "text-blue-600",
      connector: "bg-zinc-200",
    },

    future: {
      circle:
        "bg-white text-zinc-300 border-zinc-200",
      title: "text-zinc-400",
      description: "text-zinc-400",
      connector: "bg-zinc-200",
    },

    attention: {
      circle:
        "bg-red-50 text-red-600 border-red-100",
      title: "text-zinc-900",
      description: "text-red-600",
      connector: "bg-zinc-200",
    },
  };

  const styles = stateStyles[state] || stateStyles.future;

  return (
    <div className="flex gap-3">

      {/* Timeline indicator */}
      <div className="flex flex-col items-center">
        <div
          className={[
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
            styles.circle,
          ].join(" ")}
        >
          {icon || (
            <div className="h-2 w-2 rounded-full bg-current" />
          )}
        </div>

        {showConnector && (
          <div className={`my-1 h-8 w-px ${styles.connector}`} />
        )}
      </div>

      {/* Content */}
      <div className="pt-0.5">
        <p
          className={[
            "text-sm font-medium leading-5",
            styles.title,
          ].join(" ")}
        >
          {title}
        </p>

        <p
          className={[
            "mt-0.5 text-xs",
            styles.description,
          ].join(" ")}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

export default HostelReviewStatus;

