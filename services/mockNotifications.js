import { Platform } from "react-native";

let idCounter = 1;
const now = () => new Date().toISOString();

export const generateMockNotification = (type = "general") => {
  const base = {
    id: `${Date.now()}-${idCounter++}`,
    read: false,
    createdAt: now(),
  };
  switch (type) {
    case "emergency":
      return {
        ...base,
        type,
        title: "Emergency Alert",
        message: "Fire alarm triggered near Tower B. Evacuate immediately.",
        icon: Platform.select({ ios: "alert-circle", android: "alert-circle" }),
        color: "#E53935",
      };
    case "waste":
      return {
        ...base,
        type,
        title: "Waste Collection",
        message: "Waste collection scheduled tomorrow 7:00 AM. Place bins outside tonight.",
        icon: Platform.select({ ios: "trash", android: "trash" }),
        color: "#43A047",
      };
    default:
      return {
        ...base,
        type: "general",
        title: "Community Update",
        message: "Maintenance in the lobby from 2-4 PM today.",
        icon: Platform.select({ ios: "notifications", android: "notifications" }),
        color: "#28942c",
      };
  }
};

const seed = [
  {
    id: `${Date.now()}-${idCounter++}`,
    type: "emergency",
    title: "Emergency Alert",
    message: "Earthquake drill at 3 PM. Follow safety protocols.",
    icon: "alert-circle",
    color: "#E53935",
    read: false,
    createdAt: now(),
  },
  {
    id: `${Date.now()}-${idCounter++}`,
    type: "waste",
    title: "Waste Collection",
    message: "Recyclables pick-up at 8 AM tomorrow.",
    icon: "trash",
    color: "#43A047",
    read: false,
    createdAt: now(),
  },
  {
    id: `${Date.now()}-${idCounter++}`,
    type: "general",
    title: "General Notice",
    message: "Pool area is closed for cleaning until 6 PM.",
    icon: "notifications",
    color: "#28942c",
    read: true,
    createdAt: now(),
  },
];

export default seed; 