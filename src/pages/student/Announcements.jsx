import { Megaphone, CalendarDays } from "lucide-react";

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
    <div className="min-h-full bg-[#F6FAFD] p-4 md:p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-[#0A1931] p-6 shadow-sm md:p-7">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-[#1A3D63] p-3.5">
              <Megaphone className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white">Announcements</h1>

              <p className="mt-1 text-sm text-[#B3CFE5]">
                Stay informed about the latest bootcamp updates.
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[#0A1931]">
            Latest Announcements
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Important updates from the bootcamp administration.
          </p>
        </div>

        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#B3CFE5]/50 transition hover:shadow-md md:p-6"
            >
              <div className="flex gap-4">
                <div className="hidden h-fit rounded-xl bg-[#EAF3F9] p-3 sm:block">
                  <Megaphone className="h-5 w-5 text-[#1A3D63]" />
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0A1931]">
                    {announcement.title}
                  </h3>

                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {announcement.date}
                  </div>

                  <p className="mt-5 leading-7 text-slate-600">
                    {announcement.message}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {announcements.length === 0 && (
            <div className="rounded-3xl border border-dashed border-[#B3CFE5] bg-white p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3F9]">
                <Megaphone className="h-6 w-6 text-[#4A7FA7]" />
              </div>

              <h3 className="font-semibold text-[#0A1931]">
                No announcements yet
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Check back later for new bootcamp updates.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentAnnouncements;
