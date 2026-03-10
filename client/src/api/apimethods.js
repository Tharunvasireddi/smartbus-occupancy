import { onValue, ref } from "firebase/database";
import { database } from "./firebase";

const BUS_NODE = "buses";

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
      const buses = mapBusList(snapshot);
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
      const buses = mapBusList(snapshot);

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
