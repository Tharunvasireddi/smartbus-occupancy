import { useEffect, useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { subscribeBusByNumber } from "../api/apimethods";
import {
  ArrowLeftIcon,
  ClockIcon,
  UsersIcon,
  InformationCircleIcon,
  MapIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export const BusDetails = () => {
  const { busNumber } = useParams({ from: "/buses/$busNumber" });
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedText, setLastUpdatedText] = useState("Unknown");

  useEffect(() => {
    setLoading(true);
    setError("");
    const unsubscribe = subscribeBusByNumber(
      busNumber,
      (fetched) => {
        if (!fetched) {
          setError("Bus not found.");
          setBus(null);
        } else {
          setBus(fetched);
          setError("");
        }
        setLoading(false);
      },
      () => {
        setError("Failed to load bus.");
        setLoading(false);
      },
    );

    return () => {
      unsubscribe?.();
    };
  }, [busNumber]);

  useEffect(() => {
    if (!bus?.lastUpdated) {
      setLastUpdatedText("Unknown");
      return;
    }
    const timestamp = bus.lastUpdated;
    const formatted = new Date(timestamp).toLocaleString();
    setLastUpdatedText(formatted);
  }, [bus?.lastUpdated]);

  const passengers = bus?.passengerCount ?? bus?.occupied ?? 0;
  const capacity = bus?.capacity ?? 0;
  const occupancyPct = (() => {
    if (typeof bus?.occupancy === "number")
      return Math.max(0, Math.min(100, bus.occupancy));
    if (capacity > 0)
      return Math.max(0, Math.min(100, (passengers / capacity) * 100));
    return null;
  })();

  const statusLabel = bus?.status ?? "Unknown";
  const statusTone = (() => {
    if (!statusLabel) return "bg-white/10 text-white";
    const lower = statusLabel.toString().toLowerCase();
    if (lower.includes("over"))
      return "bg-rose-500/15 text-rose-100 border border-rose-400/30";
    if (lower.includes("normal") || lower.includes("on time"))
      return "bg-emerald-500/15 text-emerald-100 border border-emerald-400/30";
    if (lower.includes("del") || lower.includes("late"))
      return "bg-amber-500/15 text-amber-100 border border-amber-400/30";
    return "bg-white/10 text-white border border-white/15";
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
              Bus detail
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-3xl font-bold text-white">{busNumber}</span>
              {bus?.routeName && (
                <span className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white">
                  <MapIcon className="h-4 w-4" /> {bus.routeName}
                </span>
              )}
            </div>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white px-3 py-2 rounded-lg bg-white/5 border border-white/10 shadow-lg shadow-black/30 w-fit"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Back
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
          {loading && (
            <p className="text-sm text-slate-200">Loading bus data...</p>
          )}
          {error && <p className="text-sm text-rose-200">{error}</p>}

          {!loading && !error && bus && (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <InformationCircleIcon className="h-4 w-4" />
                  <span>Status</span>
                  <span
                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${statusTone}`}
                  >
                    <BoltIcon className="h-4 w-4" /> {statusLabel}
                  </span>
                </div>
                <div className="text-sm text-slate-300">
                  Last updated: {lastUpdatedText}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    Occupancy
                    <span className="text-[11px] text-slate-300">live</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {occupancyPct !== null ? occupancyPct.toFixed(0) : "--"}%
                    </span>
                    <span className="text-slate-300 text-sm">
                      capacity used
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 via-sky-400 to-blue-500"
                      style={{
                        width: `${occupancyPct !== null ? occupancyPct : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    Passengers
                    <span className="text-[11px] text-slate-300">on board</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {passengers}
                    </span>
                    <span className="text-slate-300 text-sm">people</span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-xs text-slate-200 bg-white/10 border border-white/15 rounded-full px-3 py-1 w-fit">
                    <UsersIcon className="h-4 w-4" /> Live count
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-black/20 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-400">
                    Capacity
                    <span className="text-[11px] text-slate-300">seats</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-white">
                      {capacity > 0 ? capacity : "--"}
                    </span>
                    <span className="text-slate-300 text-sm">available</span>
                  </div>
                  <div className="text-xs text-slate-300 flex items-center gap-2">
                    <ClockIcon className="h-4 w-4" /> Last update:{" "}
                    {lastUpdatedText}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
