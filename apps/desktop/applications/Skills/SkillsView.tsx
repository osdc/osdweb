import { WindowProps } from "@/components/WindowManagement/WindowCompositor";
import styles from "./SkillsView.module.css";
import { useTranslation } from "react-i18next";

type StackSection = {
  title: string;
  entries: string[];
};

function getSections(language: string): StackSection[] {
  if (language === "nl") {
    return [
      {
        title: "Club loops",
        entries: [
          "Build nights en open sprints",
          "Poster-first event launches",
          "Mentorship en review loops",
        ],
      },
      {
        title: "Public shell",
        entries: [
          "CRT monitor desktop",
          "Live globe widget",
          "Events, members en archive windows",
        ],
      },
      {
        title: "Workroom tools",
        entries: [
          "Finder voor docs en assets",
          "Notes voor club notities",
          "Terminal, Algorithms en Doom",
        ],
      },
      {
        title: "Delivery",
        entries: [
          "Discord als coördinatie-laag",
          "Registratie- en posterlinks",
          "Archive notes voor volgende seizoenen",
        ],
      },
    ];
  }

  return [
    {
      title: "Club Loops",
      entries: [
        "Build nights and open sprints",
        "Poster-first event launches",
        "Mentorship and review loops",
      ],
    },
    {
      title: "Public Shell",
      entries: [
        "CRT monitor desktop",
        "Live globe widget",
        "Events, members, and archive windows",
      ],
    },
    {
      title: "Workroom Tools",
      entries: [
        "Finder for docs and assets",
        "Notes for club planning",
        "Terminal, Algorithms, and Doom",
      ],
    },
    {
      title: "Delivery",
      entries: [
        "Discord as the coordination layer",
        "Registration links and poster drops",
        "Archive notes for future seasons",
      ],
    },
  ];
}

export default function SkillsView(_props: WindowProps) {
  const { i18n } = useTranslation("common");
  const sections = getSections(i18n.language);

  return (
    <div className="content-outer">
      <div className="content">
        <div className="content-inner">
          <div className={styles["skills-content"]}>
            <h1>{i18n.language === "nl" ? "Club stack" : "Club stack"}</h1>
            <p>
              {i18n.language === "nl"
                ? "Deze view vat samen waar de desktoplaag nu voor is: publieke clubverhalen vooraan, utility-tools in de workroom, en genoeg structuur om seizoenen te laten evolueren."
                : "This view summarizes what the desktop layer is for now: public club storytelling up front, utility tools in the workroom, and enough structure to let each season evolve."}
            </p>

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
