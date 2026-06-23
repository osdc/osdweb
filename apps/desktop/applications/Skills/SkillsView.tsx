import { WindowProps } from "@/components/WindowManagement/WindowCompositor";
import styles from "./SkillsView.module.css";

type StackSection = {
  title: string;
  entries: string[];
};

function getSections(): StackSection[] {
  return [
    {
      title: "What we do",
      entries: [
        "Open-source projects",
        "Hackathons, workshops, CTFs, jams, and build nights",
        "Documentation, design, ops, and the stuff around shipping",
      ],
    },
    {
      title: "How people get in",
      entries: [
        "We learn by building, not by waiting until we feel ready",
        "We try to get newer people into real work quickly",
        "We leave behind docs, patterns, and systems future batches can reuse",
      ],
    },
    {
      title: "What we protect",
      entries: [
        "Not a passive attendance society",
        "Not beginner-hostile",
        "Not interested in looking polished at the cost of personality",
      ],
    },
    {
      title: "Culturally important nonsense",
      entries: [
        "We like retro software, terminal windows, arcade energy, and internet-era weirdness",
        "We also like substance, which is why the jokes are sitting next to actual club information",
        "Yes the Doom icon stays",
      ],
    },
  ];
}

export default function SkillsView(_props: WindowProps) {
  const sections = getSections();

  return (
    <div className="content-outer">
      <div className="content">
        <div className="content-inner">
          <div className={styles["skills-content"]}>
            <h1>How we run OSDC</h1>
            <p>We are not here to cosplay a corporate chapter. We run on builders, reviewers, poster goblins, ops people, mentors, and whoever decided 2 a.m. was a perfectly valid time to fix the website.</p>

            {sections.map((section) => (
              <section key={section.title}>
                <h2>{section.title}</h2>
                <ul>
                  {section.entries.map((entry) => (
                    <li key={entry}>{entry}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
