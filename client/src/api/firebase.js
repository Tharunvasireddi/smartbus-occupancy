import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDroxiF7psdPZwd3rL1gA9ShQ5YdUnc8aE",
  authDomain: "bus-occupancy-monitoring.firebaseapp.com",
  databaseURL:
    "https://bus-occupancy-monitoring-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "bus-occupancy-monitoring",
  storageBucket: "bus-occupancy-monitoring.firebasestorage.app",
  messagingSenderId: "468678835944",
  appId: "1:468678835944:web:380be13cd2bbc3468f135d",
};

const app = initializeApp(firebaseConfig);

export const database = getDatabase(app);
