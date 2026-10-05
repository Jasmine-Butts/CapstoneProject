import { useState } from "react";
import { Link } from "react-router-dom";

import {
  initialGoals,
  emptyGoal,
  calculatePercentage,
  getMainGoal,
  getCompletedGoals,
  getRemainingAmount,
  createGoal,
} from "../data/goalsData";

function Goals() {
  const [goals, setGoals] =
    useState(initialGoals);

  const [newGoal, setNewGoal] =
    useState(emptyGoal);

  const mainGoal =
    getMainGoal(goals);

  const mainPercentage =
    calculatePercentage(
      mainGoal.current,
      mainGoal.target
    );

  const completedGoals =
    getCompletedGoals(goals);

  const remaining =
    getRemainingAmount(mainGoal);

  function handleInputChange(event) {
    const { name, value } =
      event.target;

    setNewGoal((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleAddGoal(event) {
    event.preventDefault();

    const goal =
      createGoal(newGoal);

    if (!goal) {
      return;
    }

    setGoals((previousGoals) => [
      ...previousGoals,
      goal,
    ]);

    setNewGoal(emptyGoal);
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

          <h1>
            Goals.
          </h1>

          <p className="goals-intro">
            Keep a few reading goals in view.
            Nudge them forward as you go, and
            add new ones whenever you like.
          </p>
        </section>

        {/* MAIN GOAL */}

        <section className="main-goal-section">
          <div className="main-goal-percentage">
            <strong>
              {mainPercentage}%
            </strong>

            <span>
              Main goal
            </span>
          </div>

          <div className="main-goal-copy">
            <h2>
              {mainGoal.title}
            </h2>

            <p>
              {mainGoal.current} of{" "}
              {mainGoal.target}{" "}
              {mainGoal.unit}
              {" — "}
              {remaining} to go.{" "}
              {completedGoals} of{" "}
              {goals.length} goals complete.
            </p>
          </div>
        </section>

        {/* GOALS LIST */}

        <section className="goals-list">
          {goals.map((goal) => {
            const percentage =
              calculatePercentage(
                goal.current,
                goal.target
              );

            return (
              <article
                className="goal-row"
                key={goal.id}
              >
                <div className="goal-row-top">
                  <h3>
                    {goal.title}
                  </h3>

                  <span>
                    {percentage}%
                  </span>
                </div>

                <div className="goal-progress-track">
                  <div
                    className="goal-progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>
                </div>

                <p>
                  {goal.current.toLocaleString()}
                  {" / "}
                  {goal.target.toLocaleString()}
                  {" "}
                  {goal.unit}
                  {" · "}
                  {percentage}%
                </p>
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

            <h2>
              Add another goal
            </h2>
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
                placeholder="5"
                value={newGoal.target}
                onChange={handleInputChange}
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
                <option value="books">
                  Books
                </option>

                <option value="pages">
                  Pages
                </option>

                <option value="days">
                  Days
                </option>

                <option value="minutes">
                  Minutes
                </option>
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
      </main>

      {/* FOOTER */}

      <footer className="dashboard-footer">
        <div className="footer-inner">
          <div>
            <h3>
              Readscape
            </h3>

            <p>
              A quieter place to keep every
              book, thought, and reading
              milestone.
            </p>
          </div>

          <div className="footer-bottom-row">
            <span>
              © 2026 Readscape
            </span>

            <Link to="/library">
              Library
            </Link>

            <span>
              All reading data saved
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Goals;