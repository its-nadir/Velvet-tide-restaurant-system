import React, { useEffect, useState, useCallback, useRef } from "react";
import ReservationPopup from "../../components/ReservationPopup";
import {
  adminTheme,
  createCardStyle,
  createChipStyle,
  fieldLabelStyle,
  sectionHeadingStyle,
  textInputStyle,
  underlineStyle,
} from "./adminTheme";
import { API_BASE_URL } from "../../config/api";
const RESERVATION_FETCH_LIMIT = 250;
const RESERVATIONS_CACHE_KEY = "adminReservationsCache";

const statusStyles = {
  confirmed: {
    background: "rgba(39, 174, 96, 0.15)",
    color: "#168043",
    dot: "#27ae60",
  },
  pending: {
    background: "rgba(241, 196, 15, 0.15)",
    color: "#b37b00",
    dot: "#f1c40f",
  },
  cancelled: {
    background: "rgba(231, 76, 60, 0.15)",
    color: "#a1261a",
    dot: "#e74c3c",
  },
  default: {
    background: "rgba(189, 195, 199, 0.2)",
    color: "#5f6a6a",
    dot: "#95a5a6",
  },
};

const actionIcons = {
  edit: "/Icons/edit.png",
  cancelDefault: "/Icons/cancel.png",
  cancelAlt: "/Icons/cancel(1).png",
  approve: "/Icons/confirmation.png",
  approveAlt: "/Icons/confirmation (1).png",
  menu: "/Icons/dropdown-arrow.svg",
  more: "/Icons/arrow-down.png",
};

const statusSummaryIcons = {
  Confirmed: {
    icon: "/Icons/confirmation.png",
  },
  Pending: {
    icon: "/Icons/Pending.png",
  },
  Cancelled: {
    icon: "/Icons/cancel(1).png",
  },
};

const actionButtonStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "12px",
  border: "1px solid rgba(0, 0, 0, 0.08)",
  backgroundColor: "transparent",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "background-color 0.2s ease",
};

const statusFilterOptions = [
  { label: "All statuses", value: "all" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Pending", value: "pending" },
  { label: "Cancelled", value: "cancelled" },
];

const datePickerCSS = `
  input[type="date"].date-picker-input::-webkit-calendar-picker-indicator {
    opacity: 0;
    display: none;
  }
  input[type="date"].date-picker-input::-webkit-inner-spin-button,
  input[type="date"].date-picker-input::-webkit-clear-button {
    display: none;
  }
  input[type="date"].date-picker-input::-ms-clear {
    display: none;
  }
  input[type="date"].date-picker-input {
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
  }
`;

const getAuthHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleUnauthorized = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminProfile");
  window.location.href = "/admin";
};

const fetchWithAuth = async (url, options = {}) => {
  const headers = { ...(options.headers || {}), ...getAuthHeaders() };
  const response = await fetch(url, { ...options, headers });
  if (response.status === 401) {
    handleUnauthorized();
    throw new Error("Unauthorized");
  }
  return response;
};

