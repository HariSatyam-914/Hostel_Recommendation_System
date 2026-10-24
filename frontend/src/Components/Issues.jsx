import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Sparkles,
  Images,
  MessageSquare,
  Star,
  BarChart3,
  Settings,
  Bell,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Search,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  MessageSquareText,
  Upload,
  X,
  LifeBuoy,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/$/, "");

const apiUrl = (path) => `${API_BASE}${path}`;

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("jwt") ||
    localStorage.getItem("jwtToken");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const buildIssueImageUrls = (value) => {
  if (!value) {
    return [];
  }

  const rawValue = String(value).trim();

  if (!rawValue) {
    return [];
  }

  // Keep already usable URLs unchanged.
  if (
    rawValue.startsWith("http://") ||
    rawValue.startsWith("https://") ||
    rawValue.startsWith("data:") ||
    rawValue.startsWith("blob:")
  ) {
    return [rawValue];
  }

  // Normalize Windows filesystem paths.
  let normalizedPath = rawValue.replace(/\\/g, "/");

  const candidates = [];

  /*
   * -------------------------------------------------------
   * If backend returns an absolute filesystem path such as:
   *
   * /Users/name/project/uploads/issues/1/photo.jpg
   *
   * or:
   *
   * C:/project/uploads/issues/1/photo.jpg
   *
   * convert everything before /uploads/ into the public
   * browser path.
   * -------------------------------------------------------
   */
  const uploadsIndex =
    normalizedPath.toLowerCase().indexOf("/uploads/");

  if (uploadsIndex !== -1) {
    const publicUploadsPath =
      normalizedPath.substring(uploadsIndex);

    candidates.push(
      `${API_BASE}${publicUploadsPath}`
    );
  }

  /*
   * -------------------------------------------------------
   * /uploads/...
   * -------------------------------------------------------
   */
  if (normalizedPath.startsWith("/uploads/")) {
    candidates.push(
      `${API_BASE}${normalizedPath}`
    );
  }

  /*
   * -------------------------------------------------------
   * uploads/...
   * -------------------------------------------------------
   */
  if (normalizedPath.startsWith("uploads/")) {
    candidates.push(
      `${API_BASE}/${normalizedPath}`
    );
  }

  /*
   * -------------------------------------------------------
   * /api/...
   * -------------------------------------------------------
   */
  if (normalizedPath.startsWith("/api/")) {
    candidates.push(
      `${API_BASE}${normalizedPath}`
    );
  }

  if (normalizedPath.startsWith("api/")) {
    candidates.push(
      `${API_BASE}/${normalizedPath}`
    );
  }

  /*
   * -------------------------------------------------------
   * Already relative browser path.
   * -------------------------------------------------------
   */
  if (
    normalizedPath.startsWith("/") &&
    !normalizedPath.startsWith("/uploads/") &&
    !normalizedPath.startsWith("/api/")
  ) {
    candidates.push(
      `${API_BASE}${normalizedPath}`
    );
  }

  /*
   * -------------------------------------------------------
   * Plain relative path.
   *
   * Example:
   * issues/1/photo.jpg
   * issue-attachments/photo.jpg
   * -------------------------------------------------------
   */
  if (
    !normalizedPath.startsWith("/") &&
    !normalizedPath.startsWith("uploads/") &&
    !normalizedPath.startsWith("api/")
  ) {
    candidates.push(
      `${API_BASE}/uploads/${normalizedPath}`
    );

    candidates.push(
      `${API_BASE}/${normalizedPath}`
    );
  }

  return [
    ...new Set(
      candidates.filter(Boolean)
    ),
  ];
};

const normalizeIssue = (issue = {}) => {
  /*
   * -------------------------------------------------------
   * ISSUE RESPONSES
   * -------------------------------------------------------
   */
  const responses = Array.isArray(issue.responses)
    ? issue.responses
    : [];

  const latestResponse =
    responses.length > 0
      ? responses[responses.length - 1]
      : null;

  /*
   * -------------------------------------------------------
   * ISSUE ATTACHMENTS
   *
   * Different backend DTOs can expose the images using
   * different property names. Support all existing forms
   * without changing the backend.
   * -------------------------------------------------------
   */
  let rawAttachments = [];

  if (Array.isArray(issue.attachments)) {
    rawAttachments = issue.attachments;
  } else if (Array.isArray(issue.proofImages)) {
    rawAttachments = issue.proofImages;
  } else if (Array.isArray(issue.images)) {
    rawAttachments = issue.images;
  } else if (Array.isArray(issue.issueAttachments)) {
    rawAttachments = issue.issueAttachments;
  } else if (Array.isArray(issue.proofImage)) {
    rawAttachments = issue.proofImage;
  } else if (issue.proofImage) {
    rawAttachments = [issue.proofImage];
  } else if (issue.image) {
    rawAttachments = [issue.image];
  }

  /*
   * -------------------------------------------------------
   * NORMALIZE IMAGE INFORMATION
   * -------------------------------------------------------
   */
  const proofImages = rawAttachments
    .map((attachment) => {
      /*
       * Backend may return a simple string instead of an
       * attachment object.
       */
      if (typeof attachment === "string") {
        const candidates =
          buildIssueImageUrls(attachment);

        return {
          fileUrl: candidates[0] || "",
          url: candidates[0] || "",
          imageUrl: candidates[0] || "",
          candidates,
        };
      }

      const rawValues = [
        attachment?.fileUrl,
        attachment?.url,
        attachment?.photoUrl,
        attachment?.imageUrl,
        attachment?.attachmentUrl,
        attachment?.filePath,
        attachment?.path,
      ];

      /*
       * If the backend provides only fileName, include it
       * as another possible source.
       */
      if (attachment?.fileName) {
        rawValues.push(
          attachment.fileName
        );
      }

      const candidates = [];

      rawValues.forEach((value) => {
        buildIssueImageUrls(value).forEach(
          (candidate) => {
            if (
              candidate &&
              !candidates.includes(candidate)
            ) {
              candidates.push(candidate);
            }
          }
        );
      });

      return {
        ...attachment,

        fileUrl:
          candidates[0] || "",

        url:
          candidates[0] || "",

        imageUrl:
          candidates[0] || "",

        candidates,
      };
    })
    .filter(
      (attachment) =>
        attachment?.fileUrl ||
        attachment?.url ||
        attachment?.imageUrl
    );

  const status =
    issue.status || "OPEN";

  return {
    ...issue,

    id:
      issue.id ||
      issue.issueId,

    title:
      issue.subject ||
      issue.title ||
      "Reported issue",

    subject:
      issue.subject ||
      issue.title ||
      "Reported issue",

    reporter:
      issue.userName ||
      issue.reporter ||
      "User",

    reporterRole:
      issue.reporterRole ||
      "User",

    room:
      issue.room ||
      "Not specified",

    proofImages,

    responses,

    resolution:
      issue.resolution ||
      latestResponse?.message ||
      "",

    latestResponse,

    status,
  };
};

