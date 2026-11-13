export const initialGoals = [
  {
    id: 1,
    title: "Read 30 books in 2026",
    current: 26,
    target: 30,
    unit: "books",
    main: true,
  },
  {
    id: 2,
    title: "Read 10,000 pages",
    current: 7840,
    target: 10000,
    unit: "pages",
    main: false,
  },
  {
    id: 3,
    title: "Finish 4 books in translation",
    current: 1,
    target: 4,
    unit: "books",
    main: false,
  },
  {
    id: 4,
    title: "Read 20 minutes every day in October",
    current: 5,
    target: 31,
    unit: "days",
    main: false,
  },
];

export const emptyGoal = {
  title: "",
  target: "",
  unit: "books",
};

export function calculatePercentage(current, target) {
  if (!target || target <= 0) {
    return 0;
  }

  return Math.min(
    100,
    Math.round((current / target) * 100)
  );
}

export function getMainGoal(goals) {
  return goals.find((goal) => goal.main) || goals[0];
}

export function getCompletedGoals(goals) {
  return goals.filter(
    (goal) => goal.current >= goal.target
  ).length;
}

export function getRemainingAmount(goal) {
  return Math.max(
    0,
    goal.target - goal.current
  );
}

export function createGoal(newGoal) {
  if (
    !newGoal.title.trim() ||
    !newGoal.target ||
    Number(newGoal.target) <= 0
  ) {
    return null;
  }

  return {
    id: Date.now(),
    title: newGoal.title.trim(),
    current: 0,
    target: Number(newGoal.target),
    unit: newGoal.unit,
    main: false,
  };
}

export function addGoalToList(
  goals,
  newGoal
) {
  const goal = createGoal(newGoal);

  if (!goal) {
    return goals;
  }

  return [...goals, goal];
}