const readReservationsCache = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(RESERVATIONS_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeReservationsCache = (items) => {
  if (typeof window === "undefined") return null;
  try {
    const payload = { items, timestamp: Date.now() };
    localStorage.setItem(RESERVATIONS_CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
};

const clearReservationsCache = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(RESERVATIONS_CACHE_KEY);
  } catch {
    // ignore
  }
};

const reservationTimestamp = (reservation) => {
  const datePart = reservation?.reservation_date || "";
  const timePart = reservation?.reservation_time || "00:00";
  const parsed = Date.parse(`${datePart}T${timePart}`);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sortReservations = (reservations = []) =>
  [...reservations].sort((a, b) => reservationTimestamp(a) - reservationTimestamp(b));

const formatDateForDisplay = (value) => {
  if (!value) return "DD-MM-YYYY";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return "DD-MM-YYYY";
  return `${day}-${month}-${year}`;
};

const formatDateForTable = (value) => {
  if (!value) return "";
  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) return "";
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

const formatDateForApi = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().split("T")[0];
};

const createEmptyEditForm = () => ({
  guest_name: "",
  phone_number: "",
  reservation_date: "",
  reservation_time: "",
  number_of_persons: "1",
  notes: "",
  table: "",
});

const editFieldLabelStyleMono = {
  fontSize: "0.65rem",
  textTransform: "uppercase",
  letterSpacing: "0.2em",
  color: "#a6a6a6",
  fontFamily: "'Montserrat', sans-serif",
};

const editInputBaseStyle = {
  border: "none",
  borderBottom: "1px solid #e5e5e5",
  padding: "6px 0",
  fontSize: "0.85rem",
  fontWeight: 600,
  fontFamily: "'Montserrat', sans-serif",
  color: "#1d1d1d",
  background: "transparent",
};

const editTextAreaStyle = {
  border: "1px solid #eee",
  borderRadius: "0",
  padding: "14px 16px",
  fontSize: "0.85rem",
  fontFamily: "'Montserrat', sans-serif",
  color: "#5b5b5b",
  background: "#fafafa",
  minHeight: "120px",
  resize: "vertical",
  outline: "none",
};


const todayString = new Date().toISOString().split("T")[0];

export default function ReservationsManagement() {
  const cacheRef = useRef(readReservationsCache());
  const reservationsRef = useRef(cacheRef.current?.items || []);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const [dateFrom, setDateFrom] = useState(todayString);
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingDate, setEditingDate] = useState(false);
  const [reservations, setReservationsState] = useState(
    () => cacheRef.current?.items || []
  );
  const [serverPagination, setServerPagination] = useState(null);
  const [isLoading, setIsLoading] = useState(!cacheRef.current);
  const [fetchError, setFetchError] = useState("");
  const [showInlineFilters, setShowInlineFilters] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);
  const statusDropdownRef = useRef(null);
  const dateFromInputRef = useRef(null);
  const dateToInputRef = useRef(null);
  const [isAddReservationOpen, setIsAddReservationOpen] = useState(false);
  const [approvalTarget, setApprovalTarget] = useState(null);
  const [approvalReservationId, setApprovalReservationId] = useState(null);
  const [selectedTable, setSelectedTable] = useState("");
  const [approvalTables, setApprovalTables] = useState([]);
  const [isApprovalTablesLoading, setIsApprovalTablesLoading] = useState(false);
  const [approvalTablesError, setApprovalTablesError] = useState("");
  const [isConfirmingReservation, setIsConfirmingReservation] = useState(false);
  const [confirmReservationError, setConfirmReservationError] = useState("");
  const [isApprovalDetailsLoading, setIsApprovalDetailsLoading] = useState(false);
  const [approvalDetailsError, setApprovalDetailsError] = useState("");
  const [cancellationTarget, setCancellationTarget] = useState(null);
  const [isCancellingReservation, setIsCancellingReservation] = useState(false);
  const [cancelReservationError, setCancelReservationError] = useState("");
  const [statusMutationReservationId, setStatusMutationReservationId] = useState(null);
  const [statusMutationError, setStatusMutationError] = useState("");
  const [editTarget, setEditTarget] = useState(null);
  const [editReservationId, setEditReservationId] = useState(null);
  const [editFormValues, setEditFormValues] = useState(createEmptyEditForm);
  const [isEditSaving, setIsEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [isEditDetailsLoading, setIsEditDetailsLoading] = useState(false);
  const [editDetailsError, setEditDetailsError] = useState("");
  const [editTableOptions, setEditTableOptions] = useState([]);
  const [isEditTablesLoading, setIsEditTablesLoading] = useState(false);
  const [editTableError, setEditTableError] = useState("");
  const fetchControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const persistReservationsCache = (items) => {
    if (!Array.isArray(items)) return;
    if (!items.length) {
      clearReservationsCache();
      cacheRef.current = null;
      return;
    }
    const payload = writeReservationsCache(items);
    cacheRef.current = payload || { items, timestamp: Date.now() };
  };

  const setReservations = (updater) => {
    setReservationsState((prev) => {
      const nextValue = typeof updater === "function" ? updater(prev) : updater;
      if (!Array.isArray(nextValue)) {
        return prev;
      }
      const sorted = sortReservations(nextValue);
      persistReservationsCache(sorted);
      reservationsRef.current = sorted;
      return sorted;
    });
  };

  const upsertReservation = (nextReservation) => {
    if (!nextReservation || !nextReservation._id) return;
    setReservations((prev) => {
      const exists = prev.some((reservation) => reservation._id === nextReservation._id);
      if (exists) {
        return prev.map((reservation) =>
          reservation._id === nextReservation._id ? nextReservation : reservation
        );
      }
      return [nextReservation, ...prev];
    });
  };
  const [editSelectedTable, setEditSelectedTable] = useState("");
  const [expandedReservationId, setExpandedReservationId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const openDatePicker = useCallback((inputRef) => {
    const input = inputRef?.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
      input.click();
    }
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    reservationsRef.current = reservations;
  }, [reservations]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target)
      ) {
        setIsStatusFilterOpen(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  const fetchReservations = useCallback(
    async ({ isSoft = false } = {}) => {
      const shouldShowFullLoader = !isSoft && reservationsRef.current.length === 0;
      if (shouldShowFullLoader) {
        setIsLoading(true);
      }
      setFetchError("");

      fetchControllerRef.current?.abort();
      const controller = new AbortController();
      fetchControllerRef.current = controller;
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;
      let shouldSkipStateUpdate = false;

      try {
        const params = new URLSearchParams({
          limit: String(RESERVATION_FETCH_LIMIT),
        });
        if (dateFrom) {
          params.set("from", dateFrom);
        }
        if (dateTo) {
          params.set("to", dateTo);
        }
        const response = await fetchWithAuth(`${API_BASE_URL}/api/reservations?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error("Failed to load reservations");
        }
        const payload = await response.json();
        const normalizedData = Array.isArray(payload)
          ? payload
          : Array.isArray(payload.data)
          ? payload.data
          : [];

        if (requestIdRef.current !== requestId) {
          return;
        }

        setReservations(normalizedData);
        setServerPagination(
          !Array.isArray(payload) && payload.pagination ? payload.pagination : null
        );
      } catch (error) {
        if (error.name === "AbortError" || requestIdRef.current !== requestId) {
          shouldSkipStateUpdate = true;
          return;
        }
        setFetchError(error.message || "Unable to fetch reservations");
      } finally {
        if (fetchControllerRef.current === controller) {
          fetchControllerRef.current = null;
        }
        if (!shouldSkipStateUpdate && requestIdRef.current === requestId && shouldShowFullLoader) {
          setIsLoading(false);
        }
      }
    },
    [dateFrom, dateTo]
  );

  useEffect(() => {
    fetchReservations();
    return () => {
      fetchControllerRef.current?.abort();
    };
  }, [fetchReservations]);

  useEffect(() => {
    const handleRefresh = () => fetchReservations({ isSoft: true });
    window.addEventListener("reservation:created", handleRefresh);
    return () => window.removeEventListener("reservation:created", handleRefresh);
  }, [fetchReservations]);

  const filteredReservations = reservations.filter((reservation) => {
    const normalizedQuery = searchQuery.toLowerCase();
    const phoneValue = String(reservation.phone_number || "-");
    const guestNameValue = String(reservation.guest_name || "");
    const phoneMatch = phoneValue.toLowerCase().includes(normalizedQuery);
    const nameMatch = guestNameValue.toLowerCase().includes(normalizedQuery);
    const notesMatch = reservation.notes?.toLowerCase().includes(normalizedQuery);
    const matchesSearch = !normalizedQuery || phoneMatch || nameMatch || notesMatch;

    const reservationDate = reservation.reservation_date
      ? new Date(reservation.reservation_date).toISOString().split("T")[0]
      : "";
    const matchesDate =
      (!dateFrom || reservationDate >= dateFrom) && (!dateTo || reservationDate <= dateTo);
    const reservationStatus = (reservation.status || "pending").toLowerCase();
    const matchesStatus = statusFilter === "all" || reservationStatus === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const statusCounts = reservations.reduce((acc, reservation) => {
    const normalized = (reservation.status || "pending").toLowerCase();
    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFrom, dateTo, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / pageSize));
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const safeCurrentPage = Math.min(currentPage, totalPages);
  const pageStartIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedReservations = filteredReservations.slice(
    pageStartIndex,
    pageStartIndex + pageSize
  );

  useEffect(() => {
    setExpandedReservationId(null);
  }, [safeCurrentPage]);

  const guestCount = filteredReservations.reduce(
    (sum, reservation) => sum + (reservation.number_of_persons || 0),
    0
  );
  const displayedRangeStart = filteredReservations.length ? pageStartIndex + 1 : 0;
  const displayedRangeEnd = filteredReservations.length
    ? Math.min(pageStartIndex + pageSize, filteredReservations.length)
    : 0;
  const isMobileTable = windowWidth <= 640;
  const contentWrapperStyle = {
    maxWidth: windowWidth <= 768 ? "540px" : "100%",
    width: "100%",
    margin: "0 auto",
    padding: windowWidth <= 768 ? "0 8px" : "0",
  };
  const tableColumnTemplate = isMobileTable
    ? "repeat(2, minmax(0, 1fr))"
    : windowWidth <= 1024
    ? "repeat(2, minmax(0, 1fr))"
    : "0.6fr 1.2fr 1.1fr 0.95fr 0.75fr 1.1fr 1.1fr 2fr";
  const cancellationGuestName =
    (cancellationTarget && (cancellationTarget.guest_name || cancellationTarget.name)) || "";
  const cancellationDateLabel = cancellationTarget
    ? formatDateForTable(cancellationTarget.reservation_date)
    : "";
  const cancellationTimeLabel = cancellationTarget?.reservation_time || "";
  const cancellationTableLabel = (() => {
    if (!cancellationTarget || !cancellationTarget.table) return "";
    const tableValue = cancellationTarget.table;
    if (typeof tableValue === "string") return tableValue;
    if (typeof tableValue === "object") {
      if (tableValue.table_number) {
        return `Table ${tableValue.table_number}`;
      }
      if (tableValue.name) {
        return tableValue.name;
      }
      if (tableValue.label) {
        return tableValue.label;
      }
    }
    return "";
  })();
  const cancellationPhoneNumber =
    (cancellationTarget && (cancellationTarget.phone_number || cancellationTarget.phone)) || "";
  const cancellationWarningText = cancellationTarget
    ? cancellationTableLabel
      ? `${cancellationTableLabel} will be unassigned immediately. This action can't be undone.`
      : "This action will mark the reservation as cancelled and free any table assignment."
    : "";
  const cancellationDisplayName = cancellationGuestName || "-";
  const cancellationDisplayPhone = cancellationPhoneNumber || "-";
  const cancellationDisplayDate = cancellationDateLabel || "-";
  const cancellationDisplayTime = cancellationTimeLabel || "-";

  useEffect(() => {
    if (!editTarget) {
      setEditFormValues(createEmptyEditForm());
      setEditSelectedTable("");
      setEditTableOptions([]);
      setEditTableError("");
      return;
    }
    setEditFormValues({
      guest_name: editTarget.guest_name || "",
      phone_number: editTarget.phone_number || "",
      reservation_date: formatDateForApi(editTarget.reservation_date) || "",
      reservation_time: editTarget.reservation_time || "",
      number_of_persons: editTarget.number_of_persons
        ? String(editTarget.number_of_persons)
        : "1",
      notes: editTarget.notes || "",
      table:
        (editTarget.table && (editTarget.table._id || editTarget.table)) ||
        "",
    });
    setEditSelectedTable(
      (editTarget.table && (editTarget.table._id || editTarget.table)) || ""
    );
  }, [editTarget]);

  useEffect(() => {
    if (!editTarget) {
      setEditTableOptions([]);
      setEditTableError("");
      setEditSelectedTable("");
      setIsEditTablesLoading(false);
      return;
    }
    const guests = Number(editFormValues.number_of_persons) || 0;
    const dateValue = formatDateForApi(editFormValues.reservation_date);
    const timeValue = editFormValues.reservation_time || "";
    if (!guests || !dateValue || !timeValue) {
      setEditTableOptions([]);
      setEditTableError("");
      setIsEditTablesLoading(false);
      return;
    }
    let isActive = true;
    const loadEditTables = async () => {
      setIsEditTablesLoading(true);
      setEditTableError("");
      try {
        const params = new URLSearchParams({
          guests: guests.toString(),
          date: dateValue,
          time: timeValue,
        });
        if (editTarget._id) {
          params.append("reservationId", editTarget._id);
        }
        const response = await fetchWithAuth(
          `${API_BASE_URL}/api/tables/available?${params.toString()}`
        );
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(payload.message || "Unable to load table availability");
        }
        if (!isActive) return;
        const normalizedTables = Array.isArray(payload) ? payload : [];
        setEditTableOptions(normalizedTables);
        setEditSelectedTable((prevSelection) => {
          const existingId =
            prevSelection ||
            (editTarget.table && (editTarget.table._id || editTarget.table)) ||
            "";
          if (
            existingId &&
            normalizedTables.some((table) => table._id === existingId)
          ) {
            return existingId;
          }
          return normalizedTables[0]?._id || "";
        });
      } catch (error) {
        if (isActive) {
          setEditTableError(error.message || "Unable to load tables for this slot");
          setEditTableOptions([]);
          setEditSelectedTable("");
        }
      } finally {
        if (isActive) {
          setIsEditTablesLoading(false);
        }
      }
    };
    loadEditTables();
    return () => {
      isActive = false;
    };
  }, [
    editTarget,
    editFormValues.number_of_persons,
    editFormValues.reservation_date,
    editFormValues.reservation_time,
  ]);

  const openEditPanel = (reservation) => {
    if (!reservation) return;
    setEditTarget(reservation);
    setEditReservationId(reservation._id || reservation.id || null);
    setEditError("");
    setEditDetailsError("");
  };

  const closeEditPanel = useCallback(() => {
    setEditTarget(null);
    setEditReservationId(null);
    setEditFormValues(createEmptyEditForm());
    setEditError("");
    setEditDetailsError("");
    setIsEditDetailsLoading(false);
    setEditTableOptions([]);
    setEditTableError("");
    setEditSelectedTable("");
    setIsEditTablesLoading(false);
  }, []);

  const handleEditFieldChange = (field, rawValue) => {
    setEditFormValues((previous) => {
      let value = rawValue;
      if (field === "phone_number") {
        value = rawValue.replace(/[^0-9+]/g, "");
      } else if (field === "number_of_persons") {
        value = rawValue.replace(/[^0-9]/g, "");
      }
      return {
        ...previous,
        [field]: value,
      };
    });
  };

  const handleEditTableChange = (value) => {
    setEditSelectedTable(value);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const handleSaveEditedReservation = async (event) => {
    event?.preventDefault?.();
    if (!editTarget) return;
    const reservationId = editTarget._id || editTarget.id;
    if (!reservationId) {
      setEditError("Unable to identify this reservation.");
      return;
    }
    const trimmedName = editFormValues.guest_name.trim();
    const trimmedPhone = editFormValues.phone_number.trim();
    if (!trimmedName) {
      setEditError("Guest name is required.");
      return;
    }
    if (!trimmedPhone) {
      setEditError("Phone number is required.");
      return;
    }
    if (!editFormValues.reservation_date) {
      setEditError("Please select a reservation date.");
      return;
    }
    if (!editFormValues.reservation_time) {
      setEditError("Please select a reservation time.");
      return;
    }
    const guestsValue = Number(editFormValues.number_of_persons);
    if (Number.isNaN(guestsValue) || guestsValue < 1) {
      setEditError("Guest count must be at least 1.");
      return;
    }
    setIsEditSaving(true);
    setEditError("");
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          guest_name: trimmedName,
          phone_number: trimmedPhone,
          reservation_date: editFormValues.reservation_date,
          reservation_time: editFormValues.reservation_time,
          number_of_persons: guestsValue,
          notes: editFormValues.notes.trim(),
          table: editSelectedTable || null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to update reservation");
      }
      upsertReservation(data);
      closeEditPanel();
    } catch (error) {
      setEditError(error.message || "Unable to update reservation at this time.");
    } finally {
      setIsEditSaving(false);
    }
  };

  const openCancellationPrompt = (reservation) => {
    if (!reservation) return;
    setCancellationTarget(reservation);
    setCancelReservationError("");
    setStatusMutationError("");
  };

  const closeCancellationPrompt = () => {
    if (isCancellingReservation) return;
    setCancellationTarget(null);
    setCancelReservationError("");
  };

  const confirmCancellation = async () => {
    if (!cancellationTarget) return;
    const reservationId = cancellationTarget._id || cancellationTarget.id;
    if (!reservationId) {
      setCancelReservationError("Unable to identify this reservation.");
      return;
    }
    setIsCancellingReservation(true);
    setCancelReservationError("");
    setStatusMutationError("");
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "cancelled",
          table: null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel reservation");
      }
      setCancellationTarget(null);
      setCancelReservationError("");
      upsertReservation(data);
    } catch (error) {
      setCancelReservationError(error.message || "Unable to cancel reservation at this time.");
    } finally {
      setIsCancellingReservation(false);
    }
  };

  const revertCancelledReservation = async (reservation) => {
    if (!reservation) return;
    const reservationId = reservation._id || reservation.id;
    if (!reservationId) return;
    setStatusMutationReservationId(reservationId);
    setStatusMutationError("");
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}/api/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "pending",
          table: null,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || "Failed to reinstate reservation");
      }
      upsertReservation(data);
    } catch (error) {
      setStatusMutationError(
        error.message || "Unable to update reservation status. Please try again."
      );
    } finally {
      setStatusMutationReservationId(null);
    }
  };

  const handleReservationAction = (actionType, reservation) => {
    if (!reservation) return;
    if (actionType === "edit") {
      openEditPanel(reservation);
      return;
    }
    if (actionType === "cancel") {
      openCancellationPrompt(reservation);
      return;
    }
    if (actionType === "revert") {
      revertCancelledReservation(reservation);
      return;
    }
    if (actionType === "more") {
      const reservationId = reservation._id || reservation.id;
      if (!reservationId) return;
      setExpandedReservationId((current) =>
        current === reservationId ? null : reservationId
      );
      return;
    }
    // Placeholder action handler until the remaining actions are wired up
    console.log(`Reservation action: ${actionType}`, reservation);
  };

  const fetchApprovalTables = useCallback(
    async (reservation) => {
      if (!reservation) return;
      const guests = Number(reservation.number_of_persons) || 0;
      const dateValue = formatDateForApi(reservation.reservation_date);
      const timeValue = reservation.reservation_time || "";
      if (!guests || !dateValue || !timeValue) {
        setApprovalTables([]);
        setSelectedTable("");
        setApprovalTablesError("");
        return;
      }

      setIsApprovalTablesLoading(true);
      setApprovalTablesError("");
      try {
        const params = new URLSearchParams({
          guests: guests.toString(),
          date: dateValue,
          time: timeValue,
        });
        if (reservation._id) {
          params.append("reservationId", reservation._id);
        }
        const response = await fetchWithAuth(`${API_BASE_URL}/api/tables/available?${params.toString()}`);
        const payload = await response.json().catch(() => []);
        if (!response.ok) {
          throw new Error(payload.message || "Unable to load table availability");
        }
        const normalizedTables = Array.isArray(payload) ? payload : [];
        setApprovalTables(normalizedTables);
        const existingTableId =
          (reservation.table && (reservation.table._id || reservation.table)) || "";
        const fallbackSelection =
          (existingTableId &&
            normalizedTables.some((table) => table._id === existingTableId) &&
            existingTableId) ||
          normalizedTables[0]?._id ||
          "";
        setSelectedTable(fallbackSelection);
      } catch (error) {
        setApprovalTablesError(error.message || "Unable to load tables for this slot");
        setApprovalTables([]);
        setSelectedTable("");
      } finally {
        setIsApprovalTablesLoading(false);
      }
    },
    []
  );

  const closeApprovalPanel = useCallback(() => {
    setApprovalTarget(null);
    setApprovalReservationId(null);
    setApprovalTables([]);
    setSelectedTable("");
    setApprovalTablesError("");
    setConfirmReservationError("");
    setApprovalDetailsError("");
    setIsConfirmingReservation(false);
  }, []);

  const handleAddReservation = () => {
    setIsAddReservationOpen(true);
  };

  const handleApproveClick = (reservation) => {
    const normalized = (reservation.status || "").toLowerCase();
    if (normalized !== "pending") {
      handleReservationAction("approve", reservation);
      return;
    }
    setApprovalTarget(reservation);
    setApprovalDetailsError("");
    setApprovalReservationId(reservation._id || reservation.id || null);
  };

  const handleConfirmReservation = async () => {
    if (!approvalTarget || !selectedTable) return;
    setIsConfirmingReservation(true);
    setConfirmReservationError("");
    try {
      const response = await fetchWithAuth(
        `${API_BASE_URL}/api/reservations/${approvalTarget._id}/confirm`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            table: selectedTable,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Failed to confirm reservation");
      }

      upsertReservation(data);
      closeApprovalPanel();
    } catch (error) {
      setConfirmReservationError(error.message || "Unable to confirm reservation at this time.");
    } finally {
      setIsConfirmingReservation(false);
    }
  };

  useEffect(() => {
    if (!approvalTarget) {
      setApprovalTables([]);
      setSelectedTable("");
      setApprovalTablesError("");
      setConfirmReservationError("");
      setIsConfirmingReservation(false);
      return;
    }
    setConfirmReservationError("");
    fetchApprovalTables(approvalTarget);
  }, [approvalTarget, fetchApprovalTables]);

  useEffect(() => {
    if (!approvalReservationId) return;
    let isActive = true;
    const loadReservationDetails = async () => {
      setIsApprovalDetailsLoading(true);
      setApprovalDetailsError("");
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/reservations/${approvalReservationId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Unable to load reservation details");
        }
        if (isActive) {
          setApprovalTarget(data);
        }
      } catch (error) {
        if (isActive) {
          setApprovalDetailsError(error.message || "Unable to load reservation details");
        }
      } finally {
        if (isActive) {
          setIsApprovalDetailsLoading(false);
        }
      }
    };
    loadReservationDetails();
    return () => {
      isActive = false;
    };
  }, [approvalReservationId]);

  useEffect(() => {
    if (!editReservationId) return;
    let isActive = true;
    const loadEditReservation = async () => {
      setIsEditDetailsLoading(true);
      setEditDetailsError("");
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/api/reservations/${editReservationId}`);
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.message || "Unable to load reservation details");
        }
        if (isActive) {
          setEditTarget(data);
        }
      } catch (error) {
        if (isActive) {
          setEditDetailsError(error.message || "Unable to load reservation details");
        }
      } finally {
        if (isActive) {
          setIsEditDetailsLoading(false);
        }
      }
    };
    loadEditReservation();
    return () => {
      isActive = false;
    };
  }, [editReservationId]);

  return (
    <div style={{ color: adminTheme.palette.contrast, fontFamily: adminTheme.fonts.body, minHeight: "100vh" }}>
      <style>{datePickerCSS}</style>
      <ReservationPopup
        isOpen={isAddReservationOpen}
        onClose={() => setIsAddReservationOpen(false)}
        hideImageSection
        hideBookingMessage
        guestNamePlaceholder="NAME"
        notesLabel="Notes"
        showTableSelection
        tableSelectionLabel="Table Assignment"
        successMessageText="Reservation saved. Expect a confirmation call shortly."
        defaultStatus="confirmed"
      />
      {editTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            zIndex: 9999,
            padding: "20px",
            paddingTop: "50px",
          }}
          onClick={() => {
            if (!isEditSaving) closeEditPanel();
          }}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#fff",
              width: "100%",
              maxWidth: "560px",
              borderRadius: adminTheme.radii.lg,
              padding: "40px 50px",
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeEditPanel}
              disabled={isEditSaving}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                border: "none",
                background: "transparent",
                fontSize: "1.8rem",
                cursor: isEditSaving ? "not-allowed" : "pointer",
                color: "#bbb",
              }}
              aria-label="Close edit popup"
            >
              &times;
            </button>
            <h3
              style={{
                fontSize: "1.8rem",
                marginTop: 0,
                marginBottom: "8px",
                textAlign: "center",
                fontWeight: 400,
                letterSpacing: "0.04em",
                color: "#1a1a1a",
              }}
            >
              Edit Reservation
            </h3>
            <p
              style={{
                textAlign: "center",
                color: "#7a7a7a",
                fontSize: "0.8rem",
                marginTop: 0,
                marginBottom: "24px",
              }}
            >
              Update reservation details below. Save changes to keep the schedule in sync.
            </p>
            {isEditDetailsLoading && (
              <div
                style={{
                  textAlign: "center",
                  color: "#8c8c8c",
                  fontSize: "0.8rem",
                  marginBottom: "16px",
                }}
              >
                Loading the latest reservation information...
              </div>
            )}
            {editDetailsError && (
              <div
                style={{
                  textAlign: "center",
                  color: "#c0392b",
                  fontSize: "0.8rem",
                  marginBottom: "16px",
                }}
              >
                {editDetailsError}
              </div>
            )}
            <form onSubmit={handleSaveEditedReservation} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "repeat(2, minmax(200px, 1fr))",
                  gap: "18px",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={editFieldLabelStyleMono}>Guest Name</span>
                  <input
                    type="text"
                    value={editFormValues.guest_name}
                    onChange={(e) => handleEditFieldChange("guest_name", e.target.value)}
                    disabled={isEditDetailsLoading || isEditSaving}
                    style={{
                      ...editInputBaseStyle,
                      color: isEditDetailsLoading || isEditSaving ? "#a0a0a0" : "#1d1d1d",
                      borderBottomColor: isEditDetailsLoading || isEditSaving ? "#dcdcdc" : "#e5e5e5",
                    }}
                    placeholder="Guest name"
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={editFieldLabelStyleMono}>Phone Number</span>
                  <input
                    type="tel"
                    value={editFormValues.phone_number}
                    onChange={(e) => handleEditFieldChange("phone_number", e.target.value)}
                    disabled={isEditDetailsLoading || isEditSaving}
                    style={{
                      ...editInputBaseStyle,
                      color: isEditDetailsLoading || isEditSaving ? "#a0a0a0" : "#1d1d1d",
                      borderBottomColor: isEditDetailsLoading || isEditSaving ? "#dcdcdc" : "#e5e5e5",
                    }}
                    placeholder="Phone number"
                  />
                </label>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "repeat(2, minmax(200px, 1fr))",
                  gap: "18px",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={editFieldLabelStyleMono}>Date</span>
                  <input
                    type="date"
                    value={editFormValues.reservation_date}
                    onChange={(e) => handleEditFieldChange("reservation_date", e.target.value)}
                    disabled={isEditDetailsLoading || isEditSaving}
                    style={{
                      ...editInputBaseStyle,
                      color: isEditDetailsLoading || isEditSaving ? "#a0a0a0" : "#1d1d1d",
                      borderBottomColor: isEditDetailsLoading || isEditSaving ? "#dcdcdc" : "#e5e5e5",
                    }}
                  />
                </label>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={editFieldLabelStyleMono}>Time</span>
                  <input
                    type="time"
                    value={editFormValues.reservation_time}
                    onChange={(e) => handleEditFieldChange("reservation_time", e.target.value)}
                    disabled={isEditDetailsLoading || isEditSaving}
                    style={{
                      ...editInputBaseStyle,
                      color: isEditDetailsLoading || isEditSaving ? "#a0a0a0" : "#1d1d1d",
                      borderBottomColor: isEditDetailsLoading || isEditSaving ? "#dcdcdc" : "#e5e5e5",
                    }}
                  />
                </label>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "minmax(0, 1.7fr) minmax(0, 1fr)",
                  gap: "18px",
                  alignItems: "stretch",
                }}
              >
                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={editFieldLabelStyleMono}>Notes</span>
                  <textarea
                    value={editFormValues.notes}
                    onChange={(e) => handleEditFieldChange("notes", e.target.value)}
                    disabled={isEditDetailsLoading || isEditSaving}
                    style={{
                      ...editTextAreaStyle,
                      background: isEditDetailsLoading || isEditSaving ? "#f1f1f1" : "#fafafa",
                      color: isEditDetailsLoading || isEditSaving ? "#9b9b9b" : "#5b5b5b",
                    }}
                    placeholder="Special requests or notes"
                  />
                </label>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={editFieldLabelStyleMono}>Guests</span>
                    <input
                      type="number"
                      min="1"
                      value={editFormValues.number_of_persons}
                      onChange={(e) => handleEditFieldChange("number_of_persons", e.target.value)}
                      disabled={isEditDetailsLoading || isEditSaving}
                      style={{
                        ...editInputBaseStyle,
                        border: "1px solid #e5e5e5",
                        padding: "10px 14px",
                        background: isEditDetailsLoading || isEditSaving ? "#d1d1d1" : "#2d2d2d",
                        color: isEditDetailsLoading || isEditSaving ? "#666" : "#fff",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                      }}
                    />
                  </label>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <span style={editFieldLabelStyleMono}>Table Assignment</span>
                    <select
                      value={editSelectedTable}
                      onChange={(e) => handleEditTableChange(e.target.value)}
                      disabled={
                        isEditDetailsLoading ||
                        isEditSaving ||
                        isEditTablesLoading ||
                        (!editTableOptions.length && !editSelectedTable)
                      }
                      style={{
                        border: "none",
                        padding: "12px 18px",
                        borderRadius: "0",
                        background: "#2d2d2d",
                        color: "#fff",
                        fontFamily: "'Montserrat', sans-serif",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        appearance: "none",
                        cursor:
                          isEditDetailsLoading ||
                          isEditSaving ||
                          isEditTablesLoading
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      <option value="">Unassigned</option>
                      {editTableOptions.map((table) => (
                        <option key={table._id} value={table._id}>
                          {`Table ${table.table_number} • ${table.number_of_chairs} seats${
                            table.position ? ` – ${table.position}` : ""
                          }`}
                        </option>
                      ))}
                    </select>
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: editTableError ? "#c7523f" : "#a6a6a6",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {editTableError ||
                        (isEditTablesLoading
                          ? "Checking availability..."
                          : editTableOptions.length
                          ? ""
                          : "Adjust guests, date, and time to load available tables.")}
                    </div>
                    <button
                      type="submit"
                      disabled={isEditSaving || isEditDetailsLoading}
                      style={{
                        border: "none",
                        borderRadius: "0",
                        padding: "16px 30px",
                        background: "#ff6b35",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        cursor: isEditSaving || isEditDetailsLoading ? "not-allowed" : "pointer",
                        opacity: isEditSaving || isEditDetailsLoading ? 0.6 : 1,
                        fontFamily: "'Montserrat', sans-serif",
                        width: windowWidth <= 640 ? "100%" : "auto",
                        alignSelf: windowWidth <= 640 ? "stretch" : "flex-end",
                        marginTop: "8px",
                      }}
                      onMouseOver={(e) =>
                        !(isEditSaving || isEditDetailsLoading) && (e.target.style.background = "#e55a2b")
                      }
                      onMouseOut={(e) =>
                        !(isEditSaving || isEditDetailsLoading) && (e.target.style.background = "#ff6b35")
                      }
                    >
                      {isEditSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
              {editError && (
                <div
                  style={{
                    marginTop: "4px",
                    padding: "10px 12px",
                    borderRadius: adminTheme.radii.sm,
                    background: "#fff1ee",
                    color: "#c7523f",
                    fontSize: "0.8rem",
                    textAlign: "center",
                  }}
                >
                  {editError}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {cancellationTarget && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 9998,
          }}
          onClick={closeCancellationPrompt}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: adminTheme.radii.lg,
              width: "100%",
              maxWidth: "440px",
              padding: "32px",
              position: "relative",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.28)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeCancellationPrompt}
              disabled={isCancellingReservation}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                border: "none",
                background: "transparent",
                fontSize: "1.4rem",
                cursor: isCancellingReservation ? "not-allowed" : "pointer",
                color: "#a0a0a0",
              }}
              aria-label="Close cancellation popup"
            >
              &times;
            </button>
            <h3
              style={{
                marginTop: 0,
                marginBottom: "12px",
                fontSize: "1.5rem",
                fontWeight: 600,
                fontFamily: adminTheme.fonts.body,
                color: "#1a1a1a",
                textAlign: "center",
              }}
            >
              Cancel Reservation
            </h3>
            
            <div
              style={{
                display: "grid",
                gridTemplateColumns: windowWidth <= 520 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                gap: "18px 24px",
                marginBottom: "18px",
                padding: "18px 22px",
                borderRadius: adminTheme.radii.md,
                background: "#f8f8f8",
              }}
            >
              {[
                { label: "Guest Name", value: cancellationDisplayName },
                { label: "Phone Number", value: cancellationDisplayPhone },
                { label: "Date", value: cancellationDisplayDate },
                { label: "Time", value: cancellationDisplayTime },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    borderBottom: "1px solid #ececec",
                    paddingBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.7rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "#9a9a9a",
                      marginBottom: "4px",
                      fontWeight: 600,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#111",
                      wordBreak: "break-word",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
            <p
              style={{
                marginTop: 0,
                color: "#5c5c5c",
                fontSize: "0.85rem",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              {cancellationWarningText}
            </p>
            {cancelReservationError && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "10px 12px",
                  borderRadius: adminTheme.radii.sm,
                  background: "#ffeceb",
                  color: "#c43d3d",
                  fontSize: "0.8rem",
                }}
              >
                {cancelReservationError}
              </div>
            )}
            <div
              style={{
                marginTop: "24px",
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={closeCancellationPrompt}
                disabled={isCancellingReservation}
                style={{
                  borderRadius: adminTheme.radii.pill,
                  border: `1px solid ${adminTheme.palette.border}`,
                  padding: "12px 20px",
                  background: "#f7f7f7",
                  color: "#333",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: isCancellingReservation ? "not-allowed" : "pointer",
                  opacity: isCancellingReservation ? 0.6 : 1,
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmCancellation}
                disabled={isCancellingReservation}
                style={{
                  borderRadius: adminTheme.radii.pill,
                  border: "none",
                  padding: "12px 20px",
                  background: "#c0392b",
                  color: "#fff",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: isCancellingReservation ? "not-allowed" : "pointer",
                  opacity: isCancellingReservation ? 0.7 : 1,
                }}
              >
                {isCancellingReservation ? "Cancelling..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div style={contentWrapperStyle}>
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={sectionHeadingStyle}>Reservations Management</h1>
            <div style={underlineStyle} />
          </div>
          <button
            type="button"
            onClick={handleAddReservation}
            style={{
              border: "none",
              borderRadius: adminTheme.radii.lg,
              backgroundColor: "#5ea34d",
              padding: "14px 18px",
              minWidth: "200px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              cursor: "pointer",
              color: "#fff",
              fontFamily: adminTheme.fonts.body,
              fontWeight: 600,
              letterSpacing: "0.05em",
              marginTop: "-20px",
            }}
          >
            <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>+</span>
            Add Reservation
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: windowWidth <= 640 ? "1fr" : "repeat(3, minmax(0, 1fr))",
            gap: "16px",
          }}
        >
          {["Confirmed", "Pending", "Cancelled"].map((status) => {
            const summaryMeta = statusSummaryIcons[status] || {};
            const summaryIcon = summaryMeta.icon;
            return (
              <div
                key={status}
                style={{
                  borderRadius: adminTheme.radii.lg,
                  border: `1px solid ${adminTheme.palette.border}`,
                  padding: "12px 16px",
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  columnGap: "16px",
                  backgroundColor: "#fff",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem", letterSpacing: "0.2em", textTransform: "uppercase", color: adminTheme.palette.textMuted }}>
                    {status}
                  </div>
                  <div style={{ fontFamily: adminTheme.fonts.display, fontSize: "1.6rem" }}>
                    {statusCounts[status] || 0}
                  </div>
                </div>
                <span
                  style={{
                    ...createChipStyle(status.toLowerCase()),
                    padding: "8px 12px",
                    minWidth: "46px",
                    minHeight: "46px",
                    justifyContent: "center",
                  }}
                >
                  {summaryIcon ? (
                    <img
                      src={summaryIcon}
                      alt={`${status} icon`}
                      style={{ width: 26, height: 26, objectFit: "contain" }}
                    />
                  ) : (
                    status
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {fetchError && (
        <div
          style={{
            ...createCardStyle({
              padding: "16px 20px",
              borderRadius: adminTheme.radii.md,
              background: "#fff1ee",
              color: adminTheme.palette.danger,
              fontSize: "0.9rem",
            }),
            marginBottom: "24px",
          }}
        >
          {fetchError}
        </div>
      )}
      {!fetchError && serverPagination?.total > serverPagination?.limit && (
        <div
          style={{
            ...createCardStyle({
              padding: "12px 16px",
              borderRadius: adminTheme.radii.md,
              background: "#f5f1ff",
              color: adminTheme.palette.textMuted,
              fontSize: "0.85rem",
            }),
            marginBottom: "16px",
          }}
        >
          Showing the first {reservations.length} reservations of {serverPagination.total}.
          Refine filters or export data to work with the full set.
        </div>
      )}

      {statusMutationError && (
        <div
          style={{
            ...createCardStyle({
              padding: "12px 16px",
              borderRadius: adminTheme.radii.md,
              background: "#fff9e9",
              color: "#9c6100",
              fontSize: "0.85rem",
            }),
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "14px" }}>
            <span>{statusMutationError}</span>
            <button
              type="button"
              onClick={() => setStatusMutationError("")}
              style={{
                border: "none",
                background: "transparent",
                color: "#9c6100",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.8rem",
              }}
              aria-label="Dismiss status error"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Table controls */}
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            flexWrap: "nowrap",
            width: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              borderRadius: adminTheme.radii.pill,
              border: `1px solid ${adminTheme.palette.border}`,
              background: "#fff",
              flex: 1,
              cursor: "text",
            }}
            onClick={() => searchInputRef.current?.focus()}
          >
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: adminTheme.palette.textMuted,
                pointerEvents: "none",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reservations..."
              ref={searchInputRef}
              style={{
                width: "100%",
                padding: "13px 18px 13px 46px",
                borderRadius: adminTheme.radii.pill,
                border: "none",
                fontFamily: adminTheme.fonts.body,
                fontSize: "0.95rem",
                color: adminTheme.palette.contrast,
                background: "transparent",
                outline: "none",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "46px",
                height: "46px",
                borderRadius: adminTheme.radii.md,
                border: `1px solid ${adminTheme.palette.border}`,
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  openDatePicker(dateFromInputRef);
                }}
                onClick={() => openDatePicker(dateFromInputRef)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Select start date"
              >
                <img src="/Icons/calendar.png" alt="" style={{ width: 18, height: 18 }} />
              </button>
              <input
                className="date-picker-input"
                ref={dateFromInputRef}
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: "1px",
                  height: "1px",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
            <span style={{ fontSize: "0.85rem", color: adminTheme.palette.textMuted }}>To</span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "46px",
                height: "46px",
                borderRadius: adminTheme.radii.md,
                border: `1px solid ${adminTheme.palette.border}`,
                background: "#fff",
                boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                position: "relative",
              }}
            >
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  openDatePicker(dateToInputRef);
                }}
                onClick={() => openDatePicker(dateToInputRef)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
                aria-label="Select end date"
              >
                <img src="/Icons/calendar.png" alt="" style={{ width: 18, height: 18 }} />
              </button>
              <input
                className="date-picker-input"
                ref={dateToInputRef}
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                style={{
                  position: "absolute",
                  opacity: 0,
                  pointerEvents: "none",
                  width: "1px",
                  height: "1px",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {approvalTarget && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            zIndex: 9999,
            padding: "20px",
            paddingTop: "50px",
          }}
          onClick={closeApprovalPanel}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#fff",
              width: "100%",
              maxWidth: "560px",
              borderRadius: adminTheme.radii.lg,
              padding: "40px 50px",
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: "0 20px 45px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeApprovalPanel}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                border: "none",
                background: "transparent",
                fontSize: "1.8rem",
                cursor: "pointer",
                color: "#bbb",
              }}
              onMouseOver={(e) => (e.target.style.color = "#444")}
              onMouseOut={(e) => (e.target.style.color = "#bbb")}
              aria-label="Close approval popup"
            >
              &times;
            </button>
            <h3
              style={{
                fontSize: "1.8rem",
                marginTop: 0,
                marginBottom: "8px",
                textAlign: "center",
                fontWeight: 400,
                letterSpacing: "0.04em",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Confirm Reservation
            </h3>
            <p
              style={{
                marginTop: 0,
                marginBottom: "24px",
                textAlign: "center",
                color: "#7a7a7a",
                fontSize: "0.8rem",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
            Call the guest to confirm their booking and assign an available table.
          </p>
          {isApprovalDetailsLoading && (
            <div
              style={{
                textAlign: "center",
                color: "#8c8c8c",
                fontSize: "0.75rem",
                marginBottom: "14px",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Loading latest reservation details...
            </div>
          )}
          {approvalDetailsError && (
            <div
              style={{
                textAlign: "center",
                color: "#c7523f",
                fontSize: "0.75rem",
                marginBottom: "14px",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              {approvalDetailsError}
            </div>
          )}
          <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                {[
                  { label: "Guest Name", value: approvalTarget.guest_name || "Unknown" },
                  { label: "Phone Number", value: approvalTarget.phone_number || "-" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "#a6a6a6",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1d1d1d",
                        padding: "6px 0",
                        borderBottom: "1px solid #eee",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                }}
              >
                {[
                  {
                    label: "Date",
                    value: approvalTarget.reservation_date
                      ? formatDateForTable(approvalTarget.reservation_date) || "-"
                      : "-",
                  },
                  { label: "Time", value: approvalTarget.reservation_time || "-" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "#a6a6a6",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#1d1d1d",
                        padding: "6px 0",
                        borderBottom: "1px solid #eee",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "minmax(0, 1.7fr) minmax(0, 1fr)",
                  gap: "18px",
                  alignItems: "stretch",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      color: "#a6a6a6",
                      marginBottom: "6px",
                      fontFamily: "'Montserrat', sans-serif",
                    }}
                  >
                    Notes
                  </div>
                  <div
                    style={{
                      flex: 1,
                      borderRadius: "0",
                      border: `1px solid ${adminTheme.palette.border}`,
                      padding: "14px 16px",
                      fontSize: "0.85rem",
                      color: adminTheme.palette.textMuted,
                      background: "#fafafa",
                      fontFamily: "'Montserrat', sans-serif",
                      minHeight: "96px",
                    }}
                  >
                    {approvalTarget.notes || "No additional notes provided."}
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <div
                      style={{
                        fontSize: "0.65rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: "#a6a6a6",
                        marginBottom: "6px",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      Table Assignment
                    </div>
                    <select
                      value={selectedTable}
                      onChange={(e) => setSelectedTable(e.target.value)}
                      disabled={!approvalTables.length || isApprovalTablesLoading}
                      style={{
                        width: "100%",
                        padding: "12px 18px",
                        borderRadius: "0",
                        border: `1px solid ${adminTheme.palette.border}`,
                        fontSize: "0.95rem",
                        fontFamily: "'Montserrat', sans-serif",
                        background: "#2d2d2d",
                        color: "#fff",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        appearance: "none",
                      }}
                    >
                      {approvalTables.length > 0 ? (
                        approvalTables.map((table) => (
                          <option key={table._id} value={table._id}>
                            {`Table ${table.table_number} • ${table.number_of_chairs} seats${
                              table.position ? ` – ${table.position}` : ""
                            }`}
                          </option>
                        ))
                      ) : (
                        <option value="">
                          {isApprovalTablesLoading
                            ? "Loading available tables..."
                            : approvalTablesError
                            ? "Unable to load tables"
                            : "Select slot to view tables"}
                        </option>
                      )}
                    </select>
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.65rem",
                        color: approvalTablesError ? "#c7523f" : "#a6a6a6",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {approvalTablesError ||
                        (isApprovalTablesLoading
                          ? "Checking availability..."
                          : !approvalTables.length &&
                            approvalTarget && (
                              <span>
                                No free tables match the current party size. Adjust the time or update the reservation.
                              </span>
                            ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmReservation}
                    disabled={
                      !selectedTable ||
                      isApprovalTablesLoading ||
                      isConfirmingReservation ||
                      isApprovalDetailsLoading ||
                      Boolean(approvalDetailsError)
                    }
                    style={{
                      border: "none",
                      borderRadius: "0",
                      padding: "16px 30px",
                      background: "#ff6b35",
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      cursor:
                        !selectedTable ||
                        isApprovalTablesLoading ||
                        isConfirmingReservation ||
                        isApprovalDetailsLoading ||
                        approvalDetailsError
                          ? "not-allowed"
                          : "pointer",
                      fontFamily: "'Montserrat', sans-serif",
                      width: "auto",
                      opacity:
                        !selectedTable ||
                        isApprovalTablesLoading ||
                        isConfirmingReservation ||
                        isApprovalDetailsLoading ||
                        approvalDetailsError
                          ? 0.6
                          : 1,
                    }}
                    onMouseOver={(e) =>
                      !e.currentTarget.disabled && (e.target.style.background = "#e55a2b")
                    }
                    onMouseOut={(e) =>
                      !e.currentTarget.disabled && (e.target.style.background = "#ff6b35")
                    }
                  >
                    {isConfirmingReservation ? "Confirming..." : "Confirm Call & Table"}
                  </button>
                  {confirmReservationError && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "0.7rem",
                        color: "#c7523f",
                        fontFamily: "'Montserrat', sans-serif",
                      }}
                    >
                      {confirmReservationError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile quick status filters */}
      {isMobileTable && (
        <div
          style={{
            marginBottom: "20px",
            padding: "0 4px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {["all", "confirmed", "pending", "cancelled"].map((value) => {
              const label =
                value === "all"
                  ? "All Status"
                  : value.charAt(0).toUpperCase() + value.slice(1);
              const count =
                value === "all"
                  ? reservations.length
                  : statusCounts[label] || 0;
              const isActive = statusFilter === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  style={{
                    width: "100%",
                    borderRadius: "999px",
                    border: `1px solid ${isActive ? "#999" : "#d9d9d9"}`,
                    background: isActive ? "#f1f1f1" : "#fff",
                    color: "#4a4a4a",
                    padding: "10px 18px",
                    fontFamily: adminTheme.fonts.body,
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    boxShadow: isActive ? "0 6px 16px rgba(0,0,0,0.08)" : "none",
                    justifyContent: "space-between",
                  }}
                >
                  <span>{label}</span>
                  <span
                    style={{
                      borderRadius: "999px",
                      padding: "2px 10px",
                      background: isActive ? "#dcdcdc" : "#f5f5f5",
                      fontSize: "0.7rem",
                      letterSpacing: "normal",
                    }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reservations table */}
      <div
        style={{
          ...createCardStyle({
            padding: "0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            borderRadius: "0px",
          }),
        }}
      >
        {!isMobileTable && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: tableColumnTemplate,
              padding: "14px 26px",
              fontSize: "0.7rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "#000",
              borderBottom: `1px solid ${adminTheme.palette.border}`,
              rowGap: "10px",
              fontFamily: adminTheme.fonts.body,
            }}
          >
            <div>#</div>
            <div>Phone Num</div>
            <div>Date</div>
            <div>Time</div>
            <div style={{ justifySelf: "start", marginLeft: "-16px" }}>Guests</div>
            <div style={{ justifySelf: "start", marginLeft: "-6px" }}>Table</div>
            <div
              ref={statusDropdownRef}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <span>Status</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsStatusFilterOpen((prev) => !prev);
                }}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
                aria-label="Filter by status"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    transition: "transform 0.2s ease",
                    transform: isStatusFilterOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                {statusFilter !== "all" && (
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: "#5ea34d",
                      position: "absolute",
                      top: "-3px",
                      right: "-3px",
                    }}
                  />
                )}
              </button>
              {isStatusFilterOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#fff",
                    borderRadius: adminTheme.radii.md,
                    border: `1px solid ${adminTheme.palette.border}`,
                    boxShadow: "0 12px 28px rgba(0, 0, 0, 0.12)",
                    minWidth: "170px",
                    zIndex: 10,
                    overflow: "hidden",
                  }}
                >
                  {statusFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setStatusFilter(option.value);
                        setIsStatusFilterOpen(false);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 16px",
                        background: option.value === statusFilter ? "rgba(0,0,0,0.05)" : "#fff",
                        border: "none",
                        fontFamily: adminTheme.fonts.body,
                        fontSize: "0.85rem",
                        color: adminTheme.palette.contrast,
                        cursor: "pointer",
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ marginLeft: "20px" }}>Actions</div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" }}>
          {isLoading ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: adminTheme.palette.textMuted,
                fontFamily: adminTheme.fonts.body,
              }}
            >
              Loading reservations...
            </div>
          ) : filteredReservations.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: adminTheme.palette.textMuted,
                fontFamily: adminTheme.fonts.body,
              }}
            >
              No reservations found for the selected filters.
            </div>
          ) : (
            paginatedReservations.map((reservation, index) => {
              const rowKey = reservation._id || reservation.id || index;
              const reservationIdValue = reservation._id || reservation.id || "";
              const rowNumber = pageStartIndex + index + 1;
              const displayPosition = String(rowNumber).padStart(2, "0");
              const phoneDisplay = reservation.phone_number || "-";
              const guestTotal = reservation.number_of_persons || 0;
              const normalizedStatus = (reservation.status || "").toLowerCase();
              const statusLabel = reservation.status
                ? reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)
                : "Pending";
              const dateDisplay = reservation.reservation_date
                ? new Date(reservation.reservation_date).toLocaleDateString()
                : "—";
              const timeDisplay = reservation.reservation_time || "—";
              const isCancelled = normalizedStatus === "cancelled";
              const cancelIconSrc =
                normalizedStatus === "cancelled"
                  ? actionIcons.cancelAlt
                  : actionIcons.cancelDefault;
              const approveIconSrc =
                normalizedStatus === "confirmed" ? actionIcons.approve : actionIcons.approveAlt;
              const tableMeta =
                reservation.table && typeof reservation.table === "object"
                  ? reservation.table
                  : null;
              const tableLabelSegments = [];
              if (tableMeta?.table_number) {
                tableLabelSegments.push(`Table ${tableMeta.table_number}`);
              } else if (reservation.table && typeof reservation.table === "string") {
                tableLabelSegments.push(reservation.table);
              }
              if (tableMeta?.number_of_chairs) {
                tableLabelSegments.push(`${tableMeta.number_of_chairs} seats`);
              }
              const tableLabel = tableLabelSegments.join(" • ") || "Unassigned";
              const tablePosition = tableMeta?.position || "";
              const isStatusMutating =
                Boolean(reservationIdValue) && statusMutationReservationId === reservationIdValue;
              const cancelButtonStyle = {
                ...actionButtonStyle,
                opacity: isStatusMutating ? 0.45 : 1,
                cursor: isStatusMutating ? "not-allowed" : "pointer",
              };
              const statusStyle =
                statusStyles[statusLabel.toLowerCase()] || statusStyles.default;
              const statusChip = (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px 6px 8px",
                    borderRadius: "999px",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    background: statusStyle.background,
                    color: statusStyle.color,
                    ...(isMobileTable ? {} : { justifySelf: "start", marginLeft: "-16px" }),
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: statusStyle.dot,
                    }}
                  />
                  {statusLabel}
                </div>
              );
              const actionButtons = (
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    justifyContent: isMobileTable ? "flex-start" : undefined,
                  }}
                >
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => handleReservationAction("edit", reservation)}
                    aria-label="Edit reservation"
                  >
                    <img src={actionIcons.edit} alt="" style={{ width: 18, height: 18 }} />
                  </button>
                  <button
                    type="button"
                    style={cancelButtonStyle}
                    disabled={isStatusMutating}
                    onClick={() =>
                      handleReservationAction(isCancelled ? "revert" : "cancel", reservation)
                    }
                    aria-label={isCancelled ? "Reinstate reservation" : "Cancel reservation"}
                  >
                    <img src={cancelIconSrc} alt="" style={{ width: 18, height: 18 }} />
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => handleApproveClick(reservation)}
                    aria-label="Approve reservation"
                  >
                    <img src={approveIconSrc} alt="" style={{ width: 18, height: 18 }} />
                  </button>
                  <button
                    type="button"
                    style={actionButtonStyle}
                    onClick={() => handleReservationAction("more", reservation)}
                    aria-label="More actions"
                  >
                    <img src={actionIcons.more} alt="" style={{ width: 18, height: 18 }} />
                  </button>
                </div>
              );

              const isExpanded =
                reservationIdValue && expandedReservationId === reservationIdValue;
              const mobileInfoItems = [
                { label: "Guest", value: reservation.guest_name || "-" },
                { label: "Guests", value: guestTotal },
                { label: "Phone", value: phoneDisplay },
                { label: "Table", value: tableLabel },
              ];
              if (tablePosition) {
                mobileInfoItems.push({ label: "Area", value: tablePosition });
              }

              return (
                <React.Fragment key={rowKey}>
                  {isMobileTable ? (
                    <div
                      style={{
                        padding: "18px 18px",
                        borderBottom: isExpanded
                          ? "none"
                          : `1px solid ${adminTheme.palette.border}`,
                        fontFamily: adminTheme.fonts.body,
                        color: "#333",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "12px",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                            #{displayPosition}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#6d6d6d", marginTop: "4px" }}>
                            {dateDisplay} • <span style={{ fontWeight: 600 }}>{timeDisplay}</span>
                          </div>
                        </div>
                        <div>{statusChip}</div>
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                          gap: "12px",
                          marginTop: "12px",
                        }}
                      >
                        {mobileInfoItems.map((item) => (
                          <div
                            key={`${rowKey}-${item.label}`}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "4px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.68rem",
                                letterSpacing: "0.18em",
                                textTransform: "uppercase",
                                color: "#9a9a9a",
                              }}
                            >
                              {item.label}
                            </span>
                            <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>
                              {item.value || "-"}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: "14px" }}>{actionButtons}</div>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: tableColumnTemplate,
                        padding: "18px 22px",
                        borderBottom: isExpanded
                          ? "none"
                          : `1px solid ${adminTheme.palette.border}`,
                        gap: "10px",
                        alignItems: "center",
                        fontFamily: adminTheme.fonts.body,
                        fontSize: "0.9rem",
                        color: "#333",
                      }}
                    >
                      <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>{displayPosition}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{phoneDisplay}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{dateDisplay}</div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{timeDisplay}</div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          justifySelf: "start",
                          marginLeft: "-20px",
                        }}
                      >
                        {guestTotal}
                      </div>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          justifySelf: "start",
                          marginLeft: "-16px",
                          color: tableMeta ? "#1d1d1d" : "#9a9a9a",
                        }}
                      >
                        {tableLabel}
                        {tablePosition && (
                          <div
                            style={{
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              color: "#7a7a7a",
                            }}
                          >
                            {tablePosition}
                          </div>
                        )}
                      </div>
                      {statusChip}
                      {actionButtons}
                    </div>
                  )}
                  {isExpanded && (
                    <div
                      style={{
                        padding: windowWidth <= 640 ? "16px 18px 24px" : "16px 32px 24px",
                        background: "#fafafa",
                        borderBottom: `1px solid ${adminTheme.palette.border}`,
                        display: "grid",
                        gridTemplateColumns:
                          windowWidth <= 640 ? "1fr" : "repeat(2, minmax(0, 1fr))",
                        gap: "18px",
                        fontFamily: adminTheme.fonts.body,
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "#9a9a9a",
                          }}
                        >
                          Guest Name
                        </span>
                        <span style={{ fontSize: "1rem", fontWeight: 600 }}>
                          {reservation.guest_name || "-"}
                        </span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                            color: "#9a9a9a",
                          }}
                        >
                          Notes
                        </span>
                        <span style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.5 }}>
                          {reservation.notes && reservation.notes.trim()
                            ? reservation.notes
                            : "No additional notes provided."}
                        </span>
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 26px",
            borderTop: `1px solid ${adminTheme.palette.border}`,
            fontFamily: adminTheme.fonts.body,
            fontSize: "0.85rem",
            color: adminTheme.palette.textMuted,
          }}
        >
          <div>
            Showing {displayedRangeStart}–
            {displayedRangeEnd} of {filteredReservations.length} reservations
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={safeCurrentPage === 1}
              style={{
                border: "none",
                background: "transparent",
                color: safeCurrentPage === 1 ? "#c0c0c0" : "#333",
                cursor: safeCurrentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "1rem",
                padding: "4px 6px",
              }}
              aria-label="Previous page"
            >
              ‹
            </button>
            <span style={{ minWidth: "24px", textAlign: "center" }}>{safeCurrentPage}</span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={safeCurrentPage === totalPages || filteredReservations.length === 0}
              style={{
                border: "none",
                background: "transparent",
                color:
                  safeCurrentPage === totalPages || filteredReservations.length === 0
                    ? "#c0c0c0"
                    : "#333",
                cursor:
                  safeCurrentPage === totalPages || filteredReservations.length === 0
                    ? "not-allowed"
                    : "pointer",
                fontSize: "1rem",
                padding: "4px 6px",
              }}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
