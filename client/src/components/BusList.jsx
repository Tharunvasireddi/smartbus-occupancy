import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { filterBusesByRoute, subscribeBuses } from "../api/apimethods";

const clampPercentage = (value) =>
  Math.max(0, Math.min(100, Math.round(value)));

const getOccupancyPercentage = (bus) => {
  if (typeof bus?.occupancy === "number") return clampPercentage(bus.occupancy);

  const capacity = bus?.capacity ?? 0;
  const passengers = bus?.occupied ?? bus?.passengerCount ?? 0;

  if (capacity > 0) {
    return clampPercentage((passengers / capacity) * 100);
  }

  return null;
};

export const BusList = () => {
  const navigate = useNavigate();
  const [allBuses, setAllBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fromInput, setFromInput] = useState("");
  const [toInput, setToInput] = useState("");
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    const unsubscribe = subscribeBuses(
      (list) => {
        setAllBuses(list);
        setFilteredBuses(list);
        setSearchError("");
        setLoading(false);
      },
      () => {
        setError("Failed to load buses.");
        setLoading(false);
      },
    );

    return () => {
      unsubscribe?.();
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const list = filterBusesByRoute(allBuses, fromInput, toInput);
    setFilteredBuses(list);
    setSearchError(list.length === 0 ? "No buses found for that route." : "");
  };

  const bannerCopy = useMemo(() => {
    if (loading) return "Pulling the latest buses...";
    if (error) return "We hit a snag loading buses.";
    if (filteredBuses.length === 0) return "No buses are live right now.";
    return `Tracking ${filteredBuses.length} ${filteredBuses.length === 1 ? "bus" : "buses"}.`;
  }, [loading, error, filteredBuses]);

  const handleNavigate = (bus) => {
    const busId = bus?.busNumber ?? bus?.id;
    if (!busId) return;
    navigate({
      to: "/buses/$busNumber",
      params: { busNumber: busId },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 shadow-2xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100">
                Live occupancy
              </p>
              <h1 className="text-3xl font-bold text-white">
                Smart Bus Tracker
              </h1>
              <p className="text-blue-100 mt-1">{bannerCopy}</p>
            </div>
            <form
              className="w-full sm:w-auto flex flex-col sm:flex-row gap-3"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                placeholder="From"
                className="w-full sm:w-56 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60"
              />
              <input
                type="text"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                placeholder="To"
                className="w-full sm:w-56 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-blue-100 focus:outline-none focus:ring-2 focus:ring-white/60 focus:border-white/60"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-slate-900 font-semibold shadow-lg shadow-blue-900/30 hover:translate-y-[-1px] transition"
              >
                Find buses
                <ArrowRightIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
          {searchError && (
            <p className="text-sm text-rose-100 mt-2">{searchError}</p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur rounded-2xl border border-white/10 shadow-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Now showing
              </p>
              <h2 className="text-xl font-semibold text-white">Buses</h2>
            </div>
            {loading && (
              <span className="text-sm text-slate-300">Loading...</span>
            )}
          </div>
          {error && <p className="text-sm text-rose-200 mb-3">{error}</p>}
          {!loading && filteredBuses.length === 0 && (
            <p className="text-sm text-slate-300">No buses available.</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuses.map((bus) => (
              <button
                key={bus.busNumber ?? bus.id}
                className="text-left rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition shadow-lg shadow-black/20 p-4 flex flex-col gap-3"
                onClick={() => handleNavigate(bus)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      Bus
                    </p>
                    <p className="text-2xl font-bold text-white">
                      {bus.busNumber ?? bus.id}
                    </p>
                    <p className="text-sm text-slate-200">
                      Route: {bus.routeName ?? "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Passengers</p>
                    <p className="text-lg font-semibold text-white">
                      {bus.occupied ?? bus.passengerCount ?? 0}
                    </p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500"
                    style={{
                      width: `${getOccupancyPercentage(bus) ?? 100}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
