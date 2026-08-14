import { Megaphone } from "lucide-react";

function MentorAnnouncements() {
  const announcements = [
    {
      id: 1,
      title: "Bootcamp Schedule Update",
      message:
        "The upcoming bootcamp session will begin at 9:00 AM. Please make sure all students are informed.",
      audience: "Everyone",
      date: "August 14, 2026",
    },
    {
      id: 2,
      title: "Mentor Meeting",
      message:
        "All mentors are requested to attend the mentor meeting tomorrow at 2:00 PM.",
      audience: "Mentors",
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
              Important updates from the administration.
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
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2B362E]">
                  {announcement.title}
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {announcement.date}
                </p>
              </div>

              <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#2B362E]">
                {announcement.audience}
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              {announcement.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MentorAnnouncements;
