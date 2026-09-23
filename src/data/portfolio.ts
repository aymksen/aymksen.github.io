export const profile = {
  name: "Aymen Makhkhas",
  firstName: "Aymen",
  role: "Software Developer",
  headline: "Full-Stack Software Developer",
  location: "Münster, Germany",
  coords: { lat: 51.9607, lon: 7.6261 },
  email: "aymksen@gmail.com",
  links: {
    github: "https://github.com/aymksen",
    linkedin: "https://www.linkedin.com/in/aymksen/",
    resume: "/Resume.pdf",
  },
  summary:
    "I build web apps end to end: React and TypeScript for the interface, Node.js for the API, MySQL or PostgreSQL underneath. At Tailorlux I write the Python and SQL tooling the team relies on. I'm happy to hand the boring parts to an agent in the terminal, and slow to merge anything I haven't read myself. Before all this I studied industrial automation, which is probably why I like things explicit.",
};

export interface Experience {
  role: string;
  company: string;
  kind: string;
  period: string;
  location: string;
  points: string[];
  tags: string[];
}

export const experience: Experience[] = [
  {
    role: "Software Development & Data",
    company: "Tailorlux GmbH",
    kind: "Working Student",
    period: "Oct 2025 — Present",
    location: "Münster, Germany",
    points: [
      "Build and maintain data processing pipelines and internal tooling in Python and PostgreSQL.",
      "Automate data ingestion and improve the performance of in-house software with the engineering team.",
    ],
    tags: ["Python", "PostgreSQL", "Automation"],
  },
  {
    role: "Robotics Floor Monitor",
    company: "Amazon",
    kind: "Part-time · Technical Support",
    period: "Oct 2023 — Sep 2025",
    location: "Witten, Germany",
    points: [
      "Monitored and maintained autonomous robotic systems on a live fulfilment floor.",
      "Troubleshot hardware and software issues with maintenance engineers and ran root-cause analyses.",
    ],
    tags: ["Robotics", "Troubleshooting"],
  },
  {
    role: "Volunteer Programming Teacher & Mentor",
    company: "ReDI School of Digital Integration",
    kind: "Non-profit tech education",
    period: "2023",
    location: "Düsseldorf, Germany",
    points: [
      "Taught web development — HTML, CSS, modern JavaScript and Git — through hands-on projects.",
      "Mentored 15+ international students, with a 90% satisfaction rating.",
    ],
    tags: ["Teaching", "JavaScript", "Git"],
  },
  {
    role: "Automation Engineering Intern",
    company: "OCP Group",
    kind: "Industrial automation",
    period: "Jan 2018 — Jun 2018",
    location: "Jorf Lasfar, Morocco",
    points: ["Programmed, tested and debugged PLC automation logic (Ladder Logic, GRAFCET) for a power plant."],
    tags: ["PLC", "Ladder Logic"],
  },
];

export const skills: { group: string; note: string; items: string[] }[] = [
  {
    group: "Every day",
    note: "Open right now, next to a coding agent or two.",
    items: ["TypeScript", "React", "Node.js", "MySQL", "PostgreSQL", "Python", "Git"],
  },
  {
    group: "When the project needs it",
    note: "Comfortable, not reflexive.",
    items: ["Next.js", "Express", "Tailwind CSS", "Docker", "Jest", "GitHub Actions"],
  },
  {
    group: "Poking at data",
    note: "Before a question turns into a feature.",
    items: ["Pandas", "NumPy", "Firebase", "MongoDB"],
  },
  {
    group: "Maps",
    note: "Thanks to the M.Sc., I now notice when coordinates are in the wrong order.",
    items: ["PostGIS", "Leaflet", "QGIS", "OpenStreetMap"],
  },
  {
    group: "Before software",
    note: "Where I learned that state machines should be boring.",
    items: ["PLC programming", "Ladder Logic", "GRAFCET"],
  },
];

export const education = [
  {
    degree: "M.Sc. Geoinformatics and Spatial Data Science",
    school: "University of Münster",
    period: "Sep 2024 — Present",
    place: "Münster, Germany",
    focus: "Spatial databases, data analysis",
  },
  {
    degree: "B.Sc. Computer Science",
    school: "National Technical University “Kharkiv Polytechnic Institute”",
    period: "2019 — 2023",
    place: "Kharkiv, Ukraine",
    focus: "Web engineering, software architecture, data structures & algorithms, AI",
  },
  {
    degree: "Associate Degree, Industrial Automation and Instrumentation",
    school: "ISTA Al Massira",
    period: "2016 — 2018",
    place: "El Jadida, Morocco",
    focus: "Microcomputer systems, electronics, PLC programming",
  },
];

export const certifications = [
  { name: "Claude 101", issuer: "Anthropic", year: "2026" },
  { name: "CS50x: Introduction to Computer Science", issuer: "Harvard University", year: "2021" },
  { name: "Web Development Best Practices", issuer: "freeCodeCamp", year: "" },
];

export const languages = [
  { name: "Arabic", level: "Native", cefr: "C2", value: 1 },
  { name: "English", level: "Fluent", cefr: "C1", value: 0.85 },
  { name: "French", level: "Fluent", cefr: "C1", value: 0.85 },
  { name: "German", level: "Upper-intermediate", cefr: "B2", value: 0.68 },
  { name: "Russian", level: "Intermediate", cefr: "B1", value: 0.5 },
];

export const interests = ["Table tennis", "Language learning", "Open source", "Chess & strategy games"];
