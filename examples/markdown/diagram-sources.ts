// Every diagram type a `mermaid` fence may be, each a small diagram of its kind
// (markdown/diagram-types, scripts/diagram-draw.test.ts).
export const types: [string, string][] = [
  [
    "Flowchart",
    "flowchart LR\n  A[Request] --> B{Signed in?}\n  B -- Yes --> C[Show the answer]\n  B -- No --> D[Ask to sign in]\n  D --> B",
  ],
  [
    "Sequence diagram",
    "sequenceDiagram\n  participant P as Person\n  participant A as Agent\n  P->>A: Summarise the report\n  A-->>P: Here is the summary\n  Note over P,A: One turn",
  ],
  [
    "Class diagram",
    "classDiagram\n  class Report {\n    +String title\n    +publish()\n  }\n  class Summary {\n    +String text\n  }\n  Report <|-- Summary",
  ],
  [
    "State diagram",
    "stateDiagram-v2\n  [*] --> Draft\n  Draft --> Review\n  Review --> Draft: changes asked\n  Review --> Published\n  Published --> [*]",
  ],
  [
    "Entity relationship diagram",
    "erDiagram\n  PERSON ||--o{ CHAT : starts\n  CHAT ||--|{ MESSAGE : holds",
  ],
  [
    "Gantt chart",
    "gantt\n  dateFormat YYYY-MM-DD\n  title Launch\n  section Build\n  Design :a1, 2026-01-05, 5d\n  Build :a2, after a1, 8d\n  section Ship\n  Review :crit, after a2, 3d",
  ],
  [
    "Pie chart",
    'pie title Time spent\n  "Reading" : 45\n  "Writing" : 35\n  "Meetings" : 20',
  ],
  [
    "User journey",
    "journey\n  title Asking a question\n  section Ask\n    Type the question: 4: Person\n    Wait for the answer: 3: Person\n  section Read\n    Read the answer: 5: Person",
  ],
  [
    "Git graph",
    "gitGraph\n  commit\n  branch feature\n  commit\n  commit\n  checkout main\n  merge feature\n  commit",
  ],
  [
    "Mindmap",
    "mindmap\n  root((Launch))\n    People\n      Design\n      Engineering\n    Plan\n      Dates\n      Risks",
  ],
  [
    "Timeline",
    "timeline\n  title The year\n  Q1 : Plan\n  Q2 : Build : Test\n  Q3 : Launch\n  Q4 : Grow",
  ],
  [
    "Quadrant chart",
    "quadrantChart\n  title Effort and value\n  x-axis Low effort --> High effort\n  y-axis Low value --> High value\n  quadrant-1 Plan\n  quadrant-2 Do first\n  quadrant-3 Skip\n  quadrant-4 Later\n  Search: [0.3, 0.8]\n  Export: [0.7, 0.4]",
  ],
  [
    "Requirement diagram",
    "requirementDiagram\n  requirement fast {\n    id: 1\n    text: answers in a second\n    risk: medium\n    verifymethod: test\n  }\n  element cache {\n    type: service\n  }\n  cache - satisfies -> fast",
  ],
  [
    "C4 diagram",
    'C4Context\n  Person(person, "Person")\n  System(app, "Workspace")\n  Rel(person, app, "Asks")',
  ],
  [
    "Sankey diagram",
    "sankey-beta\nVisits,Sign-ups,40\nVisits,Left,60\nSign-ups,Paid,15",
  ],
  [
    "XY chart",
    'xychart-beta\n  title "Answers a day"\n  x-axis [Mon, Tue, Wed, Thu, Fri]\n  y-axis "Answers" 0 --> 100\n  bar [40, 62, 55, 80, 71]\n  line [40, 62, 55, 80, 71]',
  ],
  [
    "Block diagram",
    "block-beta\n  columns 3\n  Input space Output\n  Input --> Output",
  ],
  [
    "Packet diagram",
    'packet-beta\n  0-15: "Source port"\n  16-31: "Destination port"\n  32-63: "Sequence number"',
  ],
  [
    "Kanban",
    "kanban\n  todo[To do]\n    t1[Write the brief]\n  doing[Doing]\n    t2[Review the draft]\n  done[Done]\n    t3[Plan the week]",
  ],
  [
    "Architecture diagram",
    "architecture-beta\n  group api(cloud)[API]\n  service db(database)[Database] in api\n  service server(server)[Server] in api\n  db:L -- R:server",
  ],
  [
    "Radar chart",
    "radar-beta\n  axis Speed, Quality, Cost, Reach\n  curve now{4, 3, 2, 3}\n  curve goal{5, 4, 3, 4}",
  ],
  [
    "Treemap",
    'treemap-beta\n"Work"\n  "Writing": 30\n  "Reading": 20\n  "Meetings": 10',
  ],
  ["Info", "info"],
  [
    "Agent flow",
    'agentflow-beta TB\n  flow reviewer["Review agent"]\n    changes["Gather changes"]@{ shape: input }\n    check["Check the diff"]@{ shape: task }\n    ok["Clean?"]@{ shape: decision }\n    changes --> check --> ok\n  end',
  ],
  [
    "Use case diagram",
    'usecase-beta\ndirection LR\nactor Person("Person")\nsystemBoundary "Workspace"\n  Ask("Ask a question")\nend\nPerson --> Ask',
  ],
  ["Railroad diagram", 'railroad-ebnf-beta\ndigit = "0" | "1" | "2" ;'],
  [
    "Tree view",
    "treeView-beta\n├── src/\n│   ├── index.ts\n│   └── utils.ts\n└── README.md",
  ],
  [
    "Venn diagram",
    'venn-beta\n  set Useful\n  set Simple\n  union Useful,Simple["Good"]',
  ],
  [
    "Cynefin",
    'cynefin-beta\n  complex\n    "Try a small change"\n  complicated\n    "Ask an expert"\n  clear\n    "Follow the steps"\n  chaotic\n    "Act now"',
  ],
  [
    "Wardley map",
    "wardley-beta\ntitle Answers\nanchor Person [0.95, 0.6]\ncomponent Answer [0.8, 0.55]\ncomponent Model [0.5, 0.8]\nPerson -> Answer\nAnswer -> Model",
  ],
  [
    "Swimlane diagram",
    "swimlane-beta LR\n  subgraph Person\n    Ask[Ask]\n  end\n  subgraph Agent\n    Answer[Answer]\n  end\n  Ask --> Answer",
  ],
  [
    "Ishikawa diagram",
    "ishikawa-beta\n  Slow answer\n  Model\n    Large prompt\n  Network\n    Busy server",
  ],
  [
    "Event modeling",
    "eventmodeling\n\ntf 01 ui AskForm\ntf 02 cmd AskQuestion\ntf 03 evt QuestionAsked",
  ],
];
