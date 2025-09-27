import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ListingItem from "../components/ListingItem";
import Lottie from "lottie-react";
import animationData from "../assets/loading.json";
// Adjust path if needed
import { FiChevronDown } from "react-icons/fi";

const RESULTS_PER_PAGE = 9;

export default function Search() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: "",
    type: "all",
    parking: false,
    furnished: false,
    offer: false,
    sort: "createdAt",
    order: "desc",
  });
  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });
  // console.log(listings);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get("searchTerm") || "";
    const typeFromUrl = urlParams.get("type") || "all";
    const parkingFromUrl = urlParams.get("parking");
    const furnishedFromUrl = urlParams.get("furnished");
    const offerFromUrl = urlParams.get("offer");
    const sortFromUrl = urlParams.get("sort") || "createdAt";
    const orderFromUrl = urlParams.get("order") || "desc";
    const pageFromUrl = parseInt(urlParams.get("page") || "1", 10);

    const normalizedType = ["rent", "sale", "all"].includes(typeFromUrl)
      ? typeFromUrl
      : "all";
    const normalizedSort = [
      "createdAt",
      "updatedAt",
      "regularPrice",
      "discountPrice",
    ].includes(sortFromUrl)
      ? sortFromUrl
      : "createdAt";
    const normalizedOrder = orderFromUrl === "asc" ? "asc" : "desc";
    const resolvedPage =
      Number.isNaN(pageFromUrl) || pageFromUrl < 1 ? 1 : pageFromUrl;

    setSidebardata({
      searchTerm: searchTermFromUrl,
      type: normalizedType,
      parking: parkingFromUrl === "true",
      furnished: furnishedFromUrl === "true",
      offer: offerFromUrl === "true",
      sort: normalizedSort,
      order: normalizedOrder,
    });

    setPagination((prev) => ({
      ...prev,
      currentPage: resolvedPage,
    }));

    const fetchListings = async () => {
      setLoading(true);
      const params = new URLSearchParams(urlParams);
      params.set("limit", RESULTS_PER_PAGE.toString());
      params.set("page", resolvedPage.toString());

      try {
        const res = await fetch(`/api/listing/get?${params.toString()}`);
        if (!res.ok) {
          setListings([]);
          setPagination({ currentPage: resolvedPage, totalPages: 1 });
          setLoading(false);
          return;
        }
        const data = await res.json();
        setListings(data.listings || []);
        setPagination({
          currentPage: data.page || resolvedPage,
          totalPages: data.totalPages || 1,
        });
      } catch (error) {
        console.error("Failed to fetch listings", error);
        setListings([]);
        setPagination({ currentPage: resolvedPage, totalPages: 1 });
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);
  //console.log(sidebardata);
  const handleChange = (e) => {
    if (
      e.target.id === "all" ||
      e.target.id === "rent" ||
      e.target.id === "sale"
    ) {
      setSidebardata((prev) => ({ ...prev, type: e.target.id }));
    }
    if (e.target.id === "searchTerm") {
      setSidebardata((prev) => ({ ...prev, searchTerm: e.target.value }));
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setSidebardata((prev) => ({
        ...prev,
        [e.target.id]: e.target.checked || e.target.checked === "true",
      }));
    }
    if (e.target.id === "sort_order") {
      const [sortValue, orderValue] = e.target.value.split("_");
      const sort = sortValue || "createdAt";
      const order = orderValue === "asc" ? "asc" : "desc";
      setSidebardata((prev) => ({ ...prev, sort, order }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams();
    urlParams.set("searchTerm", sidebardata.searchTerm);
    urlParams.set("type", sidebardata.type);
    urlParams.set("parking", sidebardata.parking);
    urlParams.set("furnished", sidebardata.furnished);
    urlParams.set("offer", sidebardata.offer);
    urlParams.set("sort", sidebardata.sort);
    urlParams.set("order", sidebardata.order);
    urlParams.set("page", "1");
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  const handlePageChange = (targetPage) => {
    const nextPage = Math.min(
      Math.max(targetPage, 1),
      Math.max(pagination.totalPages, 1)
    );
    if (nextPage === pagination.currentPage) return;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set("page", nextPage.toString());
    navigate(`/search?${urlParams.toString()}`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    if (totalPages <= 1) {
      return null;
    }

    const basePages =
      totalPages <= 5
        ? Array.from({ length: totalPages }, (_, index) => index + 1)
        : Array.from(
            new Set(
              [
                1,
                currentPage - 1,
                currentPage,
                currentPage + 1,
                totalPages,
              ].filter(
                (pageNumber) => pageNumber >= 1 && pageNumber <= totalPages
              )
            )
          ).sort((a, b) => a - b);

    const pageButtons = [];
    basePages.forEach((pageNumber, index) => {
      if (index > 0 && pageNumber - basePages[index - 1] > 1) {
        pageButtons.push(
          <span
            key={`ellipsis-${pageNumber}`}
            className="px-2 text-sm text-slate-400"
          >
            ...
          </span>
        );
      }

      pageButtons.push(
        <button
          key={`page-${pageNumber}`}
          onClick={() => handlePageChange(pageNumber)}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-shadow duration-150 ${
            pageNumber === currentPage
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
              : "text-emerald-600 hover:bg-emerald-50"
          }`}
        >
          {pageNumber}
        </button>
      );
    });

    return (
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="rounded-full border border-emerald-200 px-4 py-2 font-semibold text-emerald-600 transition enabled:hover:border-emerald-400 enabled:hover:text-emerald-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          Prev
        </button>
        {pageButtons}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="rounded-full border border-emerald-200 px-4 py-2 font-semibold text-emerald-600 transition enabled:hover:border-emerald-400 enabled:hover:text-emerald-500 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <main className="bg-slate-50 text-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-12 lg:flex-row">
        <aside className="lg:w-80">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-xl shadow-emerald-100/60 lg:sticky lg:top-24">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Search Term:
                </label>
                <input
                  type="text"
                  id="searchTerm"
                  placeholder="search..."
                  className="w-full rounded-xl border border-emerald-100/70 bg-slate-50/60 px-3 py-3 text-sm shadow-inner shadow-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  value={sidebardata.searchTerm}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Type:
                </p>
                <div className="grid gap-2">
                  {["all", "rent", "sale", "offer"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 rounded-xl border border-emerald-100/70 bg-slate-50/40 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300"
                    >
                      <input
                        type="checkbox"
                        id={option}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300"
                        onChange={handleChange}
                        checked={
                          option === "all"
                            ? sidebardata.type === "all"
                            : option === "offer"
                            ? sidebardata.offer
                            : sidebardata.type === option
                        }
                      />
                      <span className="capitalize">
                        {option === "all" ? "Rent & sale" : option}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Amenities:
                </p>
                <div className="grid gap-2">
                  {["parking", "furnished"].map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 rounded-xl border border-emerald-100/70 bg-slate-50/40 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300"
                    >
                      <input
                        type="checkbox"
                        id={option}
                        className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300"
                        onChange={handleChange}
                        checked={sidebardata[option]}
                      />
                      <span className="capitalize">{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sort:
                </label>
                <div className="relative">
                  <select
                    id="sort_order"
                    className="w-full appearance-none rounded-xl border border-emerald-100/70 bg-white px-3 py-3 pr-10 text-sm font-medium text-slate-700 shadow-inner shadow-emerald-50 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200"
                    onChange={handleChange}
                    value={`${sidebardata.sort}_${sidebardata.order}`}
                  >
                    <option value="createdAt_desc">Latest</option>
                    <option value="createdAt_asc">Oldest</option>
                    <option value="regularPrice_desc">Price high to low</option>
                    <option value="regularPrice_asc">Price low to high</option>
                    <option value="discountPrice_desc">
                      Discount high to low
                    </option>
                    <option value="discountPrice_asc">
                      Discount low to high
                    </option>
                  </select>
                  <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500" />
                </div>
              </div>

              <button className="w-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-200 transition hover:from-emerald-300 hover:via-emerald-400 hover:to-emerald-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200">
                search
              </button>
            </form>
          </div>
        </aside>

        <section className="flex-1">
          <header className="border-b border-emerald-100 pb-6">
            <h1 className="text-3xl font-semibold text-slate-900">
              Listing results:
            </h1>
          </header>

          <div className="relative mt-6 rounded-3xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-100/50 min-h-[300px]">
            {loading && (
              <div className="absolute inset-0 rounded-3xl bg-emerald-950/5" />
            )}

            {loading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4">
                <Lottie
                  animationData={animationData}
                  loop
                  className="h-32 w-32 md:h-40 md:w-40"
                  style={{
                    filter:
                      "brightness(0) saturate(100%) invert(9%) sepia(99%) saturate(2593%) hue-rotate(210deg) brightness(89%) contrast(95%)",
                  }}
                />
                <p className="text-lg font-semibold text-slate-700 md:text-xl">
                  Loading...
                </p>
              </div>
            )}

            {!loading && listings.length === 0 && (
              <p className="text-base font-medium text-slate-600">
                No listing found!
              </p>
            )}

            {!loading && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {listings.map((listing) => (
                  <ListingItem
                    key={listing._id}
                    listing={listing}
                    size="compact"
                  />
                ))}
              </div>
            )}

            {!loading && listings.length > 0 && renderPagination()}
          </div>
        </section>
      </div>
    </main>
  );
}
