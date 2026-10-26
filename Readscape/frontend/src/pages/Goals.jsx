import { useState } from "react";
import { Link } from "react-router-dom";
import { useSharedBooks } from "../context/BooksContext";
import { calculatePercentage } from "../data/goalsData";
import { useSharedGoals } from "../context/GoalsContext";

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

const emptyGoal = {
  title: "",
  target: "",
  unit: "books",
  current: 0,
};

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

function Goals() {
  const { books } = useSharedBooks();

  const {
  goals,
  saveGoals,
  setMainGoal,
} = useSharedGoals();
  const [newGoal, setNewGoal] = useState({ ...emptyGoal });
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToRemove, setGoalToRemove] = useState(null);

  const finishedBooks = books.filter(
    (book) => book.status === "finished"
  );

  // Calculate pages already recorded in Library.
  function getPagesRead(book) {
    const total = Number(book.pages) || 0;

    if (book.status === "finished") return total;

    if (book.status === "reading") {
      return book.currentPage ??
        Math.round(
          total * (Number(book.progress) || 0) / 100
        );
    }

    return 0;
  }

  const totalPagesRead = books.reduce(
    (total, book) => total + getPagesRead(book),
    0
  );

  // Books and pages update from Library automatically.
  // Days and minutes use manually entered progress.
  function getCurrent(goal) {
    if (goal.unit === "books") {
      return finishedBooks.length;
    }

    if (goal.unit === "pages") {
      return totalPagesRead;
    }

    return Number(goal.current) || 0;
  }

  const mainGoal =
    goals.find((goal) => goal.main) || goals[0] || null;

  const mainCurrent = mainGoal ? getCurrent(mainGoal) : 0;

  const mainPercentage = mainGoal
    ? calculatePercentage(mainCurrent, mainGoal.target)
    : 0;

  const remaining = mainGoal
    ? Math.max(0, mainGoal.target - mainCurrent)
    : 0;

  const completedGoals = goals.filter(
    (goal) => getCurrent(goal) >= goal.target
  ).length;

  function handleInputChange(event) {
    const { name, value } = event.target;

    setNewGoal((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // Add a new goal.
  function handleAddGoal(event) {
    event.preventDefault();

    const title = newGoal.title.trim();
    const target = Number(newGoal.target);

    if (
      !title ||
      !Number.isInteger(target) ||
      target <= 0
    ) {
      return;
    }

    const goal = {
      id: crypto.randomUUID(),
      title,
      target,
      unit: newGoal.unit,
      current: 0,
      main: goals.length === 0,
    };

    saveGoals([...goals, goal]);
    setNewGoal({ ...emptyGoal });
  }

  // Edit an existing goal.
  function handleSaveEdit(event) {
    event.preventDefault();

    if (!editingGoal) return;

    const title = editingGoal.title.trim();
    const target = Number(editingGoal.target);

    if (
      !title ||
      !Number.isInteger(target) ||
      target <= 0
    ) {
      return;
    }

    saveGoals(
      goals.map((goal) =>
        goal.id === editingGoal.id
          ? {
              ...goal,
              title,
              target,
              unit: editingGoal.unit,
              current:
                goal.unit === editingGoal.unit
                  ? goal.current
                  : 0,
            }
          : goal
      )
    );

    setEditingGoal(null);
  }

  // Update manual progress for days or minutes.
  function updateManualProgress(id, value) {
    const amount = Number(value);

    if (!Number.isInteger(amount) || amount < 0) {
      return;
    }

    saveGoals(
      goals.map((goal) =>
        goal.id === id
          ? { ...goal, current: amount }
          : goal
      )
    );
  }


  // Remove the selected goal.
  function confirmRemoveGoal() {
    if (!goalToRemove) return;

    const remainingGoals = goals.filter(
      (goal) => goal.id !== goalToRemove.id
    );

    if (goalToRemove.main && remainingGoals.length > 0) {
      remainingGoals[0] = {
        ...remainingGoals[0],
        main: true,
      };
    }

    saveGoals(remainingGoals);
    setGoalToRemove(null);
  }

  return (
    <>
      <main className="goals-page">
        <Link
          to="/dashboard"
          className="goals-back-link"
        >
          ← Back to overview
        </Link>

        {/* HERO */}
        <section className="goals-hero">
          <p className="small-label">
            WHAT YOU'RE AIMING FOR
          </p>

          <h1>Goals.</h1>

          <p className="goals-intro">
            Keep a few reading goals in view.
            Nudge them forward as you go, and
            add new ones whenever you like.
          </p>
        </section>

        {/* MAIN GOAL */}
        {mainGoal ? (
          <section className="main-goal-section">
            <div className="main-goal-percentage">
              <strong>{mainPercentage}%</strong>
              <span>Main goal</span>
            </div>

            <div className="main-goal-copy">
              <h2>{mainGoal.title}</h2>

              <p>
                {mainCurrent.toLocaleString()} of{" "}
                {mainGoal.target.toLocaleString()}{" "}
                {mainGoal.unit}
                {" — "}
                {remaining.toLocaleString()} to go.
                {" "}
                {completedGoals} of {goals.length} goals complete.
              </p>
            </div>
          </section>
        ) : (
          <section className="main-goal-section">
            <div className="main-goal-copy">
              <h2>No goals yet.</h2>
              <p>Create your first reading goal below.</p>
            </div>
          </section>
        )}

        {/* GOALS LIST */}
        <section className="goals-list">
          {goals.map((goal) => {
            const current = getCurrent(goal);

            const percentage = calculatePercentage(
              current,
              goal.target
            );

            const isManual =
              goal.unit === "days" ||
              goal.unit === "minutes";

            return (
              <article
                className="goal-row"
                key={goal.id}
              >
                <div className="goal-row-top">
                  <h3>{goal.title}</h3>
                  <span>{percentage}%</span>
                </div>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  />
                </div>

                <p>
                  {current.toLocaleString()}
                  {" / "}
                  {goal.target.toLocaleString()}
                  {" "}
                  {goal.unit}
                  {" · "}
                  {percentage}%
                </p>

                {goal.main && (
                  <p className="small-label">
                    ★ MAIN GOAL
                  </p>
                )}

                {isManual ? (
                  <div className="goal-manual-progress">
                    <label htmlFor={`progress-${goal.id}`}>
                      Current progress
                    </label>

                    <input
                      id={`progress-${goal.id}`}
                      type="number"
                      min="0"
                      step="1"
                      value={goal.current ?? 0}
                      onChange={(event) => {
                        const value = event.target.value;

                        if (value !== "") {
                          updateManualProgress(goal.id, value);
                        }
                      }}
                    />

                    <p>
                      This goal is tracked manually.
                    </p>
                  </div>
                ) : (
                  <p className="goal-auto-label">
                    Updates automatically from your Library.
                  </p>
                )}

                <div className="goal-actions">
                  {!goal.main && (
                    <button
                      type="button"
                      className="library-edit-button"
                      onClick={() => setMainGoal(goal.id)}
                    >
                      Set as Main
                    </button>
                  )}

                  <button
                    type="button"
                    className="library-edit-button"
                    onClick={() =>
                      setEditingGoal({ ...goal })
                    }
                  >
                    Edit Goal
                  </button>

                  <button
                    type="button"
                    className="library-remove-button"
                    onClick={() => setGoalToRemove(goal)}
                  >
                    Delete Goal
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* NEW GOAL */}
        <section className="new-goal-section">
          <div className="new-goal-heading">
            <p className="small-label">
              NEW GOAL
            </p>

            <h2>Add another goal</h2>
          </div>

          <form
            className="new-goal-form"
            onSubmit={handleAddGoal}
          >
            <div className="goal-form-field goal-title-field">
              <label htmlFor="goal-title">
                Goal
              </label>

              <input
                id="goal-title"
                type="text"
                name="title"
                placeholder="Read 5 poetry collections"
                value={newGoal.title}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="goal-form-field">
              <label htmlFor="goal-target">
                Target
              </label>

              <input
                id="goal-target"
                type="number"
                name="target"
                min="1"
                step="1"
                placeholder="5"
                value={newGoal.target}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="goal-form-field">
              <label htmlFor="goal-unit">
                Counted in
              </label>

              <select
                id="goal-unit"
                name="unit"
                value={newGoal.unit}
                onChange={handleInputChange}
              >
                <option value="books">Books</option>
                <option value="pages">Pages</option>
                <option value="days">Days</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>

            <button
              type="submit"
              className="add-goal-button"
            >
              Add goal
            </button>
          </form>
        </section>

        {/* EDIT GOAL FORM */}
        {editingGoal && (
          <div className="book-form-overlay">
            <form
              className="book-form"
              onSubmit={handleSaveEdit}
            >
              <h2>Edit Goal</h2>

              <label htmlFor="edit-goal-title">
                Goal Title
              </label>

              <input
                id="edit-goal-title"
                value={editingGoal.title}
                onChange={(event) =>
                  setEditingGoal({
                    ...editingGoal,
                    title: event.target.value,
                  })
                }
                required
              />

              <label htmlFor="edit-goal-target">
                Target
              </label>

              <input
                id="edit-goal-target"
                type="number"
                min="1"
                step="1"
                value={editingGoal.target}
                onChange={(event) =>
                  setEditingGoal({
                    ...editingGoal,
                    target: event.target.value,
                  })
                }
                required
              />

              <label htmlFor="edit-goal-unit">
                Counted in
              </label>

              <select
                id="edit-goal-unit"
                value={editingGoal.unit}
                onChange={(event) =>
                  setEditingGoal({
                    ...editingGoal,
                    unit: event.target.value,
                  })
                }
              >
                <option value="books">Books</option>
                <option value="pages">Pages</option>
                <option value="days">Days</option>
                <option value="minutes">Minutes</option>
              </select>

              <div className="book-form-actions">
                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                >
                  Cancel
                </button>

                <button type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DELETE CONFIRMATION */}
        {goalToRemove && (
          <div className="book-form-overlay">
            <div
              className="book-form"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-goal-title"
            >
              <h2 id="delete-goal-title">
                Delete Goal?
              </h2>

              <p>
                Are you sure you want to delete{" "}
                <strong>{goalToRemove.title}</strong>?
              </p>

              <p>
                This will not delete any books
                from your Library.
              </p>

              <div className="book-form-actions">
                <button
                  type="button"
                  onClick={() => setGoalToRemove(null)}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="library-confirm-remove"
                  onClick={confirmRemoveGoal}
                >
                  Delete Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>Readscape</h3>
            <p>
              A quieter place to keep every
              book, thought, and reading
              milestone.
            </p>
          </div>

          <div className="footer-bottom-row">
            <span>© 2026 Readscape</span>

            <Link to="/library">
              Library
            </Link>

            <span>
              Reading data saved locally
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Goals;
