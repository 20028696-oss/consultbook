export interface StudentSummary {
  student_id: string;
  name: string;
  email: string;
  totalConsultations: number;
  lastConsultation: string; // ISO date
  status: "active" | "inactive";
}

const MOCK_STUDENTS: StudentSummary[] = [
  {
    student_id: "s1",
    name: "Abhideep Lamichhane",
    email: "20028696@students.koi.edu.au",
    totalConsultations: 5,
    lastConsultation: "2026-08-10",
    status: "active",
  },
  {
    student_id: "s2",
    name: "Manpreet Singh",
    email: "20029163@students.koi.edu.au",
    totalConsultations: 3,
    lastConsultation: "2026-08-16",
    status: "active",
  },
  {
    student_id: "s3",
    name: "Jasim Khan",
    email: "20013868@students.koi.edu.au",
    totalConsultations: 2,
    lastConsultation: "2026-08-10",
    status: "active",
  },
  {
    student_id: "s4",
    name: "Patwary Mahbubul Alam",
    email: "20030956@students.koi.edu.au",
    totalConsultations: 1,
    lastConsultation: "2026-08-19",
    status: "active",
  },
  {
    student_id: "s5",
    name: "Aava Oli",
    email: "aavaoli86@gmail.com",
    totalConsultations: 4,
    lastConsultation: "2026-06-02",
    status: "inactive",
  },
];

export async function getStudents(): Promise<StudentSummary[]> {
  return MOCK_STUDENTS;
}