function Issues() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [issues, setIssues] = useState([]);
  const [selectedIssueId, setSelectedIssueId] = useState(null);

  const [priorityFilter, setPriorityFilter] =
    useState("All Priority");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [searchTerm, setSearchTerm] = useState("");

  const [showResolvePanel, setShowResolvePanel] =
  useState(false);

const [resolutionNote, setResolutionNote] =
  useState("");

const [resolutionProofs, setResolutionProofs] =
  useState([]);

const [resolutionDrafts, setResolutionDrafts] =
  useState({});

const [resolutionDraftSaved, setResolutionDraftSaved] =
  useState(false);

  const [profileOpen, setProfileOpen] = useState(false);

  const [hostelId, setHostelId] = useState(null);

  const [owner, setOwner] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [issueDetailsLoading, setIssueDetailsLoading] = useState(false);
  const [issueActionLoading, setIssueActionLoading] = useState(false);

  const profileMenuRef = useRef(null);

  // =========================================================
  // LOAD OWNER INFORMATION
  // =========================================================

  useEffect(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      if (savedUser) {
        setOwner(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error(
        "Failed to read owner information:",
        error
      );
    }
  }, []);

  // =========================================================
  // LOAD HOSTEL ID
  // =========================================================

  // =========================================================
// LOAD HOSTEL ID
// =========================================================

