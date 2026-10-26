
import {
  createContext,
  useContext,
  useState,
} from "react";

const GoalsContext = createContext(null);
const STORAGE_KEY = "readscape-goals";

const defaultGoals = [
  {
    id: "default-books",
    title: "Finish 30 books",
    target: 30,
    unit: "books",
    current: 0,
    main: true,
  },
  {
    id: "default-pages",
    title: "Read 10,000 pages",
    target: 10000,
    unit: "pages",
    current: 0,
    main: false,
  },
];

function loadGoals() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (error) {
    console.error("Could not load goals:", error);
  }

  return defaultGoals;
}

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState(loadGoals);

  function saveGoals(updatedGoals) {
    setGoals(updatedGoals);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedGoals)
      );
    } catch (error) {
      console.error("Could not save goals:", error);
    }
  }

  function addGoal(goal) {
    saveGoals([...goals, goal]);
  }

  function updateGoal(id, changes) {
    saveGoals(
      goals.map((goal) =>
        goal.id === id ? { ...goal, ...changes } : goal
      )
    );
  }

  function deleteGoal(id) {
    const removed = goals.find((goal) => goal.id === id);
    const remaining = goals.filter((goal) => goal.id !== id);

    if (
      removed?.main &&
      remaining.length > 0 &&
      !remaining.some((goal) => goal.main)
    ) {
      remaining[0] = { ...remaining[0], main: true };
    }

    saveGoals(remaining);
  }

  function setMainGoal(id) {
    saveGoals(
      goals.map((goal) => ({
        ...goal,
        main: goal.id === id,
      }))
    );
  }

  return (
    <GoalsContext.Provider
      value={{
        goals,
        saveGoals,
        addGoal,
        updateGoal,
        deleteGoal,
        setMainGoal,
      }}
    >
      {children}
    </GoalsContext.Provider>
  );
}

export function useSharedGoals() {
  const context = useContext(GoalsContext);

  if (!context) {
    throw new Error(
      "useSharedGoals must be used inside GoalsProvider"
    );
  }

  return context;
}