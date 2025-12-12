import RoutinePlanner from "./components/RoutinePlanner";

const highlightPillars = [
  {
    title: "Move with intention",
    description:
      "Track micro-workouts that wake up dormant muscles without draining your energy."
  },
  {
    title: "Hydrate on rhythm",
    description:
      "Personalise your water goal and receive nudges that match your daily flow."
  },
  {
    title: "Protect screen vision",
    description:
      "Build consistent breaks for your eyes so focus stays razor sharp all day."
  }
];

const essentials = [
  {
    title: "Morning primer",
    actions: [
      "2 minutes of box breathing",
      "Dynamic spine and hip opener",
      "500 ml water with minerals"
    ]
  },
  {
    title: "Midday reset",
    actions: [
      "Desk detox stretch trio",
      "Mindful meal away from screens",
      "Sunlight walk or vitamin D break"
    ]
  },
  {
    title: "Evening wind-down",
    actions: [
      "Blue-light block one hour pre-bed",
      "Guided reflection or journaling",
      "Legs-up-the-wall for calm recovery"
    ]
  }
];

const eyeCare = [
  {
    label: "20-20-20 anchor",
    detail: "Every 20 minutes, look 20 feet away for 20 seconds."
  },
  {
    label: "Refresh ritual",
    detail: "Add artificial tears or blink sequence to combat dryness."
  },
  {
    label: "Ambient light",
    detail: "Match room lighting with screen brightness to avoid strain."
  }
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Builder blueprint</p>
          <h1>Design your hydrated, active, well-rested body</h1>
          <p className="hero-subtitle">
            Balance movement, water intake, and recovery windows with a
            personalised day plan that keeps you primed for deep work, creative
            energy, and sustainable health.
          </p>
          <div className="cta-row">
            <a className="cta primary" href="#routine">
              Build my day
            </a>
            <a className="cta ghost" href="#vision-care">
              Protect my eyes
            </a>
          </div>
        </div>
        <div className="hero-pillars">
          {highlightPillars.map((pillar) => (
            <div className="pillar-card" key={pillar.title}>
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="supporting" id="routine">
        <div className="supporting-header">
          <h2>Three pillars, one flow</h2>
          <p>
            Set the cadence once, then follow through with smart reminders,
            visual streaks, and evidence-backed micro habits.
          </p>
        </div>
        <div className="supporting-grid">
          {essentials.map((block) => (
            <div className="supporting-card" key={block.title}>
              <h3>{block.title}</h3>
              <ul>
                {block.actions.map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <RoutinePlanner />

      <section className="eye-care" id="vision-care">
        <div className="eye-copy">
          <p className="eyebrow">Vision care</p>
          <h2>Protect your eyes while you build big things</h2>
          <p>
            Healthy vision powers deep focus. Layer these small habits with
            screen-aware lighting and ergonomic posture to save your eyes from
            fatigue.
          </p>
        </div>
        <div className="eye-grid">
          {eyeCare.map((tip) => (
            <div className="eye-card" key={tip.label}>
              <h3>{tip.label}</h3>
              <p>{tip.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="closing">
        <h2>Stay on rhythm, stay unstoppable</h2>
        <p>
          Schedule micro breaks, sip with intention, and renew your focus before
          burnout creeps in. Your body will thank you.
        </p>
      </section>
    </main>
  );
}
