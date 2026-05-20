import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {

  adminTheme,

  buttonStyle,

  createCardStyle,

  createChipStyle,

  fieldLabelStyle,

  sectionHeadingStyle,

  textInputStyle,

  textareaStyle,

  underlineStyle,

} from "./adminTheme";
import { API_BASE_URL } from "../../config/api";

const ITEMS_PER_PAGE = 10;
const MENU_CACHE_KEY = "adminMenuCache";

const managementTabs = [{ id: "menu", label: "Menu management" }];

const getTabButtonStyle = (isActive) => ({
  ...createChipStyle(isActive ? "accent" : "neutral", {
    width: "fit-content",
    marginBottom: "0",
    cursor: "pointer",
  }),
  border: isActive ? "2px solid #1d1d1d" : `1px solid ${adminTheme.palette.border}`,
});

const readMenuCache = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(MENU_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.items)) return null;
    return parsed;
  } catch {
    return null;
  }
};

const writeMenuCache = (items) => {
  if (typeof window === "undefined") return null;
  try {
    const payload = { items, timestamp: Date.now() };
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(payload));
    return payload;
  } catch {
    return null;
  }
};

const clearMenuCache = () => {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(MENU_CACHE_KEY);
  } catch {
    // ignore
  }
};

const initialFormState = {

  name: "",

  category: "Breakfast",

  subcategory: "",

  price: "",

  description: "",

  image: "",

  available: true,

};

const formatCurrency = (value) => {

  if (value === null || value === undefined || value === "") return "-";

  const numeric = Number(value);

  if (Number.isNaN(numeric)) return "-";

  return new Intl.NumberFormat(undefined, {

    style: "currency",

    currency: "USD",

    maximumFractionDigits: 2,

  }).format(numeric);

};

const formatTimestamp = (value) => {

  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

      return date.toLocaleString(undefined, {

    month: "short",

    day: "numeric",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",

  });

};

