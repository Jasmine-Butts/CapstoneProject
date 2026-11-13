
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "../services/api";

const GoalsContext = createContext(null);

export function GoalsProvider({ children }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const goalsRef = useRef([]);
  const saveQueue = useRef(Promise.resolve());
  const generationRef = useRef(0);
  const userRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadGoals() {
      const generation = ++generationRef.current;

      goalsRef.current = [];
      setGoals([]);
      setError("");

      // Wait for any earlier saves to finish.
      const previousQueue = saveQueue.current;
      saveQueue.current = Promise.resolve();

      setLoading(true);

      if (!sessionStorage.getItem("readscapeToken")) {
        userRef.current = null;
        setLoading(false);
        return;
      }

      try {
        await previousQueue.catch(() => {});

        const [userData, goalsData] = await Promise.all([
          api("/auth/me"),
          api("/goals"),
        ]);

        if (!active || generation !== generationRef.current) {
          return;
        }

        userRef.current = userData.user.id;

        const loadedGoals = Array.isArray(goalsData.goals)
          ? goalsData.goals
          : [];

        goalsRef.current = loadedGoals;
        setGoals(loadedGoals);
      } catch (err) {
        if (active && generation === generationRef.current) {
          setError(err.message);
          console.error("Could not load goals:", err);
        }
      } finally {
        if (active && generation === generationRef.current) {
          setLoading(false);
        }
      }
    }

    loadGoals();

    window.addEventListener("readscape-auth-changed", loadGoals);

    return () => {
      active = false;
      generationRef.current += 1;
      window.removeEventListener(
        "readscape-auth-changed",
        loadGoals
      );
    };
  }, []);

  function saveGoals(updatedGoals) {
    if (loading || !userRef.current) {
      setError("Please log in and wait for goals to load.");
      return Promise.resolve(false);
    }

    const generation = generationRef.current;
    const userId = userRef.current;
    const nextGoals = updatedGoals.map(goal => ({ ...goal }));

    setError("");
    setSaving(true);

    // Keep writes in order, including rapid progress updates.
    const operation = saveQueue.current
      .catch(() => {})
      .then(async () => {
        if (
          generation !== generationRef.current ||
          userId !== userRef.current
        ) {
          return false;
        }

        try {
          const data = await api("/goals", {
            method: "PUT",
            body: JSON.stringify({ goals: nextGoals }),
          });

          if (
            generation !== generationRef.current ||
            userId !== userRef.current
          ) {
            return false;
          }

          goalsRef.current = data.goals;
          setGoals(data.goals);
          setError("");
          return true;
        } catch (err) {
          if (generation === generationRef.current) {
            setError(err.message);
            console.error("Could not save goals:", err);
          }
          return false;
        }
      });

    saveQueue.current = operation;

    operation.finally(() => {
      if (generation === generationRef.current) {
        setSaving(false);
      }
    });

    return operation;
  }

  function addGoal(goal) {
    return saveGoals([...goalsRef.current, goal]);
  }

  function updateGoal(id, changes) {
    return saveGoals(
      goalsRef.current.map(goal =>
        goal.id === id ? { ...goal, ...changes } : goal
      )
    );
  }

  function deleteGoal(id) {
    const remaining = goalsRef.current.filter(
      goal => goal.id !== id
    );

    if (
      remaining.length > 0 &&
      !remaining.some(goal => goal.main)
    ) {
      remaining[0] = { ...remaining[0], main: true };
    }

    return saveGoals(remaining);
  }

  function setMainGoal(id) {
    return saveGoals(
      goalsRef.current.map(goal => ({
        ...goal,
        main: goal.id === id,
      }))
    );
  }

  return (
    <GoalsContext.Provider
      value={{
        goals,
        loading,
        saving,
        error,
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