useEffect(() => {
  let mounted = true;

  const loadHostelId = async () => {
    try {
      setLoading(true);
      setError("");

      const storedHostelId =
        localStorage.getItem("hostelId");

      if (storedHostelId) {
        if (mounted) {
          setHostelId(storedHostelId);
        }

        return;
      }

      // Use the existing owner dashboard endpoint.
      // GET /api/owner/dashboard
      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("jwt") ||
        localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error(
          "Authentication token not found."
        );
      }

      const response = await fetch(
        apiUrl("/api/owner/dashboard"),
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load owner dashboard (${response.status})`
        );
      }

      const data = await response.json();

      const dashboardHostel =
        data?.data?.hostel ||
        data?.hostel ||
        data?.data ||
        data;

      const backendHostelId =
        dashboardHostel?.hostelId ??
        dashboardHostel?.id;

      if (backendHostelId) {
        localStorage.setItem(
          "hostelId",
          String(backendHostelId)
        );

        if (mounted) {
          setHostelId(
            String(backendHostelId)
          );
        }
      } else {
        throw new Error(
          "Hostel ID was not found in the owner dashboard response."
        );
      }
    } catch (err) {
      console.error(
        "Failed to load hostel ID:",
        err
      );

      if (mounted) {
        setError(
          err?.message ||
            "Unable to identify your hostel."
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  };

  loadHostelId();

  return () => {
    mounted = false;
  };
}, []);

  // =========================================================
  // ISSUE DATA
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadOwnerIssues = async () => {
      if (!hostelId) {
        return;
      }

      try {
        if (mounted) {
          setLoading(true);
          setError("");
        }

        const response = await fetch(apiUrl("/api/owner/issues"), {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("You are not authorized to view hostel issues.");
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load hostel issues (${response.status}).`
          );
        }

        const data = await response.json();
        const items = Array.isArray(data)
          ? data
          : Array.isArray(data?.issues)
            ? data.issues
            : Array.isArray(data?.content)
              ? data.content
              : [];

        // The owner endpoint already scopes issues to the authenticated owner's
        // hostels. Keep an additional hostel check so this page displays only
        // issues belonging to the current hostel when hostelId is available.
        const currentHostelId = String(hostelId);
        // Normalize the issues and remove duplicate issue IDs.
        // A duplicate ID causes React warnings such as:
        // "Encountered two children with the same key".
        const normalizedItems = items
          .filter((item) => {
            if (item?.hostelId === null || item?.hostelId === undefined) {
              return true;
            }
            return String(item.hostelId) === currentHostelId;
          })
          .map(normalizeIssue);

        const normalized = Array.from(
          new Map(
            normalizedItems
              .filter((issue) => issue?.id !== null && issue?.id !== undefined)
              .map((issue) => [String(issue.id), issue])
          ).values()
        );

        if (mounted) {
          setIssues(normalized);
          setSelectedIssueId((current) => {
            if (
              current &&
              normalized.some(
                (issue) => String(issue.id) === String(current)
              )
            ) {
              return current;
            }
            return normalized[0]?.id || null;
          });
        }
      } catch (err) {
        console.error("Failed to load owner issues:", err);
        if (mounted) {
          setIssues([]);
          setSelectedIssueId(null);
          setError(
            err?.message ||
              "Unable to load hostel issues right now."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOwnerIssues();

    return () => {
      mounted = false;
    };
  }, [hostelId]);

  // =========================================================
  // LOAD COMPLETE ISSUE DETAILS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const loadIssueDetails = async () => {
      if (!selectedIssueId) {
        return;
      }

      try {
        if (mounted) {
          setIssueDetailsLoading(true);
        }

        const response = await fetch(
          apiUrl(`/api/owner/issues/${selectedIssueId}`),
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              ...getAuthHeaders(),
            },
          }
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error("You are not authorized to view this issue.");
        }

        if (!response.ok) {
          throw new Error(
            `Unable to load issue details (${response.status}).`
          );
        }

        const data = await response.json();
        const normalized = normalizeIssue(data);

        console.debug(
          "Owner issue details loaded:",
          normalized.id,
          "attachments:",
          normalized.proofImages?.map((image) => ({
            id: image?.id,
            fileName: image?.fileName,
            fileUrl: image?.fileUrl,
            candidates: image?.candidates,
          })) || []
        );

        if (mounted) {
          setIssues((currentIssues) =>
            currentIssues.map((issue) =>
              String(issue.id) === String(selectedIssueId)
                ? { ...issue, ...normalized }
                : issue
            )
          );
        }
      } catch (err) {
        console.error("Failed to load issue details:", err);
        if (mounted) {
          setError(
            err?.message ||
              "Unable to load the selected issue details."
          );
        }
      } finally {
        if (mounted) {
          setIssueDetailsLoading(false);
        }
      }
    };

    loadIssueDetails();

    return () => {
      mounted = false;
    };
  }, [selectedIssueId]);

  // =========================================================
  // SELECTED ISSUE
  // =========================================================

  const selectedIssue = useMemo(() => {
    if (!selectedIssueId) {
      return null;
    }

    return (
      issues.find(
        (issue) =>
          String(issue.id) ===
          String(selectedIssueId)
      ) || null
    );
  }, [issues, selectedIssueId]);

  // =========================================================
  // FILTERED ISSUES
  // =========================================================

  const filteredIssues = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return issues.filter((issue) => {
      const title =
        String(issue.title || "").toLowerCase();

      const description =
        String(
          issue.description || ""
        ).toLowerCase();

      const room =
        String(issue.room || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        title.includes(normalizedSearch) ||
        description.includes(normalizedSearch) ||
        room.includes(normalizedSearch);

      const matchesPriority =
        priorityFilter === "All Priority" ||
        String(issue.priority || "") ===
          priorityFilter;

      const matchesStatus =
        statusFilter === "All Status" ||
        String(issue.status || "") ===
          statusFilter;

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus
      );
    });
  }, [
    issues,
    searchTerm,
    priorityFilter,
    statusFilter,
  ]);

  // =========================================================
  // STATISTICS
  // =========================================================

  const totalIssues = issues.length;

  const pendingIssues = issues.filter(
    (issue) =>
      issue.status === "OPEN" ||
      issue.status === "OWNER_REVIEW" ||
      issue.status === "ADMIN_REVIEW"
  ).length;

  const inProgressIssues = issues.filter(
    (issue) =>
      issue.status === "OWNER_RESPONDED"
  ).length;

  const resolvedIssues = issues.filter(
    (issue) =>
      issue.status === "RESOLVED" ||
      issue.status === "CLOSED"
  ).length;

  // =========================================================
  // OWNER NAME
  // =========================================================

  const ownerName =
    owner?.name ||
    owner?.fullName ||
    owner?.ownerName ||
    owner?.username ||
    "Owner";

  const ownerRole =
    owner?.role === "OWNER"
      ? "Hostel Owner"
      : owner?.role || "Hostel Owner";

  // =========================================================
  // PRIORITY COLORS
  // =========================================================

  const getPriorityClasses = (
    priority
  ) => {
    const normalized =
      String(priority || "")
        .toUpperCase();

    switch (normalized) {
      case "CRITICAL":
        return "bg-red-100 text-red-700";

      case "HIGH":
        return "bg-rose-100 text-rose-600";

      case "MEDIUM":
        return "bg-amber-100 text-amber-600";

      case "LOW":
        return "bg-emerald-100 text-emerald-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================================================
  // STATUS COLORS
  // =========================================================

  const getStatusClasses = (
    status
  ) => {
    const normalized = String(status || "").toUpperCase();

    switch (normalized) {
      case "OPEN":
        return "bg-orange-100 text-orange-600";

      case "OWNER_REVIEW":
        return "bg-blue-100 text-blue-600";

      case "OWNER_RESPONDED":
        return "bg-purple-100 text-purple-600";

      case "ADMIN_REVIEW":
        return "bg-indigo-100 text-indigo-600";

      case "REJECTED":
        return "bg-red-100 text-red-600";

      case "RESOLVED":
        return "bg-emerald-100 text-emerald-600";

      case "CLOSED":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  // =========================================================
  // DATE FORMATTER
  // =========================================================

  const formatDateTime = (
    value
  ) => {
    if (!value) {
      return "";
    }

    const parsedDate =
      new Date(value);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return String(value);
    }

    return parsedDate.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // =========================================================
  // RESOLUTION PANEL
  // =========================================================

  const openResolvePanel = () => {
  if (!selectedIssue) {
    return;
  }

  if (
    String(selectedIssue.status || "")
      .toUpperCase() === "RESOLVED"
  ) {
    return;
  }

  const issueId = String(selectedIssue.id);

  let savedDraft = resolutionDrafts[issueId];

  if (!savedDraft) {
    try {
      const storedDraft =
        localStorage.getItem(
          `issue-resolution-draft-${issueId}`
        );

      if (storedDraft) {
        savedDraft = JSON.parse(storedDraft);
      }
    } catch (error) {
      console.error(
        "Failed to load resolution draft:",
        error
      );
    }
  }

  setResolutionNote(
    savedDraft?.resolutionNote ||
      selectedIssue.resolution ||
      ""
  );

  setResolutionProofs([]);

  setResolutionDraftSaved(
    Boolean(savedDraft)
  );

  setShowResolvePanel(true);
};

  const closeResolvePanel = () => {
  setShowResolvePanel(false);
  setResolutionNote("");
  setResolutionProofs([]);
  setResolutionDraftSaved(false);
};

const handleSaveResolutionDraft = () => {
  if (!selectedIssue) {
    return;
  }

  if (!resolutionNote.trim()) {
    setError(
      "Please enter a resolution description before saving."
    );

    return;
  }

  const issueId = String(selectedIssue.id);

  const draft = {
    issueId,
    resolutionNote: resolutionNote.trim(),
    savedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(
      `issue-resolution-draft-${issueId}`,
      JSON.stringify(draft)
    );

    setResolutionDrafts((current) => ({
      ...current,
      [issueId]: draft,
    }));

    setResolutionDraftSaved(true);

    setError("");
  } catch (err) {
    console.error(
      "Failed to save resolution draft:",
      err
    );

    setError(
      "Unable to save the resolution draft."
    );
  }
};

const handleResolutionProofChange = (
  event
) => {
  const files = Array.from(
    event.target.files || []
  );

  if (files.length === 0) {
    return;
  }

  const remainingSlots =
    5 - resolutionProofs.length;

  if (remainingSlots <= 0) {
    setError(
      "You can upload a maximum of 5 validation proof images."
    );

    event.target.value = "";
    return;
  }

  const selectedFiles =
    files.slice(0, remainingSlots);

  const validFiles = [];

  for (const file of selectedFiles) {
    if (
      ![
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ].includes(file.type)
    ) {
      setError(
        "Only PNG, JPG, JPEG and WEBP images are allowed."
      );

      continue;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        `${file.name} is larger than 5MB.`
      );

      continue;
    }

    validFiles.push(file);
  }

  if (validFiles.length > 0) {
    setResolutionProofs(
      (current) => [
        ...current,
        ...validFiles,
      ]
    );

    setError("");
  }

  event.target.value = "";
};

const removeResolutionProof = (
  index
) => {
  setResolutionProofs(
    (current) =>
      current.filter(
        (_, fileIndex) =>
          fileIndex !== index
      )
  );
};

  // =========================================================
  // RESOLUTION SUBMIT
  // =========================================================

  const handleResolutionSubmit = async () => {
  if (!selectedIssue) {
    return;
  }

  if (!resolutionNote.trim()) {
    setError(
      "Please enter the resolution description."
    );

    return;
  }

  try {
    setIssueActionLoading(true);
    setError("");

    /*
     * -------------------------------------------------------
     * STEP 1
     * Submit the owner's resolution message.
     * -------------------------------------------------------
     *
     * This uses your existing backend endpoint.
     */
    const replyResponse = await fetch(
      apiUrl(
        `/api/owner/issues/${selectedIssue.id}/reply`
      ),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          message:
            resolutionNote.trim(),
        }),
      }
    );

    if (
      replyResponse.status === 401 ||
      replyResponse.status === 403
    ) {
      throw new Error(
        "You are not authorized to update this issue."
      );
    }

    if (!replyResponse.ok) {
      let message =
        `Unable to submit the resolution (${replyResponse.status}).`;

      try {
        const errorData =
          await replyResponse.json();

        message =
          errorData?.message ||
          errorData?.error ||
          message;
      } catch {
        // Keep default message.
      }

      throw new Error(message);
    }

    const replyData =
      await replyResponse.json();

    /*
     * -------------------------------------------------------
     * STEP 2
     * Change the issue status to RESOLVED.
     *
     * This means the owner has submitted the resolution
     * and the user must now verify it.
     * -------------------------------------------------------
     */
    const statusResponse = await fetch(
      apiUrl(
        `/api/owner/issues/${selectedIssue.id}/status`
      ),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          status: "RESOLVED",
        }),
      }
    );

    if (!statusResponse.ok) {
      let message =
        `The resolution was submitted, but the status could not be updated (${statusResponse.status}).`;

      try {
        const errorData =
          await statusResponse.json();

        message =
          errorData?.message ||
          errorData?.error ||
          message;
      } catch {
        // Keep default message.
      }

      throw new Error(message);
    }

    const statusData =
      await statusResponse.json();

    const updatedIssue =
      normalizeIssue({
        ...selectedIssue,
        ...statusData,
        status: "RESOLVED",
        resolution:
          resolutionNote.trim(),
        latestResponse:
          statusData?.latestResponse ||
          replyData ||
          selectedIssue.latestResponse,
      });

    setIssues(
      (currentIssues) =>
        currentIssues.map(
          (issue) =>
            String(issue.id) ===
            String(selectedIssue.id)
              ? {
                  ...issue,
                  ...updatedIssue,
                }
              : issue
        )
    );

    /*
     * -------------------------------------------------------
     * STEP 3
     * Remove the local draft because it has now been
     * submitted for user verification.
     * -------------------------------------------------------
     */
    try {
      localStorage.removeItem(
        `issue-resolution-draft-${selectedIssue.id}`
      );
    } catch (error) {
      console.error(
        "Failed to remove resolution draft:",
        error
      );
    }

    setResolutionDrafts(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          String(selectedIssue.id)
        ];

        return next;
      }
    );

    setResolutionDraftSaved(false);

    /*
     * -------------------------------------------------------
     * STEP 4
     * Close popup after successful submission.
     * -------------------------------------------------------
     */
    closeResolvePanel();

  } catch (err) {
    console.error(
      "Failed to submit issue resolution:",
      err
    );

    setError(
      err?.message ||
        "Unable to submit the issue resolution right now."
    );
  } finally {
    setIssueActionLoading(false);
  }
};


  // =========================================================
  // OWNER REPLY
  // =========================================================

  const handleOwnerReply = async () => {
    if (!selectedIssue) {
      return;
    }

    const message = window.prompt(
      "Enter your response to the user:"
    );

    if (!message || !message.trim()) {
      return;
    }

    try {
      setIssueActionLoading(true);
      setError("");

      const response = await fetch(
        apiUrl(`/api/owner/issues/${selectedIssue.id}/reply`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({
            message: message.trim(),
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `Unable to send the response (${response.status}).`;
        try {
          const data = await response.json();
          errorMessage = data?.message || data?.error || errorMessage;
        } catch {
          // Keep default message.
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          String(issue.id) === String(selectedIssue.id)
            ? normalizeIssue({
                ...issue,
                ...data,
                status: data?.status || "OWNER_RESPONDED",
                resolution: message.trim(),
              })
            : issue
        )
      );

      const detailsResponse = await fetch(
        apiUrl(`/api/owner/issues/${selectedIssue.id}`),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...getAuthHeaders(),
          },
        }
      );

      if (detailsResponse.ok) {
        const details = await detailsResponse.json();
        setIssues((currentIssues) =>
          currentIssues.map((issue) =>
            String(issue.id) === String(selectedIssue.id)
              ? normalizeIssue(details)
              : issue
          )
        );
      }
    } catch (err) {
      console.error("Failed to send owner response:", err);
      setError(
        err?.message ||
          "Unable to send the response right now."
      );
    } finally {
      setIssueActionLoading(false);
    }
  };

  // =========================================================
  // OWNER STATUS UPDATE
  // =========================================================

  const handleOwnerStatusUpdate = async (status) => {
    if (!selectedIssue || !status) {
      return;
    }

    try {
      setIssueActionLoading(true);
      setError("");

      const response = await fetch(
        apiUrl(`/api/owner/issues/${selectedIssue.id}/status`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...getAuthHeaders(),
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!response.ok) {
        let message = `Unable to update the issue status (${response.status}).`;
        try {
          const data = await response.json();
          message = data?.message || data?.error || message;
        } catch {
          // Keep default message.
        }
        throw new Error(message);
      }

      const data = await response.json();
      const normalized = normalizeIssue({
        ...selectedIssue,
        ...data,
        status,
      });

      setIssues((currentIssues) =>
        currentIssues.map((issue) =>
          String(issue.id) === String(selectedIssue.id)
            ? normalized
            : issue
        )
      );
    } catch (err) {
      console.error("Failed to update issue status:", err);
      setError(
        err?.message ||
          "Unable to update the issue status right now."
      );
    } finally {
      setIssueActionLoading(false);
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "jwtToken"
    );

    localStorage.removeItem(
      "accessToken"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "userData"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "admin"
    );

    localStorage.removeItem(
      "hostelId"
    );

    sessionStorage.removeItem(
      "token"
    );

    sessionStorage.removeItem(
      "jwtToken"
    );

    sessionStorage.removeItem(
      "accessToken"
    );

    sessionStorage.removeItem(
      "user"
    );

    sessionStorage.removeItem(
      "userData"
    );

    sessionStorage.removeItem(
      "role"
    );

    sessionStorage.removeItem(
      "admin"
    );

    setProfileOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  // =========================================================
  // CLOSE PROFILE DROPDOWN
  // =========================================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          profileMenuRef.current &&
          !profileMenuRef.current.contains(
            event.target
          )
        ) {
          setProfileOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // SIDEBAR
  // =========================================================

  const sidebarGroups = [
    {
      label: "MAIN",
      items: [
        {
          label: "Dashboard",
          icon: LayoutDashboard,
          path: "/owner/dashboard",
        },
      ],
    },
    {
      label: "MY HOSTEL",
      items: [
        {
          label: "Hostel Profile",
          icon: Building2,
          path: "/owner/hostel",
        },
        {
          label: "Rooms",
          icon: BedDouble,
          path: "/owner/rooms",
        },
        {
          label: "Amenities",
          icon: Sparkles,
          path: "/owner/amenities",
        },
        {
          label: "Photos",
          icon: Images,
          path: "/owner/photos",
        },
      ],
    },
    {
      label: "DISCOVERY",
      items: [
        {
          label: "Issues",
          icon: MessageSquare,
          path: "/owner/issues",
          active: true,
          count: pendingIssues,
        },
        {
          label: "Reviews",
          icon: Star,
          path: "/owner/reviews",
        },
      ],
    },
    {
      label: "INSIGHTS",
      items: [
        {
          label: "Analytics",
          icon: BarChart3,
          path: "/owner/analytics",
        },
      ],
    },
    {
      label: "ACCOUNT",
      items: [
        {
          label: "Settings",
          icon: Settings,
          path: "/owner/settings",
        },
        {
          label: "Support",
          icon: LifeBuoy,
          path: "/owner/support",
        },
      ],
    },
  ];

  // =========================================================
  // NAVIGATION
  // =========================================================

  const handleNavigation = (
    path
  ) => {
    navigate(path);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6faff]">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading hostel issues...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#f6faff] text-slate-800">

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[230px] flex-col border-r border-slate-200 bg-white">

        {/* LOGO */}

        <div className="flex h-[74px] items-center gap-3 border-b border-slate-100 px-5">

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <Building2
              size={24}
              strokeWidth={2.2}
            />
          </div>

          <div>
            <div className="text-[21px] font-bold leading-none text-blue-600">
              FindMyHostel
            </div>

            <div className="mt-1 text-[11px] font-semibold tracking-[0.08em] text-slate-500">
              OWNER PORTAL
            </div>
          </div>

        </div>

        {/* NAVIGATION */}

        <div className="flex-1 overflow-y-auto px-3 py-5">

          {sidebarGroups.map(
            (group) => (
              <div
                key={group.label}
                className="mb-6"
              >

                <div className="mb-2 px-3 text-[11px] font-bold tracking-wide text-slate-400">
                  {group.label}
                </div>

                <div className="space-y-1">

                  {group.items.map(
                    (item) => {
                      const Icon =
                        item.icon;

                      return (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() =>
                            handleNavigation(
                              item.path
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[14px] font-medium transition ${
                            item.active
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >

                          <Icon
                            size={20}
                            strokeWidth={
                              item.active
                                ? 2.4
                                : 2
                            }
                          />

                          <span className="flex-1">
                            {item.label}
                          </span>

                          {item.count >
                            0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-bold text-white">
                              {
                                item.count
                              }
                            </span>
                          )}

                        </button>
                      );
                    }
                  )}

                </div>

              </div>
            )
          )}

        </div>

        {/* SIDEBAR FOOTER */}

        <div className="border-t border-slate-100 p-4">

          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            View Public Listing
            <ExternalLink size={15} />
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <div className="ml-[235px] h-screen flex flex-col overflow-hidden">

        {/* TOP HEADER */}

        <header className="flex h-[74px] flex-shrink-0 items-center justify-end border-b border-slate-200 bg-white px-6">

          <div className="flex items-center gap-5">

            {/* NOTIFICATION */}

            <button
              type="button"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50"
            >
              <Bell size={20} />

              {pendingIssues >
                0 && (
                <span className="absolute right-1 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {
                    pendingIssues
                  }
                </span>
              )}
            </button>

            <div className="h-7 w-px bg-slate-200" />

            {/* PROFILE */}

            <div
              ref={profileMenuRef}
              className="relative"
            >

              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (value) =>
                      !value
                  )
                }
                className="flex items-center gap-3 rounded-lg px-1 py-1.5 hover:bg-slate-50"
              >

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                  {ownerName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hidden text-left sm:block">

                  <div className="text-[13px] font-semibold text-slate-800">
                    {ownerName}
                  </div>

                  <div className="text-[12px] text-slate-500">
                    {ownerRole}
                  </div>

                </div>

                <ChevronDown
                  size={17}
                  className={`text-slate-500 transition ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>

              {profileOpen && (
                <div className="absolute right-0 top-14 z-50 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">

                  <div className="border-b border-slate-100 px-3 py-3">

                    <div className="font-semibold text-slate-800">
                      {ownerName}
                    </div>

                    <div className="text-xs text-slate-500">
                      {ownerRole}
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="mt-1 w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* CONTENT */}
        
        <div className="flex-1 overflow-y-auto">
        <main className="px-6 py-6">

          {/* BREADCRUMB */}

          <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">

            <span>
              My Hostel
            </span>

            <ChevronRight
              size={15}
            />

            <span className="font-medium text-slate-800">
              Issues
            </span>

          </div>

          {/* HEADING */}

          <div className="mb-6">

            <h1 className="text-[28px] font-bold tracking-tight text-slate-900">
              Issues
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View and manage issues reported by users. Check
              details, review proofs and resolve them.
            </p>

          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* =================================================
              SUMMARY
          ================================================== */}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                  <AlertTriangle
                    size={22}
                  />
                </div>

                <div>

                  <div className="text-xs font-medium text-slate-500">
                    Total Issues
                  </div>

                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {totalIssues}
                  </div>

                </div>

              </div>

            </div>

            {/* PENDING */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-500">
                  <Clock3 size={22} />
                </div>

                <div>

                  <div className="text-xs font-medium text-slate-500">
                    Pending
                  </div>

                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {pendingIssues}
                  </div>

                </div>

              </div>

            </div>

            {/* IN PROGRESS */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-500">
                  <Clock3 size={22} />
                </div>

                <div>

                  <div className="text-xs font-medium text-slate-500">
                    In Progress
                  </div>

                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {inProgressIssues}
                  </div>

                </div>

              </div>

            </div>

            {/* RESOLVED */}

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                  <CheckCircle2
                    size={22}
                  />
                </div>

                <div>

                  <div className="text-xs font-medium text-slate-500">
                    Resolved
                  </div>

                  <div className="mt-1 text-2xl font-bold text-slate-900">
                    {resolvedIssues}
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              SEARCH AND FILTER
          ================================================== */}

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

            <div className="flex flex-col gap-2 md:flex-row">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search issues..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />

              </div>

              {/* PRIORITY */}

              <div className="relative">

                <select
                  value={
                    priorityFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setPriorityFilter(
                      event.target
                        .value
                    )
                  }
                  className="h-11 min-w-[145px] appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >

                  <option>
                    All Priority
                  </option>

                  <option value="CRITICAL">
                    Critical
                  </option>

                  <option value="HIGH">
                    High
                  </option>

                  <option value="MEDIUM">
                    Medium
                  </option>

                  <option value="LOW">
                    Low
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

              {/* STATUS */}

              <div className="relative">

                <select
                  value={
                    statusFilter
                  }
                  onChange={(
                    event
                  ) =>
                    setStatusFilter(
                      event.target
                        .value
                    )
                  }
                  className="h-11 min-w-[145px] appearance-none rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >

                  <option>
                    All Status
                  </option>

                  <option value="OPEN">
                    Open
                  </option>

                  <option value="OWNER_REVIEW">
                    Owner Review
                  </option>

                  <option value="OWNER_RESPONDED">
                    Owner Responded
                  </option>

                  <option value="ADMIN_REVIEW">
                    Admin Review
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                  <option value="RESOLVED">
                    Resolved
                  </option>

                  <option value="CLOSED">
                    Closed
                  </option>

                </select>

                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

              </div>

            </div>

          </div>

          {/* =================================================
              ISSUE WORKSPACE
          ================================================== */}

          <div className="mt-4 grid min-h-[600px] grid-cols-1 gap-4 xl:grid-cols-[410px_minmax(0,1fr)]">

            {/* ISSUE LIST */}

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="max-h-[650px] overflow-y-auto">

                {filteredIssues.length ===
                0 ? (
                  <div className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">

                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">

                      <MessageSquare
                        size={28}
                      />

                    </div>

                    <h3 className="mt-5 text-base font-semibold text-slate-800">
                      No hostel issues
                      reported yet
                    </h3>

                    <p className="mt-2 max-w-[290px] text-sm leading-6 text-slate-500">
                      When users report an issue
                      for this hostel, the actual
                      issue details will appear here.
                    </p>

                  </div>
                ) : (
                  filteredIssues.map(
                    (issue) => {
                      const selected =
                        String(
                          issue.id
                        ) ===
                        String(
                          selectedIssueId
                        );

                      return (
                        <button
                          key={issue.id}
                          type="button"
                          onClick={() =>
                            setSelectedIssueId(
                              issue.id
                            )
                          }
                          className={`block w-full border-b border-slate-100 px-4 py-4 text-left transition last:border-b-0 ${
                            selected
                              ? "bg-blue-50/80 ring-1 ring-inset ring-blue-400"
                              : "hover:bg-slate-50"
                          }`}
                        >

                          <div className="flex items-start justify-between gap-3">

                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getPriorityClasses(
                                issue.priority
                              )}`}
                            >
                              {
                                issue.priority
                              }
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClasses(
                                issue.status
                              )}`}
                            >
                              {
                                issue.status
                              }
                            </span>

                          </div>

                          <div className="mt-3 flex items-start gap-2">

                            <div className="min-w-0 flex-1">

                              <h3 className="truncate text-[14px] font-semibold text-slate-900">
                                {
                                  issue.title
                                }
                              </h3>

                              <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-slate-500">
                                {
                                  issue.description
                                }
                              </p>

                            </div>

                            <ChevronRight
                              size={19}
                              className="mt-1 shrink-0 text-slate-400"
                            />

                          </div>

                          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">

                            <CalendarDays
                              size={14}
                            />

                            <span>
                              {formatDateTime(
                                issue.createdAt ||
                                  issue.createdDate ||
                                  issue.date
                              )}
                            </span>

                          </div>

                        </button>
                      );
                    }
                  )
                )}

              </div>

            </div>

            {/* SELECTED ISSUE */}

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              {selectedIssue ? (
                <div className="flex h-full flex-col">

                  {/* HEADER */}

                  <div className="border-b border-slate-100 p-5">

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0 flex-1">

                        <div className="mb-3 flex items-center gap-2">

                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getPriorityClasses(
                              selectedIssue.priority
                            )}`}
                          >
                            {
                              selectedIssue.priority
                            }
                          </span>

                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClasses(
                              selectedIssue.status
                            )}`}
                          >
                            {
                              selectedIssue.status
                            }
                          </span>

                        </div>

                        <h2 className="text-[21px] font-bold text-slate-900">
                          {
                            selectedIssue.title
                          }
                        </h2>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">

                          <CalendarDays
                            size={14}
                          />

                          <span>
                            {formatDateTime(
                              selectedIssue.createdAt ||
                                selectedIssue.createdDate ||
                                selectedIssue.date
                            )}
                          </span>

                          {selectedIssue.reporter && (
                            <>
                              <span>
                                •
                              </span>

                              <span>
                                Reported by:{" "}
                                <span className="font-medium text-slate-700">
                                  {
                                    selectedIssue.reporter
                                  }
                                </span>

                                {selectedIssue.reporterRole &&
                                  ` (${selectedIssue.reporterRole})`}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <div className="flex-1 overflow-y-auto p-5">

                    {/* ISSUE DETAILS */}

                    <section>

                      <div className="mb-3 flex items-center gap-2">

                        <MessageSquareText
                          size={19}
                          className="text-slate-700"
                        />

                        <h3 className="text-[15px] font-semibold text-slate-800">
                          Issue Details
                        </h3>

                      </div>

                      <div className="rounded-lg bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
                        {
                          selectedIssue.description
                        }
                      </div>

                    </section>

                    {/* PROOF IMAGES */}

                    {/* PROOF IMAGES */}

<section className="mt-7">

  <div className="mb-3 flex items-center gap-2">

    <Images
      size={19}
      className="text-slate-700"
    />

    <h3 className="text-[15px] font-semibold text-slate-800">
      Proof Images
    </h3>

  </div>

  {Array.isArray(
    selectedIssue.proofImages
  ) &&
  selectedIssue.proofImages.length > 0 ? (

    <div className="flex flex-wrap gap-3">

      {selectedIssue.proofImages.map(
        (
          image,
          index
        ) => {

          const imageCandidates =
            Array.isArray(
              image?.candidates
            )
              ? image.candidates
              : buildIssueImageUrls(
                  typeof image === "string"
                    ? image
                    : image?.fileUrl ||
                      image?.url ||
                      image?.imageUrl ||
                      image?.photoUrl ||
                      image?.filePath ||
                      image?.path ||
                      image?.fileName
                );

          const imageUrl =
            imageCandidates[0] || "";

          if (!imageUrl) {
            return null;
          }

          return (
            <div
              key={
                image?.id ||
                `${imageUrl}-${index}`
              }
              className="group relative h-32 w-44 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >

              <img
                src={imageUrl}
                alt={`Issue proof ${
                  index + 1
                }`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                onError={(event) => {
                  const currentSrc =
                    event.currentTarget.src;

                  const nextUrl =
                    imageCandidates.find(
                      (candidate) =>
                        candidate &&
                        candidate !==
                          currentSrc
                    );

                  if (nextUrl) {
                    event.currentTarget.src =
                      nextUrl;
                    return;
                  }

                  /*
                   * All possible URLs failed.
                   * Keep the existing image area but
                   * show a clear fallback.
                   */
                  event.currentTarget.style.display =
                    "none";

                  const fallback =
                    event.currentTarget
                      .parentElement
                      ?.querySelector(
                        "[data-image-fallback]"
                      );

                  if (fallback) {
                    fallback.classList.remove(
                      "hidden"
                    );
                  }
                }}
              />

              <div
                data-image-fallback
                className="absolute inset-0 hidden flex-col items-center justify-center bg-slate-100 px-3 text-center"
              >
                <Images
                  size={24}
                  className="text-slate-400"
                />

                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  Image unavailable
                </p>
              </div>

              <div className="absolute bottom-2 left-2 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white">
                {
                  selectedIssue
                    .proofImages
                    .length
                }{" "}
                {selectedIssue
                  .proofImages
                  .length === 1
                  ? "photo"
                  : "photos"}
              </div>

            </div>
          );
        }
      )}

    </div>

  ) : (

    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">

      <Images
        size={24}
        className="mx-auto text-slate-400"
      />

      <p className="mt-2 text-sm text-slate-500">
        No proof images uploaded by the user.
      </p>

    </div>

  )}

</section>

                    {/* INFORMATION */}

                    <section className="mt-7">

                      <h3 className="mb-4 text-[15px] font-semibold text-slate-800">
                        Issue Information
                      </h3>

                      <div className="overflow-hidden rounded-lg border border-slate-100">

                        <div className="grid grid-cols-[120px_1fr] border-b border-slate-100 px-4 py-3 text-sm">

                          <span className="text-slate-500">
                            Room
                          </span>

                          <span className="font-medium text-slate-800">
                            {
                              selectedIssue.room ||
                              "Not specified"
                            }
                          </span>

                        </div>

                        <div className="grid grid-cols-[120px_1fr] border-b border-slate-100 px-4 py-3 text-sm">

                          <span className="text-slate-500">
                            Priority
                          </span>

                          <span>

                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getPriorityClasses(
                                selectedIssue.priority
                              )}`}
                            >
                              {
                                selectedIssue.priority
                              }
                            </span>

                          </span>

                        </div>

                        <div className="grid grid-cols-[120px_1fr] px-4 py-3 text-sm">

                          <span className="text-slate-500">
                            Status
                          </span>

                          <span>

                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusClasses(
                                selectedIssue.status
                              )}`}
                            >
                              {
                                selectedIssue.status
                              }
                            </span>

                          </span>

                        </div>

                      </div>

                    </section>

                    {/* EXISTING RESOLUTION */}

                    {selectedIssue.resolution && (
                      <section className="mt-7">

                        <div className="mb-3 flex items-center gap-2">

                          <CheckCircle2
                            size={19}
                            className="text-emerald-500"
                          />

                          <h3 className="text-[15px] font-semibold text-slate-800">
                            Resolution
                          </h3>

                        </div>

                        <div className="rounded-lg bg-emerald-50 px-4 py-4 text-sm leading-6 text-emerald-800">
                          {
                            selectedIssue.resolution
                          }
                        </div>

                      </section>
                    )}

                  </div>

                  {/* BOTTOM ACTION */}

                  <div className="border-t border-slate-100 p-5 space-y-3">

  {issueActionLoading && (
    <div className="rounded-lg bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-700">
      Updating issue...
    </div>
  )}

  {["RESOLVED", "CLOSED"].includes(
    String(selectedIssue.status || "").toUpperCase()
  ) ? (
    <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
      <CheckCircle2 size={18} />
      Issue Resolved
    </div>
  ) : String(
      selectedIssue.status || ""
    ).toUpperCase() === "OWNER_RESPONDED" ? (
    <div className="rounded-lg bg-purple-50 px-4 py-3 text-center text-sm font-semibold text-purple-700">
      Owner response submitted. The issue is waiting for further review.
    </div>
  ) : (
    <button
      type="button"
      onClick={openResolvePanel}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
    >
      Resolve Issue
    </button>
  )}

</div>

                </div>

              ) : (

                <div className="flex h-full min-h-[600px] flex-col items-center justify-center px-6 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <MessageSquare
                      size={28}
                    />
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-slate-800">
                    {issues.length ===
                    0
                      ? "No issue selected"
                      : "Select an issue"}
                  </h3>

                  <p className="mt-2 max-w-[340px] text-sm leading-6 text-slate-500">
                    {issues.length ===
                    0
                      ? "When a user reports an issue for your hostel, its complete details and proof will appear here."
                      : "Select an issue from the list to view the complete complaint, proof and resolution options."}
                  </p>

                </div>

              )}

            </div>

          </div>

        </main>

        </div>

      </div>

      {/* =====================================================
          RESOLVE PANEL
      ====================================================== */}

      {showResolvePanel &&
  selectedIssue && (
    <>

      {/* OVERLAY */}

      <div
        className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px]"
        onClick={
          issueActionLoading
            ? undefined
            : closeResolvePanel
        }
      />

      {/* PANEL */}

      <div className="fixed right-0 top-0 z-50 h-screen w-full max-w-[460px] border-l border-slate-200 bg-white shadow-2xl">

        <div className="flex h-full flex-col">

          {/* HEADER */}

          <div className="border-b border-slate-100 px-5 py-5">

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-[18px] font-bold text-slate-900">
                  Resolve Issue
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Describe how the issue was resolved
                  before submitting it for user
                  verification.
                </p>

              </div>

              <button
                type="button"
                disabled={
                  issueActionLoading
                }
                onClick={
                  closeResolvePanel
                }
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

          </div>

          {/* BODY */}

          <div className="flex-1 overflow-y-auto px-5 py-5">

            {/* ISSUE */}

            <div className="mb-5 rounded-lg bg-slate-50 p-4">

              <div className="text-xs font-medium text-slate-500">
                Issue
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-800">
                {
                  selectedIssue.title
                }
              </div>

              {selectedIssue.description && (
                <div className="mt-2 text-xs leading-5 text-slate-500">
                  {
                    selectedIssue.description
                  }
                </div>
              )}

            </div>

            {/* DRAFT NOTICE */}

            {resolutionDraftSaved && (
              <div className="mb-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">

                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0 text-blue-600"
                />

                <div>

                  <p className="text-xs font-semibold text-blue-800">
                    Resolution draft saved
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-700">
                    Your resolution is saved as a
                    draft. You can edit it before
                    submitting it for verification.
                  </p>

                </div>

              </div>
            )}

            {/* RESOLUTION DESCRIPTION */}

            <div>

              <label className="mb-2 block text-sm font-semibold text-slate-800">
                Resolution Description{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <textarea
                value={
                  resolutionNote
                }
                onChange={(event) =>
                  setResolutionNote(
                    event.target.value
                  )
                }
                maxLength={500}
                rows={7}
                placeholder="Describe what was done to resolve this issue..."
                disabled={
                  issueActionLoading
                }
                className="w-full resize-none rounded-lg border border-slate-200 px-3 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50"
              />

              <div className="mt-1 flex items-center justify-between">

                <p className="text-[11px] text-slate-400">
                  Explain what was repaired,
                  replaced, tested or changed.
                </p>

                <span className="text-[11px] text-slate-400">
                  {
                    resolutionNote.length
                  }
                  /500
                </span>

              </div>

            </div>

            {/* EXAMPLE */}

            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">

              <p className="text-[11px] font-semibold text-slate-600">
                Example
              </p>

              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                The damaged bathroom pipe was
                replaced with a new PVC pipe. The
                water supply was tested for 15
                minutes after replacement and no
                leakage was observed.
              </p>

            </div>

            {/* VALIDATION PROOF */}

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between">

                <label className="block text-sm font-semibold text-slate-800">

                  Validation Proof

                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>

                </label>

                <span className="text-[11px] font-medium text-slate-400">
                  {
                    resolutionProofs.length
                  }
                  /5
                </span>

              </div>

              <p className="mb-3 text-[11px] leading-5 text-slate-500">
                Add photos showing the completed
                repair, replaced component or final
                condition.
              </p>

              {/* UPLOAD */}

              {resolutionProofs.length <
                5 && (
                <label className="flex min-h-[125px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-4 text-center transition hover:border-blue-400 hover:bg-blue-50/40">

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Upload
                      size={19}
                    />
                  </div>

                  <div className="mt-2 text-xs font-semibold text-slate-600">
                    Add Validation Proof
                  </div>

                  <div className="mt-1 text-[11px] text-slate-400">
                    Upload up to 5 images • PNG,
                    JPG, JPEG, WEBP • Max 5MB each
                  </div>

                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    multiple
                    disabled={
                      issueActionLoading
                    }
                    className="hidden"
                    onChange={
                      handleResolutionProofChange
                    }
                  />

                </label>
              )}

              {/* SELECTED PROOFS */}

              {resolutionProofs.length >
                0 && (
                <div className="mt-3 grid grid-cols-2 gap-3">

                  {resolutionProofs.map(
                    (
                      file,
                      index
                    ) => {

                      const previewUrl =
                        URL.createObjectURL(
                          file
                        );

                      return (
                        <div
                          key={`${file.name}-${file.lastModified}-${index}`}
                          className="group relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                        >

                          <img
                            src={
                              previewUrl
                            }
                            alt={`Validation proof ${
                              index +
                              1
                            }`}
                            className="h-32 w-full object-cover"
                          />

                          <button
                            type="button"
                            disabled={
                              issueActionLoading
                            }
                            onClick={() =>
                              removeResolutionProof(
                                index
                              )
                            }
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <X
                              size={15}
                            />
                          </button>

                          <div className="px-2 py-2">

                            <p className="truncate text-[11px] font-medium text-slate-700">
                              {
                                file.name
                              }
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {(
                                file.size /
                                1024 /
                                1024
                              ).toFixed(
                                2
                              )}{" "}
                              MB
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>
              )}

            </div>

            {/* WORKFLOW NOTICE */}

            <div className="mt-6 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">

              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-500"
              />

              <div>

                <p className="text-xs font-semibold text-amber-800">
                  User verification required
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800">
                  Saving keeps this resolution as a
                  draft. When you choose
                  <strong>
                    {" "}
                    Submit for Verification
                  </strong>
                  , the issue becomes
                  <strong>
                    {" "}
                    RESOLVED
                  </strong>
                  and the user can confirm whether
                  the issue has actually been solved.
                </p>

              </div>

            </div>

          </div>

          {/* FOOTER */}

          <div className="border-t border-slate-100 bg-white p-5">

            <div className="grid grid-cols-2 gap-3">

              {/* CANCEL */}

              <button
                type="button"
                disabled={
                  issueActionLoading
                }
                onClick={
                  closeResolvePanel
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {/* SAVE */}

              <button
                type="button"
                disabled={
                  !resolutionNote.trim() ||
                  issueActionLoading
                }
                onClick={
                  handleSaveResolutionDraft
                }
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                  resolutionNote.trim() &&
                  !issueActionLoading
                    ? "border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    : "cursor-not-allowed bg-slate-100 text-slate-400"
                }`}
              >
                Save Resolution
              </button>

            </div>

            {/* SUBMIT */}

            <button
              type="button"
              disabled={
                !resolutionNote.trim() ||
                issueActionLoading
              }
              onClick={
                handleResolutionSubmit
              }
              className={`mt-3 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold text-white transition ${
                resolutionNote.trim() &&
                !issueActionLoading
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "cursor-not-allowed bg-slate-300"
              }`}
            >

              {issueActionLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2
                    size={17}
                  />
                  Submit for Verification
                </>
              )}

            </button>

          </div>

        </div>

      </div>

    </>
  )}

    </div>
  );
}

export default Issues;