const rowActionButtonStyle = {

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

const selectStyle = {

  ...textInputStyle,

  appearance: "none",

  WebkitAppearance: "none",

  MozAppearance: "none",

  backgroundImage:

    "url(\"data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23756a5f' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E\")",

  backgroundRepeat: "no-repeat",

  backgroundPosition: "calc(100% - 14px) center",

  paddingRight: "38px",

  cursor: "pointer",

};

const menuTableColumnTemplateDesktop = "0.6fr 1.8fr 1.2fr 0.8fr 1.1fr 1.5fr";

const menuTableColumnTemplateMobile = "0.5fr 1.4fr 1.1fr 0.8fr 1fr 1.3fr";

const availabilityFilterOptions = [

  { value: "all", label: "All statuses" },

  { value: "available", label: "Available" },

  { value: "unavailable", label: "Offline" },

];

const dishPrimaryTextStyle = {

  fontFamily: adminTheme.fonts.body,

  fontSize: "0.95rem",

  fontWeight: 600,

  letterSpacing: "0.01em",

};

const sortMenuItems = (items = []) =>
  [...items].sort((a, b) => {
    const aTime = new Date(a?.createdAt || 0).getTime();
    const bTime = new Date(b?.createdAt || 0).getTime();
    return bTime - aTime;
  });

const categoryValueStyle = {

  fontFamily: adminTheme.fonts.body,

  fontSize: "0.85rem",

  fontWeight: 600,

  letterSpacing: "0.05em",

  textTransform: "none",

  color: adminTheme.palette.contrast,

};

const formatDishName = (name) => (name ? name.toUpperCase() : "-");

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
const dishEditLabelStyle = {

  fontSize: "0.65rem",

  textTransform: "uppercase",

  letterSpacing: "0.2em",

  color: "#a6a6a6",

  fontFamily: "'Montserrat', sans-serif",

  fontWeight: 600,

};

const dishEditInputStyle = {

  width: "100%",

  border: "none",

  borderBottom: "1px solid #e5e5e5",

  padding: "6px 0",

  fontSize: "0.9rem",

  fontWeight: 600,

  fontFamily: "'Montserrat', sans-serif",

  background: "transparent",

  outline: "none",

  color: "#1d1d1d",

};

const dishEditTextareaStyle = {

  border: "1px solid #eee",

  borderRadius: "0",

  padding: "14px 16px",

  fontSize: "0.9rem",

  fontFamily: "'Montserrat', sans-serif",

  color: "#5b5b5b",

  minHeight: "120px",

  background: "#fafafa",

};

export default function MenuManagement() {

  const cacheRef = useRef(readMenuCache());

  const [menuItems, setMenuItemsState] = useState(() => cacheRef.current?.items || []);

  const [expandedItemId, setExpandedItemId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [categoryFilter, setCategoryFilter] = useState("all");

  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(!cacheRef.current);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [windowWidth, setWindowWidth] = useState(

    typeof window !== "undefined" ? window.innerWidth : 1280

  );

  const menuTableColumnTemplate =

    windowWidth <= 1024 ? menuTableColumnTemplateMobile : menuTableColumnTemplateDesktop;
  const isMobileMenuTable = windowWidth <= 640;
  const isCompactAdminView = windowWidth <= 768;

  const renderMenuActionButtons = (compact = false) => (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: compact ? "nowrap" : "wrap",
        width: compact ? "100%" : "auto",
        justifyContent: compact ? "flex-start" : "flex-start",
      }}
    >
      <button
        type="button"
        onClick={handleRefresh}
        disabled={isLoading || isRefreshing}
        aria-label="Refresh menu"
        style={
          compact
            ? {
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: "1px solid rgba(0,0,0,0.1)",
                background: adminTheme.gradients.ink,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                opacity: isLoading || isRefreshing ? 0.7 : 1,
                cursor: isLoading || isRefreshing ? "not-allowed" : "pointer",
              }
            : buttonStyle("secondary", {
                padding: "10px 18px",
                background: adminTheme.gradients.ink,
                boxShadow: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
              })
        }
      >
        <img
          src="/Icons/refresh.png"
          alt=""
          style={{ width: 18, height: 18, opacity: 0.9 }}
        />
        {!compact && (isRefreshing ? "Refreshing..." : "Refresh")}
      </button>
      <button
        type="button"
        onClick={openCreateForm}
        aria-label="Add dish"
        style={
          compact
            ? {
                width: 46,
                height: 46,
                borderRadius: "50%",
                border: "none",
                background: "#5ea34d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1.2rem",
                padding: 0,
              }
            : buttonStyle("primary", {
                padding: "12px 20px",
                background: "#5ea34d",
                boxShadow: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              })
        }
      >
        {compact ? "+" : (
          <>
            <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>+</span> Add Dish
          </>
        )}
      </button>
    </div>
  );

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [formMode, setFormMode] = useState("create");

  const [formState, setFormState] = useState(initialFormState);

  const [editingItemId, setEditingItemId] = useState(null);

  const [isSaving, setIsSaving] = useState(false);

  const [pendingDeletion, setPendingDeletion] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false);

  const [updatingAvailabilityId, setUpdatingAvailabilityId] = useState("");

  const [activeTab, setActiveTab] = useState("menu");

  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isFormCategoryDropdownOpen, setIsFormCategoryDropdownOpen] = useState(false);
  const searchInputRef = useRef(null);
  const categoryTriggerRef = useRef(null);
  const statusTriggerRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const statusMenuRef = useRef(null);
  const formCategoryTriggerRef = useRef(null);
  const formCategoryMenuRef = useRef(null);
  const fetchControllerRef = useRef(null);
  const requestIdRef = useRef(0);

  const persistMenuCache = (items) => {
    if (!Array.isArray(items)) return;
    if (!items.length) {
      clearMenuCache();
      cacheRef.current = null;
      return;
    }
    const payload = writeMenuCache(items);
    cacheRef.current = payload || { items, timestamp: Date.now() };
  };

  const setMenuItems = (updater) => {
    setMenuItemsState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (!Array.isArray(next)) {
        return prev;
      }
      persistMenuCache(next);
      return next;
    });
  };
  const availableFormCategories = useMemo(() => {
    const unique = new Set(
      menuItems
        .map((item) => item.category)
        .filter((category) => typeof category === "string" && category.trim().length > 0)
    );
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [menuItems]);

  useEffect(() => {

    const handleResize = () => setWindowWidth(window.innerWidth);

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);

  }, []);

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (

        isCategoryDropdownOpen &&

        categoryTriggerRef.current &&

        !categoryTriggerRef.current.contains(event.target) &&

        categoryMenuRef.current &&

        !categoryMenuRef.current.contains(event.target)

      ) {

        setIsCategoryDropdownOpen(false);

      }

      if (

        isStatusDropdownOpen &&

        statusTriggerRef.current &&

        !statusTriggerRef.current.contains(event.target) &&

        statusMenuRef.current &&

        !statusMenuRef.current.contains(event.target)

      ) {

        setIsStatusDropdownOpen(false);

      }

      if (

        isFormCategoryDropdownOpen &&

        formCategoryTriggerRef.current &&

        !formCategoryTriggerRef.current.contains(event.target) &&

        formCategoryMenuRef.current &&

        !formCategoryMenuRef.current.contains(event.target)

      ) {

        setIsFormCategoryDropdownOpen(false);

      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, [isCategoryDropdownOpen, isStatusDropdownOpen, isFormCategoryDropdownOpen]);

  useEffect(() => {

    if (!isFormOpen) {

      setIsFormCategoryDropdownOpen(false);

    }

  }, [isFormOpen]);

  const fetchMenuItems = useCallback(

    async ({ isSoft = false, focusId = null } = {}) => {

      const shouldShowFullLoader = !isSoft && menuItems.length === 0;

      if (isSoft) {

        setIsRefreshing(true);

      } else if (shouldShowFullLoader) {

        setIsLoading(true);

      }

      setError("");

      fetchControllerRef.current?.abort();

      const controller = new AbortController();

      fetchControllerRef.current = controller;

      const requestId = requestIdRef.current + 1;

      requestIdRef.current = requestId;

      let shouldSkipStateUpdate = false;

      try {

        const response = await fetchWithAuth(`${API_BASE_URL}/api/menu`, {

          signal: controller.signal,

        });

        if (!response.ok) {

          throw new Error("Unable to load the current menu.");

        }

        const data = await response.json();

        const normalized = Array.isArray(data) ? data : [];

        if (requestIdRef.current !== requestId) {

          return;

        }

        setMenuItems(sortMenuItems(normalized));

        setExpandedItemId((prev) => {

          if (focusId && normalized.some((item) => item._id === focusId)) {

            return focusId;

          }

          if (prev && normalized.some((item) => item._id === prev)) {

            return prev;

          }

          return null;

        });

      } catch (err) {

        if (err.name === "AbortError" || requestIdRef.current !== requestId) {

          shouldSkipStateUpdate = true;

          return;

        }

        setError(err.message || "Unable to load the current menu.");

      } finally {

        if (fetchControllerRef.current === controller) {

          fetchControllerRef.current = null;

        }

        if (!shouldSkipStateUpdate && requestIdRef.current === requestId) {

          setIsLoading(false);

          setIsRefreshing(false);

        }

      }

    },

    [menuItems.length]

  );

  useEffect(() => {

    fetchMenuItems();

    return () => {

      fetchControllerRef.current?.abort();

    };

  }, [fetchMenuItems]);

  useEffect(() => {

    setCurrentPage(1);

  }, [searchTerm, categoryFilter, availabilityFilter, menuItems.length]);

  const categoryOptions = useMemo(() => {

    const unique = Array.from(

      new Set(menuItems.map((item) => item.category).filter(Boolean))

    );

    return ["all", ...unique];

  }, [menuItems]);

  const filteredMenuItems = useMemo(() => {

    const searchLower = searchTerm.trim().toLowerCase();

    return menuItems.filter((item) => {

      const matchesSearch =

        !searchLower ||

        item.name?.toLowerCase().includes(searchLower) ||

        item.description?.toLowerCase().includes(searchLower) ||

        item.category?.toLowerCase().includes(searchLower) ||

        item.subcategory?.toLowerCase().includes(searchLower);

      const matchesCategory =

        categoryFilter === "all" || item.category === categoryFilter;

      const matchesAvailability =

        availabilityFilter === "all" ||

        (availabilityFilter === "available" && item.available) ||

        (availabilityFilter === "unavailable" && !item.available);

      return matchesSearch && matchesCategory && matchesAvailability;

    });

  }, [menuItems, searchTerm, categoryFilter, availabilityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMenuItems.length / ITEMS_PER_PAGE));

  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);

  const pageStart = filteredMenuItems.length === 0 ? 0 : (safeCurrentPage - 1) * ITEMS_PER_PAGE + 1;

  const pageEnd = Math.min(filteredMenuItems.length, safeCurrentPage * ITEMS_PER_PAGE);

  const paginatedItems = filteredMenuItems.slice(

    (safeCurrentPage - 1) * ITEMS_PER_PAGE,

    safeCurrentPage * ITEMS_PER_PAGE

  );

  useEffect(() => {

    if (currentPage !== safeCurrentPage) {

      setCurrentPage(safeCurrentPage);

    }

  }, [safeCurrentPage, currentPage]);

  const summaryStats = useMemo(() => {

    const availableCount = menuItems.filter((item) => item.available).length;

    const categoryCount = Math.max(0, categoryOptions.length - 1);

    const averagePrice =

      menuItems.length > 0

        ? menuItems.reduce((total, item) => total + Number(item.price || 0), 0) /

          menuItems.length

        : 0;

    return [

      {

        id: "total",

        label: "Total dishes",

        value: menuItems.length,

        helper: "Registered in the kitchen log",

      },

      {

        id: "available",

        label: "Available today",

        value: availableCount,

        helper: "Live on the dining room floor",

      },

      {

        id: "categories",

        label: "Categories",

        value: categoryCount,

        helper: "Curated experiences",

      },

      {

        id: "avg",

        label: "Average price",

        value: formatCurrency(averagePrice),

        helper: "Per plated creation",

      },

    ];

  }, [menuItems, categoryOptions]);

  const availabilityCounts = useMemo(() => {

    let available = 0;

    let unavailable = 0;

    menuItems.forEach((item) => {

      if (item.available) {

        available += 1;

      } else {

        unavailable += 1;

      }

    });

    return {

      all: menuItems.length,

      available,

      unavailable,

    };

  }, [menuItems]);

  const categoryCounts = useMemo(() => {

    const counts = { all: menuItems.length };

    menuItems.forEach((item) => {

      if (!item.category) return;

      counts[item.category] = (counts[item.category] || 0) + 1;

    });

    return counts;

  }, [menuItems]);

  const mobileFilterChips = useMemo(() => {
    const chips = [
      {
        id: "filter-all",
        label: "All filters",
        count: menuItems.length,
        type: "all",
      },
      ...availabilityFilterOptions
        .filter((option) => option.value !== "all")
        .map((option) => ({
          id: `status-${option.value}`,
          label: option.label,
          count:
            option.value === "available"
              ? availabilityCounts.available
              : availabilityCounts.unavailable,
          type: "status",
          value: option.value,
        })),
      ...categoryOptions
        .filter((option) => option !== "all")
        .map((option) => ({
          id: `category-${option}`,
          label: option || "Unassigned",
          count: categoryCounts[option] || 0,
          type: "category",
          value: option,
        })),
    ];
    return chips;
  }, [menuItems.length, availabilityCounts, categoryCounts, categoryOptions]);

  const handleMobileFilterClick = (chip) => {
    if (chip.type === "all") {
      setAvailabilityFilter("all");
      setCategoryFilter("all");
      return;
    }
    if (chip.type === "status") {
      setAvailabilityFilter(chip.value);
      return;
    }
    if (chip.type === "category") {
      setCategoryFilter(chip.value);
    }
  };

  const handleRefresh = () => fetchMenuItems({ isSoft: true });

  const openCreateForm = () => {

    setFormMode("create");

    setFormState(initialFormState);

    setEditingItemId(null);

    setIsFormOpen(true);

  };

  const openEditForm = (item) => {

    setFormMode("edit");

    setFormState({

      name: (item.name || "").toUpperCase(),

      category: item.category || "",

      subcategory: item.subcategory || "",

      price: item.price !== undefined && item.price !== null ? item.price : "",

      description: item.description || "",

      available: Boolean(item.available),

    });

    setEditingItemId(item._id);

    setIsFormOpen(true);

  };

  const handleFormChange = (field, value) => {

    setFormState((prev) => ({

      ...prev,

      [field]: value,

    }));

  };

  const handleSaveItem = async (event) => {

    event.preventDefault();

    if (!formState.name.trim() || !formState.category.trim() || !formState.subcategory.trim()) {

      setError("Please provide a name, category, and subcategory.");

      return;

    }

    setIsSaving(true);

    setError("");

    try {

      const payload = {

        name: formState.name.trim(),

        category: formState.category.trim(),

        subcategory: formState.subcategory.trim(),

        price: Number(formState.price || 0),

        description: formState.description.trim(),

        available: Boolean(formState.available),

      };

      const endpoint =

        formMode === "edit" && editingItemId

          ? `${API_BASE_URL}/api/menu/${editingItemId}`

          : `${API_BASE_URL}/api/menu`;

      const method = formMode === "edit" ? "PATCH" : "POST";

      const response = await fetchWithAuth(endpoint, {

        method,

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify(payload),

      });

      if (!response.ok) {

        throw new Error(

          formMode === "edit" ? "Unable to update the menu item." : "Unable to create the menu item."

        );

      }

      const result = await response.json();
      setMenuItems((prev) => {
        const filtered = prev.filter((entry) => entry._id !== result._id);
        return sortMenuItems([result, ...filtered]);
      });

      fetchMenuItems({ isSoft: true, focusId: result?._id }).catch(() => {});

      setIsFormOpen(false);

      setFormState(initialFormState);

      setEditingItemId(null);

    } catch (err) {

      setError(err.message || "Unable to save the menu item.");

    } finally {

      setIsSaving(false);

    }

  };

  const promptDeleteItem = (item) => {

    setPendingDeletion(item);

  };

  const confirmDeleteItem = async () => {

    if (!pendingDeletion?._id) return;

    setIsDeleting(true);

    setError("");

    const target = pendingDeletion;

    const previousMenu = menuItems;

    setPendingDeletion(null);

    setMenuItems((prev) => prev.filter((item) => item._id !== target._id));

    try {

      const response = await fetchWithAuth(`${API_BASE_URL}/api/menu/${target._id}`, {

        method: "DELETE",

      });

      if (!response.ok) {

        throw new Error("Unable to delete the menu item.");

      }

      fetchMenuItems({ isSoft: true }).catch(() => {});

    } catch (err) {

      setMenuItems(previousMenu);

      setPendingDeletion(target);

      setError(err.message || "Unable to delete the menu item.");

    } finally {

      setIsDeleting(false);

    }

  };

  const cancelDelete = () => setPendingDeletion(null);

  const handleToggleAvailability = async (item) => {

    setUpdatingAvailabilityId(item._id);

    setError("");

    try {

      const response = await fetchWithAuth(`${API_BASE_URL}/api/menu/${item._id}`, {

        method: "PATCH",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({ available: !item.available }),

      });

      if (!response.ok) {

        throw new Error("Unable to update availability.");

      }

      const updated = await response.json();

      setMenuItems((prev) =>

        prev.map((entry) => (entry._id === updated._id ? updated : entry))

      );

      if (expandedItemId === item._id) {

        setExpandedItemId(updated._id);

      }

    } catch (err) {

      setError(err.message || "Unable to update availability.");

    } finally {

      setUpdatingAvailabilityId("");

    }

  };

  const toggleRowExpansion = (itemId) =>

    setExpandedItemId((prev) => (prev === itemId ? null : itemId));

  const pagePadding = isMobileMenuTable ? "0 18px 50px" : "0 8px 60px";
  const outerPadding = isCompactAdminView ? "0 16px 50px" : pagePadding;
  const compactContentStyle = isCompactAdminView
    ? { width: "100%", maxWidth: "560px", margin: "0 auto" }
    : null;
  const tableCardOverrides = {
    padding: 0,
    overflow: "hidden",
    borderRadius: 0,
    boxShadow: isCompactAdminView ? "none" : undefined,
  };
  const tableHeaderPadding = isCompactAdminView ? "14px 18px" : "14px 26px";
  const tableMinWidth = isCompactAdminView ? "0" : "860px";
  const actionClusterAlignment = isCompactAdminView ? "flex-end" : "flex-start";
  const actionClusterWrap = isCompactAdminView ? "wrap" : "nowrap";
  const actionClusterGap = isCompactAdminView ? "10px" : "6px";
  const isSummaryCompact = windowWidth <= 640;

  return (

    <>

      <div

        style={{

          color: adminTheme.palette.contrast,

          fontFamily: adminTheme.fonts.body,

          padding: outerPadding,

          boxSizing: "border-box",

          width: "100%",
          overflowX: "hidden",

        }}

      >

        <div style={compactContentStyle || undefined}>

      <div style={{ marginBottom: "28px" }}>

        {activeTab === "menu" && (

          <>

            <h1 style={sectionHeadingStyle}>Content atelier</h1>

            <div style={underlineStyle} />

          </>

        )}

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "center",
          }}
        >

          {managementTabs.map((tab) => (

            <button

              key={tab.id}

              type="button"

              onClick={() => setActiveTab(tab.id)}

              style={{

                ...createChipStyle(tab.id === activeTab ? "accent" : "neutral", {

                  width: "fit-content",

                  marginBottom: "0",

                  cursor: "pointer",

                }),

              }}

            >

              {tab.label}

            </button>

          ))}

        </div>

      </div>

      <>
          <div

        style={{

          display: "grid",

          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",

          gap: "18px",

          marginBottom: "28px",

        }}

      >

        {summaryStats.map((stat) => (

          <div

            key={stat.id}

            style={{

              borderRadius: "26px",

              padding: "18px 22px",

              background: "#fff",

              border: `1px solid ${adminTheme.palette.border}`,

              display: "flex",

              flexDirection: isSummaryCompact ? "row" : "column",

              alignItems: isSummaryCompact ? "center" : "flex-start",

              justifyContent: isSummaryCompact ? "space-between" : "flex-start",

              gap: isSummaryCompact ? "12px" : "6px",

            }}

          >

            <span

              style={{

                fontSize: "0.75rem",

                letterSpacing: "0.3em",

                textTransform: "uppercase",

                color: adminTheme.palette.textMuted,

                flex: isSummaryCompact ? "1" : "initial",

              }}

            >

              {stat.label}

            </span>

            <div
              style={{
                fontSize: "1.6rem",
                fontFamily: adminTheme.fonts.display,
                marginLeft: isSummaryCompact ? "auto" : 0,
                textAlign: isSummaryCompact ? "right" : "left",
                minWidth: isSummaryCompact ? "auto" : "100%",
              }}
            >

              {stat.value}

            </div>

          </div>

        ))}

      </div>

      {error && (

        <div

          style={{

            ...createChipStyle("danger", {

              marginBottom: "18px",

              borderRadius: adminTheme.radii.md,

              textTransform: "none",

              letterSpacing: "initial",

            }),

          }}

        >

          {error}

        </div>

      )}

      <div

        style={{

          display: "flex",

          flexWrap: "wrap",

          gap: "14px",

          alignItems: "stretch",

          marginBottom: "14px",

        }}

      >

        <div
          style={{
            flex: "1 1 260px",
            minWidth: "200px",
            width: "100%",
          }}
        >

          <div

            style={{

              position: "relative",

              borderRadius: "25px",

              border: `1px solid ${adminTheme.palette.border}`,

              background: "#fff",

              cursor: "text",

              transition: "border-color 0.2s ease, box-shadow 0.2s ease",

            }}

            onClick={() => searchInputRef.current?.focus()}

          >

            <span

              style={{

                position: "absolute",

                left: "16px",

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

                <circle cx="11" cy="11" r="7" />

                <line x1="21" y1="21" x2="16.65" y2="16.65" />

              </svg>

            </span>

            <input

              id="menu-search"

              type="text"

              placeholder="Search by dish or ingredients"

              value={searchTerm}

              onChange={(event) => setSearchTerm(event.target.value)}

              ref={searchInputRef}

              style={{

                border: "none",

                outline: "none",

                width: "100%",

                padding: "13px 18px 13px 48px",

                borderRadius: adminTheme.radii.pill,

                fontFamily: adminTheme.fonts.body,

                fontSize: "0.95rem",

                color: adminTheme.palette.contrast,

                background: "transparent",

              }}

            />

          </div>

        </div>

        <div
          style={{
            flex: "0 0 auto",
            display: "flex",
            alignItems: "center",
          }}
        >
          {renderMenuActionButtons(isMobileMenuTable)}
        </div>

      </div>

      {isMobileMenuTable && (
        <div
          style={{
            marginBottom: "18px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            {mobileFilterChips.map((chip) => {
              const isActive =
                chip.type === "all"
                  ? availabilityFilter === "all" && categoryFilter === "all"
                  : chip.type === "status"
                  ? availabilityFilter === chip.value
                  : categoryFilter === chip.value;
              return (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => handleMobileFilterClick(chip)}
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
                    justifyContent: "space-between",
                    gap: "10px",
                    boxShadow: isActive ? "0 6px 16px rgba(0,0,0,0.08)" : "none",
                  }}
                >
                  <span>{chip.label.toUpperCase()}</span>
                  <span
                    style={{
                      borderRadius: "999px",
                      padding: "2px 10px",
                      background: isActive ? "#dcdcdc" : "#f5f5f5",
                      fontSize: "0.7rem",
                      letterSpacing: "normal",
                    }}
                  >
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

        <div style={createCardStyle(tableCardOverrides)}>
          <div style={{ padding: 0 }}>

            {isLoading ? (

              <div style={{ padding: "40px 28px", textAlign: "center" }}>Loading menu board...</div>

            ) : paginatedItems.length === 0 ? (

              <div style={{ padding: "40px 28px", textAlign: "center" }}>

                No dishes found. Adjust filters or add a new item.

              </div>

            ) : (

              <div style={{ overflowX: "auto" }}>

                <div style={{ minWidth: tableMinWidth }}>
                  {!isMobileMenuTable && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: menuTableColumnTemplate,
                        padding: tableHeaderPadding,
                        borderBottom: `1px solid ${adminTheme.palette.border}`,
                        fontSize: "0.7rem",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        color: "#000",
                        alignItems: "center",
                        position: "relative",
                        fontFamily: adminTheme.fonts.body,
                      }}
                    >

                    <span>#</span>

                    <span>Dish</span>

                    <div

                      style={{

                        display: "flex",

                        alignItems: "center",

                        gap: "6px",

                        position: "relative",

                      }}

                    >

                      <span>Category</span>

                      <button

                        type="button"

                        ref={categoryTriggerRef}

                        onClick={(event) => {

                          event.stopPropagation();

                          setIsCategoryDropdownOpen((prev) => !prev);

                          setIsStatusDropdownOpen(false);

                        }}

                        style={{

                          border: isCategoryDropdownOpen ? "1px solid #1d1d1d" : "none",

                          background: "#fff",

                          width: "30px",

                          height: "30px",

                          borderRadius: "12px",

                          display: "inline-flex",

                          alignItems: "center",

                          justifyContent: "center",

                          cursor: "pointer",

                          padding: 0,

                          position: "relative",

                        }}

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

                            transform: isCategoryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",

                          }}

                        >

                          <polyline points="6 9 12 15 18 9" />

                        </svg>

                        {categoryFilter !== "all" && (

                          <span

                            style={{

                              width: "6px",

                              height: "6px",

                              borderRadius: "50%",

                              background: "#5ea34d",

                              position: "absolute",

                              top: "-4px",

                              right: "-6px",

                            }}

                          />

                        )}

                      </button>

                      {isCategoryDropdownOpen && (

                        <div

                          ref={categoryMenuRef}

                          style={{

                            position: "absolute",

                            top: "calc(100% + 8px)",

                            left: 0,

                            background: "#fff",

                            borderRadius: adminTheme.radii.md,

                            border: `1px solid ${adminTheme.palette.border}`,

                            minWidth: "200px",

                            zIndex: 20,

                            overflow: "hidden",

                          }}

                        >

                            {categoryOptions.map((option) => (

                              <button

                                key={option}

                                type="button"

                                onClick={() => {

                                  setCategoryFilter(option);

                                  setIsCategoryDropdownOpen(false);

                                }}

                                style={{

                                  width: "100%",

                                  padding: "10px 16px",

                                  border: "none",

                                  background: option === categoryFilter ? "rgba(0,0,0,0.05)" : "#fff",

                                  textAlign: "left",

                                  fontSize: "0.82rem",

                                  cursor: "pointer",

                                  fontFamily: adminTheme.fonts.body,

                                  color: "#222",

                                  fontWeight: 400,

                                }}

                              >

                                {option === "all" ? "All categories" : option}

                              </button>

                            ))}

                        </div>

                      )}

                    </div>

                    <span>Price</span>

                    <div

                      style={{

                        display: "flex",

                        alignItems: "center",

                        gap: "6px",

                        position: "relative",

                      }}

                    >

                      <span>Status</span>

                      <button

                        type="button"

                        ref={statusTriggerRef}

                        onClick={(event) => {

                          event.stopPropagation();

                          setIsStatusDropdownOpen((prev) => !prev);

                          setIsCategoryDropdownOpen(false);

                        }}

                        style={{

                          border: isStatusDropdownOpen ? "1px solid #1d1d1d" : "none",

                          background: "#fff",

                          width: "30px",

                          height: "30px",

                          borderRadius: "12px",

                          display: "inline-flex",

                          alignItems: "center",

                          justifyContent: "center",

                          cursor: "pointer",

                          padding: 0,

                          position: "relative",

                        }}

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

                            transform: isStatusDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",

                          }}

                        >

                          <polyline points="6 9 12 15 18 9" />

                        </svg>

                        {availabilityFilter !== "all" && (

                          <span

                            style={{

                              width: "6px",

                              height: "6px",

                              borderRadius: "50%",

                              background: "#5ea34d",

                              position: "absolute",

                              top: "-4px",

                              right: "-6px",

                            }}

                          />

                        )}

                      </button>

                      {isStatusDropdownOpen && (

                        <div

                          ref={statusMenuRef}

                          style={{

                            position: "absolute",

                            top: "calc(100% + 10px)",

                            left: 0,

                            background: "#fff",

                            borderRadius: "18px",

                            border: `1px solid ${adminTheme.palette.border}`,

                            minWidth: "185px",

                            zIndex: 20,

                            boxShadow: "0 18px 40px rgba(0,0,0,0.12)",

                            padding: "6px",

                          }}

                        >

                          {availabilityFilterOptions.map((option) => (

                            <button

                              key={option.value}

                              type="button"

                              onClick={() => {

                                setAvailabilityFilter(option.value);

                                setIsStatusDropdownOpen(false);

                              }}

                              style={{

                                width: "100%",

                                padding: "10px 16px",

                                border: "none",

                                background:

                                  option.value === availabilityFilter ? "rgba(0,0,0,0.05)" : "transparent",

                                textAlign: "left",

                                fontSize: "0.9rem",

                                cursor: "pointer",

                                borderRadius: "12px",

                                fontFamily: adminTheme.fonts.body,

                                color: "#111",

                                fontWeight: 500,

                              }}

                            >

                              {option.label}

                            </button>

                          ))}

                        </div>

                      )}

                    </div>

                    <span style={{ textAlign: "left", letterSpacing: "0.2em" }}>Actions</span>
                    </div>
                  )
}

                  {paginatedItems.map((item, index) => {
                    const rowKey = item._id || index;
                    const rowNumber = (safeCurrentPage - 1) * ITEMS_PER_PAGE + index + 1;
                    const rowLabel = String(rowNumber).padStart(2, "0");
                    const isExpanded = expandedItemId === item._id;
                    const statusChip = (
                      <span
                        style={createChipStyle(item.available ? "success" : "danger", {
                          textTransform: "none",
                          letterSpacing: "0.02em",
                          fontSize: "0.8rem",
                          padding: "6px 14px",
                        })}
                      >
                        {item.available ? "Available" : "Offline"}
                      </span>
                    );
                    const actionButtons = (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: isMobileMenuTable ? "flex-start" : actionClusterAlignment,
                          alignItems: "center",
                          gap: actionClusterGap,
                          flexWrap: actionClusterWrap,
                          justifySelf: isMobileMenuTable ? "flex-start" : actionClusterAlignment,
                          alignSelf: "center",
                        }}
                      >
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleToggleAvailability(item);
                          }}
                          disabled={updatingAvailabilityId === item._id}
                          style={{
                            ...rowActionButtonStyle,
                            opacity: updatingAvailabilityId === item._id ? 0.5 : 1,
                            cursor: updatingAvailabilityId === item._id ? "not-allowed" : "pointer",
                          }}
                        >
                          {updatingAvailabilityId === item._id ? (
                            <span style={{ fontSize: "0.7rem", fontWeight: 600 }}>...</span>
                          ) : (
                            <img
                              src={item.available ? "/Icons/power.png" : "/Icons/power (1).png"}
                              alt={item.available ? "Set offline" : "Set live"}
                              style={{ width: 16, height: 16 }}
                            />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            openEditForm(item);
                          }}
                          style={rowActionButtonStyle}
                        >
                          <img src="/Icons/edit.png" alt="" style={{ width: 16, height: 16 }} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            promptDeleteItem(item);
                          }}
                          style={rowActionButtonStyle}
                        >
                          <img src="/Icons/trash.png" alt="" style={{ width: 16, height: 16 }} />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleRowExpansion(item._id);
                          }}
                          style={{
                            ...rowActionButtonStyle,
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <img src="/Icons/arrow-down.png" alt="" style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    );
                    const mobileInfoItems = [
                      { label: "Category", value: item.category || "-" },
                      { label: "Subcategory", value: item.subcategory || "Chef's selection" },
                      { label: "Price", value: formatCurrency(item.price) },
                    ];

                    return (
                      <React.Fragment key={rowKey}>
                        {isMobileMenuTable ? (
                          <div
                            onClick={() => toggleRowExpansion(item._id)}
                            style={{
                              padding: "18px 16px",
                              borderBottom: `1px solid ${adminTheme.palette.border}`,
                              backgroundColor: "#fff",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              gap: "14px",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "minmax(0, 1fr) auto",
                                gap: "12px",
                                alignItems: "flex-start",
                              }}
                            >
                              <div>
                                <div style={{ fontSize: "0.85rem", fontWeight: 600, marginBottom: "4px" }}>
                                  #{rowLabel}
                                </div>
                                <div style={dishPrimaryTextStyle}>{formatDishName(item.name)}</div>
                                <div
                                  style={{
                                    fontSize: "0.75rem",
                                    color: adminTheme.palette.textMuted,
                                    marginTop: "4px",
                                  }}
                                >
                                  {item.subcategory || "Chef's selection"}
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "column",
                                  alignItems: "flex-end",
                                  gap: "10px",
                                }}
                              >
                                {statusChip}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: "12px",
                              }}
                            >
                              {mobileInfoItems.map((meta) => (
                                <div
                                  key={`${rowKey}-${meta.label}`}
                                  style={{ display: "flex", flexDirection: "column", gap: "4px" }}
                                >
                                  <span
                                    style={{
                                      fontSize: "0.68rem",
                                      letterSpacing: "0.18em",
                                      textTransform: "uppercase",
                                      color: "#9a9a9a",
                                    }}
                                  >
                                    {meta.label}
                                  </span>
                                  <span style={{ fontWeight: 600 }}>{meta.value}</span>
                                </div>
                              ))}
                            </div>
                            <div
                              style={{
                                marginTop: "8px",
                                display: "flex",
                                justifyContent: "flex-start",
                              }}
                            >
                              {actionButtons}
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => toggleRowExpansion(item._id)}
                            style={{
                              display: "grid",
                              gridTemplateColumns: menuTableColumnTemplate,
                              alignItems: "center",
                              padding: windowWidth <= 640 ? "18px 16px" : "22px 32px",
                              borderBottom: `1px solid ${adminTheme.palette.border}`,
                              backgroundColor: "#fff",
                              transition: "background 0.2s ease",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontWeight: 700 }}>{rowLabel}</div>
                            <div style={dishPrimaryTextStyle}>{formatDishName(item.name)}</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span style={categoryValueStyle}>{item.category || "-"}</span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: adminTheme.palette.textMuted,
                                }}
                              >
                                {item.subcategory || "Chef's selection"}
                              </span>
                            </div>
                            <div style={{ fontWeight: 700 }}>{formatCurrency(item.price)}</div>
                            <div>{statusChip}</div>
                            {actionButtons}
                          </div>
                        )}

                        {isExpanded && (
                          <div
                            style={{
                              padding: windowWidth <= 640 ? "16px 20px 24px" : "16px 32px 24px",
                              background: "#fafafa",
                              borderBottom: `1px solid ${adminTheme.palette.border}`,
                              display: "grid",
                              gridTemplateColumns:
                                windowWidth <= 640 ? "1fr" : "repeat(3, minmax(0, 1fr))",
                              gap: "18px",
                              fontFamily: adminTheme.fonts.body,
                            }}
                          >
                            <div style={{ gridColumn: "1 / -1" }}>
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.2em",
                                  textTransform: "uppercase",
                                  color: "#9a9a9a",
                                }}
                              >
                                Description
                              </span>
                              <p style={{ marginTop: "6px", color: "#555", lineHeight: 1.5 }}>
                                {item.description && item.description.trim()
                                  ? item.description
                                  : "No additional notes provided."}
                              </p>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  letterSpacing: "0.2em",
                                  textTransform: "uppercase",
                                  color: "#9a9a9a",
                                }}
                              >
                                Last update
                              </span>
                              <span style={{ fontWeight: 600 }}>
                                {formatTimestamp(item.updatedAt || item.createdAt)}
                              </span>
                            </div>
                          </div>
                        )}

                      </React.Fragment>

                    );

                  })}

                </div>

              </div>

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

              {filteredMenuItems.length === 0

                ? "No dishes to display"

                : `Showing ${pageStart}-${pageEnd} of ${filteredMenuItems.length} dishes`}

            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

              <button

                type="button"

                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}

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

                onClick={() =>

                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))

                }

                disabled={safeCurrentPage === totalPages || filteredMenuItems.length === 0}

                style={{

                  border: "none",

                  background: "transparent",

                  color:

                    safeCurrentPage === totalPages || filteredMenuItems.length === 0

                      ? "#c0c0c0"

                      : "#333",

                  cursor:

                    safeCurrentPage === totalPages || filteredMenuItems.length === 0

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
      </>

        </div>

      </div>

      {activeTab === "menu" && isFormOpen && (

        <div

          style={{

            position: "fixed",

            inset: 0,

            backgroundColor: "rgba(0, 0, 0, 0.65)",

            display: "flex",

            justifyContent: "center",

            alignItems: "flex-start",

            padding: "40px 20px",

            zIndex: 1000,

          }}

          onClick={() => {

            if (!isSaving) {

              setIsFormOpen(false);

              setEditingItemId(null);

            }

          }}

        >

          <div

            style={{

              position: "relative",

              background: "#fff",

              borderRadius: "32px",

              padding: "40px 48px",

              width: "min(600px, 100%)",

              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.25)",

              fontFamily: "'Montserrat', sans-serif",

            }}

            onClick={(event) => event.stopPropagation()}

          >

            <button

              type="button"

              onClick={() => {

                if (!isSaving) {

                  setIsFormOpen(false);

                  setEditingItemId(null);

                }

              }}

              style={{

                position: "absolute",

                top: "16px",

                right: "16px",

                border: "none",

                background: "transparent",

                fontSize: "1.6rem",

                cursor: isSaving ? "not-allowed" : "pointer",

                color: "#b3aca5",

              }}

              aria-label="Close dish form"

            >

              &times;

            </button>

            <h3

              style={{

                marginTop: 0,

                marginBottom: "6px",

                textAlign: "center",

                fontSize: "1.9rem",

                fontWeight: 500,

                color: adminTheme.palette.contrast,

                letterSpacing: "0.04em",

              }}

            >

              {formMode === "edit" ? "Edit Dish" : "Add Dish"}

            </h3>

            <p

              style={{

                textAlign: "center",

                color: "#8b8680",

                fontSize: "0.9rem",

                marginTop: 0,

                marginBottom: "28px",

              }}

            >

              Review dish details and pricing carefully to keep the menu accurate for guests.

            </p>

            <form onSubmit={handleSaveItem} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>

              <div

                style={{

                  display: "grid",

                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "repeat(2, minmax(0, 1fr))",

                  gap: "22px",

                }}

              >

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

                  <span style={dishEditLabelStyle}>Dish name</span>

                  <input

                    id="menu-name"

                    type="text"

                    value={formState.name}

                    onChange={(event) =>

                      handleFormChange("name", event.target.value?.toUpperCase() || "")

                    }

                    style={{ ...dishEditInputStyle, textTransform: "uppercase" }}

                    required

                  />

                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

                  <span style={dishEditLabelStyle}>Category</span>

                  <div style={{ position: "relative" }} ref={formCategoryTriggerRef}>

                    <input

                      id="menu-category"

                      type="text"

                      value={formState.category}

                      onChange={(event) => handleFormChange("category", event.target.value)}

                      style={{ ...dishEditInputStyle, paddingRight: "44px" }}

                      required

                    />

                    {availableFormCategories.length > 0 && (

                      <>

                        <button

                          type="button"

                          onClick={(event) => {

                            event.stopPropagation();

                            setIsFormCategoryDropdownOpen((prev) => !prev);

                          }}

                          style={{

                            position: "absolute",

                            top: "50%",

                            right: 0,

                            transform: "translateY(-50%)",

                            border: isFormCategoryDropdownOpen ? "1px solid #1d1d1d" : "none",

                            background: "#fff",

                            width: "32px",

                            height: "32px",

                            borderRadius: "12px",

                            cursor: "pointer",

                            padding: 0,

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                          }}

                          aria-label="Select category"

                        >

                          <svg

                            width="16"

                            height="16"

                            viewBox="0 0 24 24"

                            fill="none"

                            stroke="#1d1d1d"

                            strokeWidth="2"

                            strokeLinecap="round"

                            strokeLinejoin="round"

                            style={{

                              transition: "transform 0.2s ease",

                              transform: isFormCategoryDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",

                            }}

                          >

                            <polyline points="6 9 12 15 18 9" />

                          </svg>

                        </button>

                        {isFormCategoryDropdownOpen && (

                          <div

                            ref={formCategoryMenuRef}

                            style={{

                              position: "absolute",

                              top: "calc(100% + 10px)",

                              left: 0,

                              right: 0,

                              background: "#fff",

                              border: `1px solid ${adminTheme.palette.border}`,

                              borderRadius: "18px",

                              boxShadow: "0 18px 40px rgba(0, 0, 0, 0.15)",

                              zIndex: 20,

                              maxHeight: "220px",

                              overflowY: "auto",

                              padding: "6px",

                            }}

                          >

                            {availableFormCategories.map((category) => (

                              <button

                                key={category}

                                type="button"

                                onClick={() => {

                                  handleFormChange("category", category);

                                  setIsFormCategoryDropdownOpen(false);

                                }}

                                style={{

                                  width: "100%",

                                  textAlign: "left",

                                  border: "none",

                                  background:

                                    formState.category === category ? "rgba(0,0,0,0.05)" : "#fff",

                                  padding: "12px 14px",

                                  cursor: "pointer",

                                  fontFamily: "'Montserrat', sans-serif",

                                  color: "#222",

                                  fontWeight: 400,

                                  fontSize: "0.85rem",

                                }}

                              >

                                {category}

                              </button>

                            ))}

                          </div>

                        )}

                      </>

                    )}

                  </div>

                </label>

              </div>

              <div

                style={{

                  display: "grid",

                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "repeat(2, minmax(0, 1fr))",

                  gap: "22px",

                }}

              >

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

                  <span style={dishEditLabelStyle}>Subcategory</span>

                  <input

                    id="menu-subcategory"

                    type="text"

                    value={formState.subcategory}

                    onChange={(event) => handleFormChange("subcategory", event.target.value)}

                    style={dishEditInputStyle}

                    required

                  />

                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>

                  <span style={dishEditLabelStyle}>Price</span>

                  <input

                    id="menu-price"

                    type="number"

                    min="0"

                    step="0.01"

                    value={formState.price}

                    onChange={(event) => handleFormChange("price", event.target.value)}

                    style={dishEditInputStyle}

                  />

                </label>

              </div>

              <div

                style={{

                  display: "grid",

                  gridTemplateColumns: windowWidth <= 640 ? "1fr" : "minmax(0, 1.3fr) minmax(0, 0.8fr)",

                  gap: "24px",

                  alignItems: "start",

                }}

              >

                <label style={{ display: "flex", flexDirection: "column", gap: "8px" }}>

                  <span style={dishEditLabelStyle}>Description</span>

                  <textarea

                    id="menu-description"

                    value={formState.description}

                    onChange={(event) => handleFormChange("description", event.target.value)}

                    style={dishEditTextareaStyle}

                    rows={4}

                  />

                </label>

                <div

                  style={{

                    display: "flex",

                    flexDirection: "column",

                    gap: "22px",

                    alignSelf: "stretch",

                  }}

                >

                  <div

                    style={{

                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "#f6f3ef",
                      padding: "14px 18px",
                      borderRadius: "18px",
                      fontFamily: "'Montserrat', sans-serif",
                      alignSelf: "flex-start",
                      marginTop: "30px",

                    }}

                  >

                    <input

                      id="menu-available"

                      type="checkbox"

                      checked={formState.available}

                      onChange={(event) => handleFormChange("available", event.target.checked)}

                      style={{ width: 18, height: 18 }}

                    />

                    <label

                      htmlFor="menu-available"

                      style={{

                        margin: 0,
                        cursor: "pointer",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        fontSize: "0.85rem",
                        whiteSpace: "nowrap",
                       

                      }}

                    >

                      Available for guests

                    </label>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-start" }}>

                    <button

                      type="submit"

                      disabled={isSaving}

                      style={{

                        border: "none",

                        borderRadius: 0,

                        padding: "16px 30px",

                        background: "#ff6b35",

                        color: "#fff",

                        fontWeight: 600,

                        fontSize: "0.75rem",

                        letterSpacing: "0.2em",

                        textTransform: "uppercase",

                        cursor: isSaving ? "not-allowed" : "pointer",

                        opacity: isSaving ? 0.6 : 1,

                        fontFamily: "'Montserrat', sans-serif",
                        marginLeft:"20px"

                      }}

                      onMouseOver={(event) => {

                        if (!isSaving) event.currentTarget.style.background = "#e55a2b";

                      }}

                      onMouseOut={(event) => {

                        event.currentTarget.style.background = "#ff6b35";

                      }}

                    >

                      {isSaving ? "Saving..." : formMode === "edit" ? "Save Changes" : "Create Dish"}

                    </button>

                  </div>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}
      {activeTab === "menu" && pendingDeletion && (

        <div

          style={{

            position: "fixed",

            inset: 0,

            backgroundColor: "rgba(0, 0, 0, 0.5)",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            padding: "20px",

            zIndex: 1000,

          }}

        >

          <div

            style={{

              background: "#fff",

              borderRadius: adminTheme.radii.xl,

              padding: "32px",

              width: "min(420px, 100%)",

              textAlign: "center",

            }}

          >

            <h3 style={{ marginTop: 0, marginBottom: "12px", fontFamily: adminTheme.fonts.display }}>

              Remove dish

            </h3>

            <p style={{ color: adminTheme.palette.textMuted }}>

              Permanently remove <strong>{pendingDeletion.name}</strong> from the menu?

            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginTop: "18px" }}>

              <button

                type="button"

                onClick={cancelDelete}

                style={buttonStyle("ghost", { padding: "12px 24px" })}

                disabled={isDeleting}

              >

                Cancel

              </button>

              <button

                type="button"

                onClick={confirmDeleteItem}

                disabled={isDeleting}

                style={buttonStyle("primary", {

                  padding: "12px 24px",

                  background: adminTheme.palette.danger,

                })}

              >

                {isDeleting ? "Deleting..." : "Delete dish"}

              </button>

            </div>

          </div>

        </div>

      )}

    </>

  );

}



