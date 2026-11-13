import { useState } from "react";
import { Link } from "react-router-dom";
import { useSharedBooks } from "../context/BooksContext";
import { calculatePercentage } from "../data/goalsData";
import { useSharedGoals } from "../context/GoalsContext";

const emptyGoal = { title: "", target: "", unit: "books", current: 0 };

function Goals() {
  const { books } = useSharedBooks();
  const { goals, saveGoals, setMainGoal, loading, saving, error: goalsError } = useSharedGoals();

  const [newGoal, setNewGoal] = useState({ ...emptyGoal });
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalToRemove, setGoalToRemove] = useState(null);
  const [manualDrafts, setManualDrafts] = useState({});
  const [actionError, setActionError] = useState("");

  const finishedBooks = books.filter(book => book.status === "finished");

  function getPagesRead(book) {
    const total = Number(book.pages) || 0;
    if (book.status === "finished") return total;
    if (book.status === "reading") {
      return Number(book.currentPage ?? Math.round(total * (Number(book.progress) || 0) / 100));
    }
    return 0;
  }

  const totalPagesRead = books.reduce((sum, book) => sum + getPagesRead(book), 0);

  function getCurrent(goal) {
    if (goal.unit === "books") return finishedBooks.length;
    if (goal.unit === "pages") return totalPagesRead;
    return Number(goal.current) || 0;
  }

  const mainGoal = goals.find(goal => goal.main) || goals[0] || null;
  const mainCurrent = mainGoal ? getCurrent(mainGoal) : 0;
  const mainPercentage = mainGoal ? calculatePercentage(mainCurrent, mainGoal.target) : 0;
  const remaining = mainGoal ? Math.max(0, mainGoal.target - mainCurrent) : 0;
  const completedGoals = goals.filter(goal => getCurrent(goal) >= goal.target).length;

  function handleInputChange(event) {
    const { name, value } = event.target;
    setNewGoal(previous => ({ ...previous, [name]: value }));
  }

  async function handleAddGoal(event) {
    event.preventDefault();
    if (loading || saving) return;

    const title = newGoal.title.trim();
    const target = Number(newGoal.target);
    if (!title || !Number.isSafeInteger(target) || target <= 0) {
      setActionError("Enter a valid title and positive whole-number target.");
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

    setActionError("");
    const saved = await saveGoals([...goals, goal]);
    if (saved) setNewGoal({ ...emptyGoal });
    else setActionError("Could not add your goal. Please try again.");
  }

  async function handleSaveEdit(event) {
    event.preventDefault();
    if (!editingGoal || loading || saving) return;

    const title = editingGoal.title.trim();
    const target = Number(editingGoal.target);
    if (!title || !Number.isSafeInteger(target) || target <= 0) {
      setActionError("Enter a valid title and positive whole-number target.");
      return;
    }

    setActionError("");
    const saved = await saveGoals(
      goals.map(goal => goal.id === editingGoal.id
        ? {
            ...goal,
            title,
            target,
            unit: editingGoal.unit,
            current: goal.unit === editingGoal.unit ? goal.current : 0,
          }
        : goal
      )
    );

    if (saved) setEditingGoal(null);
    else setActionError("Could not update your goal.");
  }

  async function handleManualProgress(goal, rawValue) {
    if (loading || saving || rawValue === undefined) return;
    const amount = Number(rawValue);
    if (String(rawValue).trim() === "" || !Number.isSafeInteger(amount) || amount < 0) {
      setActionError("Enter a valid nonnegative whole number for progress.");
      return;
    }
    if (amount === Number(goal.current)) {
      setManualDrafts(previous => {
        const next = { ...previous };
        delete next[goal.id];
        return next;
      });
      return;
    }

    setActionError("");
    const saved = await saveGoals(
      goals.map(item => item.id === goal.id ? { ...item, current: amount } : item)
    );

    if (saved) {
      setManualDrafts(previous => {
        const next = { ...previous };
        delete next[goal.id];
        return next;
      });
    } else {
      setActionError("Could not save reading progress.");
    }
  }

  async function handleSetMain(id) {
    if (loading || saving) return;
    setActionError("");
    const saved = await setMainGoal(id);
    if (!saved) setActionError("Could not change the main goal.");
  }

  async function confirmRemoveGoal() {
    if (!goalToRemove || loading || saving) return;

    const remainingGoals = goals.filter(goal => goal.id !== goalToRemove.id);
    if (goalToRemove.main && remainingGoals.length > 0) {
      remainingGoals[0] = { ...remainingGoals[0], main: true };
    }

    setActionError("");
    const saved = await saveGoals(remainingGoals);
    if (saved) setGoalToRemove(null);
    else setActionError("Could not delete your goal.");
  }

  return (
    <>
      <main className="goals-page">
        {loading && <p>Loading your goals...</p>}
        {saving && <p>Saving your goals...</p>}
        {(actionError || goalsError) && (
          <p role="alert" style={{ color: "#a43e3e" }}>
            {actionError || goalsError}
          </p>
        )}


        <section className="goals-hero">
          <p className="small-label">WHAT YOU'RE AIMING FOR</p>
          <h1>Goals.</h1>
          <p className="goals-intro">
            Keep a few reading goals in view. Nudge them forward as you go,
            and add new ones whenever you like.
          </p>
        </section>

        {mainGoal ? (
          <section className="main-goal-section">
            <div className="main-goal-percentage">
              <strong>{mainPercentage}%</strong>
              <span>Main goal</span>
            </div>
            <div className="main-goal-copy">
              <h2>{mainGoal.title}</h2>
              <p>
                {mainCurrent.toLocaleString()} of {mainGoal.target.toLocaleString()} {mainGoal.unit}
                {" — "}{remaining.toLocaleString()} to go. {" "}
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

        <section className="goals-list">
          {goals.map(goal => {
            const current = getCurrent(goal);
            const percentage = calculatePercentage(current, goal.target);
            const isManual = goal.unit === "days" || goal.unit === "minutes";

            return (
              <article className="goal-row" key={goal.id}>
                <div className="goal-row-top">
                  <h3>{goal.title}</h3>
                  <span>{percentage}%</span>
                </div>
                <div className="goal-progress-track">
                  <div className="goal-progress-fill" style={{ width: `${percentage}%` }} />
                </div>
                <p>
                  {current.toLocaleString()} / {goal.target.toLocaleString()} {goal.unit}
                  {" · "}{percentage}%
                </p>
                {goal.main && <p className="small-label">★ MAIN GOAL</p>}

                {isManual ? (
                  <div className="goal-manual-progress">
                    <label htmlFor={`progress-${goal.id}`}>Current progress</label>
                    <input
                      id={`progress-${goal.id}`}
                      type="number"
                      min="0"
                      step="1"
                      disabled={loading || saving}
                      value={manualDrafts[goal.id] ?? goal.current ?? 0}
                      onChange={event => {
                        setManualDrafts(previous => ({
                          ...previous,
                          [goal.id]: event.target.value,
                        }));
                      }}
                      onBlur={event => handleManualProgress(goal, event.target.value)}
                      onKeyDown={event => {
                        if (event.key === "Enter") event.currentTarget.blur();
                      }}
                    />
                    <p>This goal is tracked manually. Changes save when you leave the field.</p>
                  </div>
                ) : (
                  <p className="goal-auto-label">Updates automatically from your Library.</p>
                )}

                <div className="goal-actions">
                  {!goal.main && (
                    <button
                      type="button"
                      className="library-edit-button"
                      disabled={loading || saving}
                      onClick={() => handleSetMain(goal.id)}
                    >
                      Set as Main
                    </button>
                  )}
                  <button
                    type="button"
                    className="library-edit-button"
                    disabled={loading || saving}
                    onClick={() => { setActionError(""); setEditingGoal({ ...goal }); }}
                  >
                    Edit Goal
                  </button>
                  <button
                    type="button"
                    className="library-remove-button"
                    disabled={loading || saving}
                    onClick={() => { setActionError(""); setGoalToRemove(goal); }}
                  >
                    Delete Goal
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <section className="new-goal-section">
          <div className="new-goal-heading">
            <p className="small-label">NEW GOAL</p>
            <h2>Add another goal</h2>
          </div>
          <form className="new-goal-form" onSubmit={handleAddGoal}>
            <div className="goal-form-field goal-title-field">
              <label htmlFor="goal-title">Goal</label>
              <input
                id="goal-title"
                type="text"
                name="title"
                placeholder="Read 5 poetry collections"
                value={newGoal.title}
                onChange={handleInputChange}
                maxLength={200}
                required
              />
            </div>
            <div className="goal-form-field">
              <label htmlFor="goal-target">Target</label>
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
              <label htmlFor="goal-unit">Counted in</label>
              <select id="goal-unit" name="unit" value={newGoal.unit} onChange={handleInputChange}>
                <option value="books">Books</option>
                <option value="pages">Pages</option>
                <option value="days">Days</option>
                <option value="minutes">Minutes</option>
              </select>
            </div>
            <button type="submit" className="add-goal-button" disabled={loading || saving}>
              {saving ? "Saving..." : "Add goal"}
            </button>
          </form>
        </section>

        {editingGoal && (
          <div className="book-form-overlay">
            <form className="book-form" onSubmit={handleSaveEdit}>
              <h2>Edit Goal</h2>
              <label htmlFor="edit-goal-title">Goal Title</label>
              <input
                id="edit-goal-title"
                value={editingGoal.title}
                maxLength={200}
                onChange={event => setEditingGoal({ ...editingGoal, title: event.target.value })}
                required
              />
              <label htmlFor="edit-goal-target">Target</label>
              <input
                id="edit-goal-target"
                type="number"
                min="1"
                step="1"
                value={editingGoal.target}
                onChange={event => setEditingGoal({ ...editingGoal, target: event.target.value })}
                required
              />
              <label htmlFor="edit-goal-unit">Counted in</label>
              <select
                id="edit-goal-unit"
                value={editingGoal.unit}
                onChange={event => setEditingGoal({ ...editingGoal, unit: event.target.value })}
              >
                <option value="books">Books</option>
                <option value="pages">Pages</option>
                <option value="days">Days</option>
                <option value="minutes">Minutes</option>
              </select>
              <div className="book-form-actions">
                <button type="button" disabled={saving} onClick={() => setEditingGoal(null)}>
                  Cancel
                </button>
                <button type="submit" disabled={loading || saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {goalToRemove && (
          <div className="book-form-overlay">
            <div className="book-form" role="alertdialog" aria-modal="true" aria-labelledby="delete-goal-title">
              <h2 id="delete-goal-title">Delete Goal?</h2>
              <p>Are you sure you want to delete <strong>{goalToRemove.title}</strong>?</p>
              <p>This will not delete any books from your Library.</p>
              <div className="book-form-actions">
                <button type="button" disabled={saving} onClick={() => setGoalToRemove(null)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="library-confirm-remove"
                  disabled={loading || saving}
                  onClick={confirmRemoveGoal}
                >
                  {saving ? "Deleting..." : "Delete Goal"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>Readscape</h3>
            <p>A quieter place to keep every book, thought, and reading milestone.</p>
          </div>
          <div className="footer-bottom-row">
            <span>© 2026 Readscape</span>
            <Link to="/library">Library</Link>
            <span>Reading data saved to your account</span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Goals;
