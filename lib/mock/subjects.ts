export interface Subject {
  subject_id: string;
  name: string;
  code: string;
  activeStudents: number;
  description: string;
}

const MOCK_SUBJECTS: Subject[] = [
  {
    subject_id: "sub1",
    name: "Database Systems",
    code: "ICT301",
    activeStudents: 12,
    description: "ERD design, normalization, SQL, and relational database implementation.",
  },
  {
    subject_id: "sub2",
    name: "Information Technology Project 2",
    code: "ICT302",
    activeStudents: 8,
    description: "Capstone build phase — architecture, deployment, and testing consultations.",
  },
  {
    subject_id: "sub3",
    name: "Web Application Development",
    code: "ICT275",
    activeStudents: 15,
    description: "Frontend frameworks, API design, and full-stack integration.",
  },
];

export async function getSubjects(): Promise<Subject[]> {
  return MOCK_SUBJECTS;
}
