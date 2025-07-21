import { QRHistoryItem } from "@/types/qr-types";

const HISTORY_KEY = "qr-generator-history";
const MAX_HISTORY_ITEMS = 10;

export const getHistory = (): QRHistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
};

export const saveToHistory = (item: Omit<QRHistoryItem, "id">): QRHistoryItem[] => {
  try {
    const history = getHistory();
    
    // Remove duplicate entries (same data and type)
    const filtered = history.filter(
      h => !(h.config.data === item.config.data && h.config.inputType === item.config.inputType)
    );
    
    // Add new item at the beginning
    const newHistory = [item as QRHistoryItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    return newHistory;
  } catch (error) {
    console.error("Failed to save to history:", error);
    return getHistory();
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Failed to clear history:", error);
  }
};

export const exportHistory = (): void => {
  try {
    const history = getHistory();
    const blob = new Blob([JSON.stringify(history, null, 2)], {
      type: "application/json",
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-generator-history-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to export history:", error);
  }
};

export const importHistory = (file: File): Promise<QRHistoryItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (Array.isArray(data)) {
          localStorage.setItem(HISTORY_KEY, JSON.stringify(data));
          resolve(data);
        } else {
          reject(new Error("Invalid history file format"));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};