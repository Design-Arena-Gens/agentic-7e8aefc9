"use client";

import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from "react";

type EventType = "hydration" | "movement" | "eye-rest" | "mindfulness" | "sleep";

type RoutineEvent = {
  type: EventType;
  title: string;
  description: string;
  benefit: string;
};

type TimelineSlot = {
  clock: string;
  events: RoutineEvent[];
};

const DEFAULT_WAKE_TIME = "06:30";
const DEFAULT_BED_TIME = "22:30";

const formatSeconds = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToClock = (minutes: number) => {
  const hrs24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hrs24 >= 12 ? "PM" : "AM";
  const hrs12 = hrs24 % 12 === 0 ? 12 : hrs24 % 12;
  return `${hrs12.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")} ${period}`;
};

const createTimeline = (
  wake: string,
  bed: string,
  hydrationInterval: number,
  eyeInterval: number,
  movementInterval: number,
  focus: "strength" | "mobility" | "relax"
): TimelineSlot[] => {
  const wakeMinutes = toMinutes(wake);
  const bedMinutes = toMinutes(bed);
  const events = new Map<number, RoutineEvent[]>();

  const addEvent = (minuteMark: number, event: RoutineEvent) => {
    if (minuteMark <= wakeMinutes || minuteMark >= bedMinutes) return;
    const bucket = events.get(minuteMark) ?? [];
    bucket.push(event);
    events.set(minuteMark, bucket);
  };

  for (
    let marker = wakeMinutes + hydrationInterval;
    marker < bedMinutes;
    marker += hydrationInterval
  ) {
    addEvent(marker, {
      type: "hydration",
      title: "Hydrate",
      description: "Drink 250 ml of water.",
      benefit: "Supports metabolism and stabilises energy."
    });
  }

  for (
    let marker = wakeMinutes + eyeInterval;
    marker < bedMinutes;
    marker += eyeInterval
  ) {
    addEvent(marker, {
      type: "eye-rest",
      title: "Eye Rest 20-20-20",
      description: "Look 20 feet away for 20 seconds.",
      benefit: "Relieves screen fatigue and dryness."
    });
  }

  const movementLabel =
    focus === "strength"
      ? "Strength burst"
      : focus === "mobility"
        ? "Mobility reset"
        : "Calming stretch";
  const movementDescription =
    focus === "strength"
      ? "Bodyweight squats, plank and lunges."
      : focus === "mobility"
        ? "Neck rolls, thoracic twists, hip openers."
        : "Slow breathing, shoulder rolls and forward fold.";
  const movementBenefit =
    focus === "strength"
      ? "Builds muscle tone and improves posture."
      : focus === "mobility"
        ? "Lubricates joints and keeps you agile."
        : "Lowers stress and eases accumulated tension.";

  for (
    let marker = wakeMinutes + movementInterval;
    marker < bedMinutes;
    marker += movementInterval
  ) {
    addEvent(marker, {
      type: "movement",
      title: movementLabel,
      description: movementDescription,
      benefit: movementBenefit
    });
  }

  addEvent(wakeMinutes + 15, {
    type: "movement",
    title: "Morning activation",
    description: "5 minute spinal mobility and breathing.",
    benefit: "Wakes up the body gently."
  });

  addEvent(bedMinutes - 30, {
    type: "mindfulness",
    title: "Evening wind-down",
    description: "Low light, guided breathing or gratitude journal.",
    benefit: "Prepares mind and body for deeper sleep."
  });

  addEvent(bedMinutes - 15, {
    type: "sleep",
    title: "Digital sunset",
    description: "Disconnect from screens and dim the lights.",
    benefit: "Supports melatonin production."
  });

  return Array.from(events.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([minutes, slotEvents]) => ({
      clock: minutesToClock(minutes),
      events: slotEvents
    }));
};

const targetForFocus: Record<"strength" | "mobility" | "relax", string> = {
  strength: "Keep your muscles active through short, high-quality bursts.",
  mobility: "Prioritise joint freedom with frequent gentle movement.",
  relax: "Balance intensity with calming reset breaks."
};

