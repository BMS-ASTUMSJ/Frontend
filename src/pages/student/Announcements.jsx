import { Megaphone } from "lucide-react";

function StudentAnnouncements() {
  const announcements = [
    {
      id: 1,
      title: "Bootcamp Schedule Update",
      message:
        "The upcoming bootcamp session will begin at 9:00 AM. Please make sure you attend on time.",
      date: "August 14, 2026",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#EBE5DA] p-3">
            <Megaphone className="h-6 w-6 text-[#2B362E]" />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-[#2B362E]">Announcements</h2>

            <p className="mt-1 text-slate-500">
              Important updates from the bootcamp administration.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5"
          >
            <h3 className="text-lg font-semibold text-[#2B362E]">
              {announcement.title}
            </h3>

            <p className="mt-1 text-xs text-slate-400">{announcement.date}</p>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {announcement.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StudentAnnouncements;
