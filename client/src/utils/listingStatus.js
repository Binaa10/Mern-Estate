export const STATUS_VALUE_MAP = {
  all: "all",
  pending: "pending",
  accepted: "active",
  active: "active",
  declined: "declined",
  inactive: "inactive",
};

export const listingStatusMeta = {
  active: {
    label: "Accepted",
    badge: { variant: "success" },
  },
  declined: {
    label: "Declined",
    badge: {
      variant: "outline",
      className: "border-rose-200 bg-rose-50 text-rose-700",
    },
  },
  inactive: {
    label: "Inactive",
    badge: {
      variant: "outline",
      className: "border-slate-300 bg-slate-100 text-slate-600",
    },
  },
  pending: {
    label: "Pending",
    badge: {
      variant: "outline",
      className: "border-amber-300 bg-amber-50 text-amber-700",
    },
  },
};

export const getListingStatus = (listing) => {
  const raw = typeof listing?.status === "string" ? listing.status : null;
  if (raw) {
    const normalized = raw.trim().toLowerCase();
    if (normalized) return normalized;
  }
  return listing?.isActive ? "active" : "inactive";
};

export const getListingStatusMeta = (listing, activeFilter) => {
  const status = getListingStatus(listing);
  const base = listingStatusMeta[status] || listingStatusMeta.inactive;

  if (activeFilter === "active" && status === "active") {
    return {
      status,
      label: "Active",
      badge: base.badge,
    };
  }

  if (activeFilter === "inactive" && status === "inactive") {
    return {
      status,
      label: "Inactive",
      badge: base.badge,
    };
  }

  return {
    status,
    ...base,
  };
};