export default function RoutinePlanner() {
  const [wakeTime, setWakeTime] = useState(DEFAULT_WAKE_TIME);
  const [bedTime, setBedTime] = useState(DEFAULT_BED_TIME);
  const [hydrationInterval, setHydrationInterval] = useState(60);
  const [eyeInterval, setEyeInterval] = useState(20);
  const [movementInterval, setMovementInterval] = useState(90);
  const [focus, setFocus] = useState<"strength" | "mobility" | "relax">(
    "mobility"
  );

  const [hydrationCountdown, setHydrationCountdown] = useState(
    hydrationInterval * 60
  );
  const [eyeCountdown, setEyeCountdown] = useState(eyeInterval * 60);
  const [waterGoal, setWaterGoal] = useState(2500);
  const [waterLogged, setWaterLogged] = useState(0);

  useEffect(() => {
    setWaterLogged((previous) => Math.min(previous, waterGoal));
  }, [waterGoal]);

  useEffect(() => {
    setHydrationCountdown(hydrationInterval * 60);
  }, [hydrationInterval]);

  useEffect(() => {
    setEyeCountdown(eyeInterval * 60);
  }, [eyeInterval]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHydrationCountdown((previous) =>
        previous <= 1 ? hydrationInterval * 60 : previous - 1
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [hydrationInterval]);

  useEffect(() => {
    const interval = setInterval(() => {
      setEyeCountdown((previous) =>
        previous <= 1 ? eyeInterval * 60 : previous - 1
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [eyeInterval]);

  const timeline = useMemo(
    () =>
      createTimeline(
        wakeTime,
        bedTime,
        hydrationInterval,
        eyeInterval,
        movementInterval,
        focus
      ),
    [wakeTime, bedTime, hydrationInterval, eyeInterval, movementInterval, focus]
  );

  const hydrationProgress = Math.min(
    100,
    Math.round((waterLogged / waterGoal) * 100)
  );

  const nextHydrationClock = useMemo(() => {
    const now = new Date();
    const timestamp = new Date(
      now.getTime() + hydrationCountdown * 1000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    return timestamp;
  }, [hydrationCountdown]);

  const nextEyeClock = useMemo(() => {
    const now = new Date();
    const timestamp = new Date(
      now.getTime() + eyeCountdown * 1000
    ).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
    return timestamp;
  }, [eyeCountdown]);

  const handleGoalChange = (event: ChangeEvent<HTMLInputElement>) => {
    setWaterGoal(Number(event.target.value));
  };

  const resetHydration = useCallback(() => {
    setHydrationCountdown(hydrationInterval * 60);
  }, [hydrationInterval]);

  const resetEye = useCallback(() => {
    setEyeCountdown(eyeInterval * 60);
  }, [eyeInterval]);

  const handleWaterLog = (amount: number) => {
    setWaterLogged((previous) => Math.min(previous + amount, waterGoal));
  };

  const resetWaterLog = () => {
    setWaterLogged(0);
  };

  const handlePresetChange = (event: FormEvent<HTMLButtonElement>) => {
    const preset = event.currentTarget.dataset.preset;
    if (preset === "desk") {
      setFocus("mobility");
      setMovementInterval(60);
      setEyeInterval(20);
      setHydrationInterval(50);
    } else if (preset === "active") {
      setFocus("strength");
      setMovementInterval(75);
      setEyeInterval(25);
      setHydrationInterval(45);
    } else if (preset === "calm") {
      setFocus("relax");
      setMovementInterval(105);
      setEyeInterval(18);
      setHydrationInterval(60);
    }
  };

  return (
    <section className="section">
      <header className="section-header">
        <div>
          <p className="eyebrow">Body Rhythm Builder</p>
          <h2>Shape a resilient daily flow</h2>
          <p className="section-subtitle">
            Tune your movement, hydration, and recovery windows so you stay
            energised from wake to wind-down.
          </p>
        </div>
        <div className="preset-actions">
          <button data-preset="desk" onClick={handlePresetChange}>
            Desk worker
          </button>
          <button data-preset="active" onClick={handlePresetChange}>
            Active creator
          </button>
          <button data-preset="calm" onClick={handlePresetChange}>
            Calm recovery
          </button>
        </div>
      </header>

      <div className="planner-grid">
        <div className="card emphasis">
          <h3>Personalise your cadence</h3>
          <p className="card-subtitle">
            Small tweaks change how sustainably you perform.
          </p>

          <div className="planner-form">
            <div className="form-row">
              <label htmlFor="wake">Wake time</label>
              <input
                id="wake"
                type="time"
                value={wakeTime}
                onChange={(event) => setWakeTime(event.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="bed">Bed time</label>
              <input
                id="bed"
                type="time"
                value={bedTime}
                onChange={(event) => setBedTime(event.target.value)}
              />
            </div>
            <div className="form-row">
              <label htmlFor="water">Water goal (ml)</label>
              <input
                id="water"
                type="number"
                min={1500}
                max={5000}
                step={100}
                value={waterGoal}
                onChange={handleGoalChange}
              />
            </div>
            <div className="form-row">
              <label htmlFor="hydration">Hydration reminder (minutes)</label>
              <input
                id="hydration"
                type="number"
                min={30}
                max={120}
                step={5}
                value={hydrationInterval}
                onChange={(event) => setHydrationInterval(Number(event.target.value))}
              />
            </div>
            <div className="form-row">
              <label htmlFor="movement">Movement break (minutes)</label>
              <input
                id="movement"
                type="number"
                min={45}
                max={150}
                step={5}
                value={movementInterval}
                onChange={(event) =>
                  setMovementInterval(Number(event.target.value))
                }
              />
            </div>
            <div className="form-row">
              <label htmlFor="eye">Eye rest (minutes)</label>
              <input
                id="eye"
                type="number"
                min={15}
                max={40}
                step={1}
                value={eyeInterval}
                onChange={(event) => setEyeInterval(Number(event.target.value))}
              />
            </div>
            <div className="form-row">
              <label>Daily focus</label>
              <div className="focus-options">
                <label>
                  <input
                    type="radio"
                    name="focus"
                    value="mobility"
                    checked={focus === "mobility"}
                    onChange={() => setFocus("mobility")}
                  />
                  Mobility
                </label>
                <label>
                  <input
                    type="radio"
                    name="focus"
                    value="strength"
                    checked={focus === "strength"}
                    onChange={() => setFocus("strength")}
                  />
                  Strength
                </label>
                <label>
                  <input
                    type="radio"
                    name="focus"
                    value="relax"
                    checked={focus === "relax"}
                    onChange={() => setFocus("relax")}
                  />
                  Relaxation
                </label>
              </div>
            </div>
          </div>
          <p className="focus-note">{targetForFocus[focus]}</p>
        </div>

        <div className="card-stack">
          <div className="card">
            <h3>Hydration cadence</h3>
            <p className="metric-highlight">
              Next reminder <strong>{nextHydrationClock}</strong>
            </p>
            <p className="countdown">{formatSeconds(hydrationCountdown)}</p>
            <div className="card-actions">
              <button onClick={() => handleWaterLog(250)}>Log 250 ml</button>
              <button onClick={() => handleWaterLog(500)}>Log 500 ml</button>
              <button className="ghost" onClick={resetHydration}>
                Skip / Reset
              </button>
            </div>

            <div className="progress-wrapper">
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${hydrationProgress}%` }}
                />
              </div>
              <div className="progress-meta">
                <span>{waterLogged} ml</span>
                <span>Goal {waterGoal} ml</span>
              </div>
            </div>
            <button className="ghost" onClick={resetWaterLog}>
              Reset water log
            </button>
          </div>

          <div className="card">
            <h3>Eye relief cadence</h3>
            <p className="metric-highlight">
              Next reset <strong>{nextEyeClock}</strong>
            </p>
            <p className="countdown eye">{formatSeconds(eyeCountdown)}</p>
            <div className="card-actions">
              <button onClick={resetEye}>Completed early</button>
              <button
                className="ghost"
                onClick={() => setEyeCountdown((value) => value + 60)}
              >
                Add 1 minute
              </button>
            </div>
            <ul className="reminder-list">
              <li>Blink 10 times deliberately.</li>
              <li>Trace a box with your eyes to stretch muscles.</li>
              <li>Massage temples for 20 seconds.</li>
            </ul>
          </div>

          <div className="card">
            <h3>Movement streak</h3>
            <p className="metric-highlight">
              Every <strong>{movementInterval} minutes</strong>
            </p>
            <ul className="routine-list">
              <li>3×8 bodyweight squats</li>
              <li>Plank with slow breaths · 40 seconds</li>
              <li>Thoracic rotation · 8 each side</li>
            </ul>
            <p className="fine-print">
              The streak adjusts with your daily focus to keep recovery and
              intensity balanced.
            </p>
          </div>
        </div>
      </div>

      <div className="timeline-card">
        <div className="timeline-header">
          <h3>Your guided day</h3>
          <p>
            Starting {minutesToClock(toMinutes(wakeTime))} · Wind-down by{" "}
            {minutesToClock(toMinutes(bedTime))}
          </p>
        </div>
        <div className="timeline-grid">
          {timeline.map((slot) => (
            <div className="timeline-row" key={slot.clock}>
              <div className="timeline-time">{slot.clock}</div>
              <div className="timeline-events">
                {slot.events.map((event, index) => (
                  <div
                    className={`timeline-event ${event.type}`}
                    key={`${event.type}-${index}`}
                  >
                    <h4>{event.title}</h4>
                    <p>{event.description}</p>
                    <span>{event.benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
