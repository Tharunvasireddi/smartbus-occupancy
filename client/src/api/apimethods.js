import { onValue, ref } from "firebase/database";
import { database } from "./firebase";

const BUS_NODE = "buses";

const DUMMY_BUSES = [
  {
    id: "demo-101",
    busNumber: "C101",
    routeName: "Central Station to Riverside Park",
    from: "Central Station",
    to: "Riverside Park",
    source: "Central Station",
    destination: "Riverside Park",
    capacity: 58,
    passengerCount: 34,
    occupied: 34,
    occupancy: Math.round((34 / 58) * 100),
    status: "On time",
    lastUpdated: Date.now() - 1000 * 60 * 5,
  },
  {
    id: "demo-202",
    busNumber: "E202",
    routeName: "East Market to Tech Park",
    from: "East Market",
    to: "Tech Park",
    source: "East Market",
    destination: "Tech Park",
    capacity: 52,
    passengerCount: 41,
    occupied: 41,
    occupancy: Math.round((41 / 52) * 100),
    status: "Near capacity",
    lastUpdated: Date.now() - 1000 * 60 * 12,
  },
  {
    id: "demo-303",
    busNumber: "N303",
    routeName: "North Hub to Lakeview",
    from: "North Hub",
    to: "Lakeview",
    source: "North Hub",
    destination: "Lakeview",
    capacity: 45,
    passengerCount: 18,
    occupied: 18,
    occupancy: Math.round((18 / 45) * 100),
    status: "On time",
    lastUpdated: Date.now() - 1000 * 60 * 25,
  },
  {
    id: "demo-404",
    busNumber: "A404",
    routeName: "Airport to Downtown",
    from: "Airport",
    to: "Downtown",
    source: "Airport",
    destination: "Downtown",
    capacity: 60,
    passengerCount: 52,
    occupied: 52,
    occupancy: Math.round((52 / 60) * 100),
    status: "Delayed",
    lastUpdated: Date.now() - 1000 * 60 * 40,
  },
  {
    id: "demo-505",
    busNumber: "U505",
    routeName: "University to City Center",
    from: "University",
    to: "City Center",
    source: "University",
    destination: "City Center",
    capacity: 48,
    passengerCount: 26,
    occupied: 26,
    occupancy: Math.round((26 / 48) * 100),
    status: "On time",
    lastUpdated: Date.now() - 1000 * 60 * 55,
  },
];

const mergeWithDummy = (liveBuses) => {
  const liveList = (liveBuses ?? []).map((bus) => ({
    ...bus,
    isDummy: false,
  }));

  const seen = new Set(
    liveList.map((bus) => bus?.busNumber ?? bus?.id).filter(Boolean),
  );

  const dummyList = DUMMY_BUSES.filter((bus) => {
    const key = bus?.busNumber ?? bus?.id;
    return key && !seen.has(key);
  }).map((bus) => ({
    ...bus,
    isDummy: true,
  }));

  return [...liveList, ...dummyList];
};

const mapBusList = (snapshot) => {
  const data = snapshot.val();
  console.log("Live bus data:", data);

  if (!data) return [];

  return Object.entries(data).map(([id, value]) => ({
    id,
    busNumber: value?.busNumber ?? id,
    routeName: value?.routeName ?? id,
    capacity: value?.capacity ?? 0,
    occupied: value?.passengerCount ?? 0,
    occupancy: value?.occupancy ?? 0,
    status: value?.status ?? "Unknown",
    lastUpdated: value?.lastUpdate ?? null,
    ...value,
  }));
};

const normalize = (value) => value?.toString().trim().toLowerCase() ?? "";

const routeMatches = (bus, fromInput, toInput) => {
  const fromNorm = normalize(fromInput);
  const toNorm = normalize(toInput);

  const fromFields = [bus.from, bus.source, bus.origin, bus.routeName];
  const toFields = [bus.to, bus.destination, bus.routeName];

  const fromMatch = fromNorm
    ? fromFields.some((field) => normalize(field).includes(fromNorm))
    : true;

  const toMatch = toNorm
    ? toFields.some((field) => normalize(field).includes(toNorm))
    : true;

  return fromMatch && toMatch;
};

export const filterBusesByRoute = (buses, fromInput, toInput) =>
  buses.filter((bus) => routeMatches(bus, fromInput, toInput));

export const subscribeBuses = (onData, onError) => {
  const busesRef = ref(database, BUS_NODE);

  const unsubscribe = onValue(
    busesRef,
    (snapshot) => {
      const buses = mergeWithDummy(mapBusList(snapshot));
      onData?.(buses);
    },
    (error) => {
      if (onError) onError(error);
    },
  );

  return () => unsubscribe();
};

export const subscribeBusByNumber = (busNumber, onData, onError) => {
  const trimmed = busNumber?.toString().trim();
  if (!trimmed) return () => {};

  const busesRef = ref(database, BUS_NODE);

  const unsubscribe = onValue(
    busesRef,
    (snapshot) => {
      const buses = mergeWithDummy(mapBusList(snapshot));

      const found =
        buses.find((bus) => bus.busNumber === trimmed || bus.id === trimmed) ??
        null;

      onData?.(found);
    },
    (error) => {
      if (onError) onError(error);
    },
  );

  return () => unsubscribe();
};
