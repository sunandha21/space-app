import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SpaceExperience from "./scene/SpaceExperience";
import { PHASES } from "./scene/phases";

const phaseOrder = [
  PHASES.INTRO,
  PHASES.NO_MESSAGE,
  PHASES.TRANSITION_DARK,
  PHASES.COUNTDOWN,
  PHASES.LAUNCH,
  PHASES.FLYBY,
  PHASES.EGG_TART_GALAXY,
  PHASES.NO_TARTS,
  PHASES.HOME_REALIZATION,
  PHASES.CHICKENS,
  PHASES.COOKING,
  PHASES.RETURN,
  PHASES.END
];

export default function App() {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [countdown, setCountdown] = useState("LAUNCHING");
  const [phaseStartedAt, setPhaseStartedAt] = useState(Date.now());
  const [darkAmount, setDarkAmount] = useState(0);
  const [timeNow, setTimeNow] = useState(new Date());

  const durations = useMemo(
    () => ({
      [PHASES.TRANSITION_DARK]: 2400,
      [PHASES.COUNTDOWN]: 4000,
      [PHASES.LAUNCH]: 5500,
      [PHASES.FLYBY]: 7000,
      [PHASES.EGG_TART_GALAXY]: 3200,
      [PHASES.NO_TARTS]: 2300,
      [PHASES.HOME_REALIZATION]: 5200,
      [PHASES.CHICKENS]: 3800,
      [PHASES.COOKING]: 4200,
      [PHASES.RETURN]: 5200
    }),
    []
  );

  const startPhase = (next) => {
    setPhase(next);
    setPhaseStartedAt(Date.now());
  };

  const phaseProgress = (() => {
    const d = durations[phase];
    if (!d) return 0;
    return Math.min(1, (Date.now() - phaseStartedAt) / d);
  })();

  useEffect(() => {
    if (phase === PHASES.COUNTDOWN) {
      const schedule = [
        { t: 0, value: "LAUNCHING" },
        { t: 1500, value: "3" },
        { t: 2300, value: "2" },
        { t: 3100, value: "1" }
      ];
      schedule.forEach(({ t, value }) => {
        setTimeout(() => setCountdown(value), t);
      });
    }
  }, [phase]);

  useEffect(() => {
    const autoPhases = [
      PHASES.TRANSITION_DARK,
      PHASES.COUNTDOWN,
      PHASES.LAUNCH,
      PHASES.FLYBY,
      PHASES.EGG_TART_GALAXY,
      PHASES.NO_TARTS,
      PHASES.HOME_REALIZATION,
      PHASES.CHICKENS,
      PHASES.COOKING,
      PHASES.RETURN
    ];

    if (!autoPhases.includes(phase)) return;

    const timer = setTimeout(() => {
      const i = phaseOrder.indexOf(phase);
      const next = phaseOrder[i + 1];
      if (next) {
        if (next === PHASES.HOME_REALIZATION) setTimeNow(new Date());
        startPhase(next);
      }
    }, durations[phase]);

    return () => clearTimeout(timer);
  }, [phase, durations]);

  useEffect(() => {
    let raf;
    const loop = () => {
      if (phase === PHASES.TRANSITION_DARK) {
        setDarkAmount((prev) => Math.min(1, prev + 0.012));
      } else if (phase === PHASES.INTRO || phase === PHASES.NO_MESSAGE) {
        setDarkAmount((prev) => Math.max(0, prev - 0.02));
      } else {
        setDarkAmount((prev) => Math.min(1, prev + 0.02));
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const beginJourney = () => startPhase(PHASES.TRANSITION_DARK);

  return (
    <div className="app-root">
      <SpaceExperience
        phase={phase}
        phaseProgress={phaseProgress}
        darkAmount={darkAmount}
        time={Date.now() / 1000}
      />

      <AnimatePresence mode="wait">
        {(phase === PHASES.INTRO || phase === PHASES.NO_MESSAGE) && (
          <motion.div
            key={phase}
            className="overlay intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h1>Do you wanna go to space?</h1>

            {phase === PHASES.NO_MESSAGE && (
              <motion.p
                className="subline"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Sorry, the chickens already voted ‘yes.’
              </motion.p>
            )}

            <div className="actions">
              {phase === PHASES.INTRO ? (
                <>
                  <button className="btn btn-yes" onClick={beginJourney}>YES</button>
                  <button className="btn btn-no" onClick={() => startPhase(PHASES.NO_MESSAGE)}>NO</button>
                </>
              ) : (
                <button className="btn btn-yes" onClick={beginJourney}>Continue</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASES.COUNTDOWN && (
          <motion.div
            className="overlay center-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.h2
              key={countdown}
              initial={{ opacity: 0, scale: 0.7, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, scale: 1, letterSpacing: "0.06em" }}
              exit={{ opacity: 0, scale: 1.15 }}
              transition={{ duration: 0.4 }}
            >
              {countdown}
            </motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASES.EGG_TART_GALAXY && (
          <motion.div className="overlay narrative top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3>Now taking you to the Egg Tart Galaxy…</h3>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASES.NO_TARTS && (
          <motion.div className="overlay narrative top" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p>Scanning every orbit...</p>
            <p>No egg tarts are found.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASES.HOME_REALIZATION && (
          <motion.div className="overlay narrative right" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p>Gosh… it’s {timeNow.toLocaleTimeString()}.</p>
            <p>You need to feed chickens.</p>
			<p>You need to cook for your family.</p>
			<p>You need to be home.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === PHASES.END && (
          <motion.div className="overlay end" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2>MISSION ABORTED</h2>
            <p>Egg tarts found: 0</p>
            <p>Chickens need to be fed</p>
           
            <p className="final-line">Maybe next time.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}