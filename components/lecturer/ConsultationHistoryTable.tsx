type HistoryItem = {
  id: number;
  student_name: string;
  lecturer_name: string;
  subject: string | null;
  booking_date: string;
  booking_time: string;
};

export default function ConsultationHistoryTable({
  consultations,
}: {
  consultations: HistoryItem[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="grid grid-cols-5 bg-[#0D193C] px-5 py-4 text-xs font-bold text-white">
        <span>STUDENT</span>
        <span>SUBJECT</span>
        <span>DATE</span>
        <span>TIME</span>
        <span>LECTURER</span>
      </div>

      {consultations.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-5 border-t px-5 py-4 text-sm"
        >
          <span>{item.student_name}</span>

          <span>
            {item.subject || "Consultation"}
          </span>

          <span>{item.booking_date}</span>

          <span>{item.booking_time}</span>

          <span>{item.lecturer_name}</span>
        </div>
      ))}
    </div>
  );
}