import { useState } from "react";
import { Plus, Megaphone, Trash2, Pencil, X } from "lucide-react";

function Announcements() {
  const [showForm, setShowForm] = useState(false);

  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      title: "Project Demo Day",
      message: "Project demonstrations will be held this Friday at 2:00 PM.",
      audience: "All",
      date: "Aug 14, 2026",
    },
    {
      id: 2,
      title: "Mentor Coordination Meeting",
      message:
        "All mentors are requested to attend the coordination meeting tomorrow at 10:00 AM.",
      audience: "Mentors",
      date: "Aug 14, 2026",
    },
    {
      id: 3,
      title: "Assignment Reminder",
      message:
        "Students are reminded to submit their assignments before the deadline.",
      audience: "Students",
      date: "Aug 14, 2026",
    },
  ]);

  const [form, setForm] = useState({
    title: "",
    message: "",
    audience: "All",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title: form.title,
      message: form.message,
      audience: form.audience,
      date: "Aug 14, 2026",
    };

    setAnnouncements([newAnnouncement, ...announcements]);

    setForm({
      title: "",
      message: "",
      audience: "All",
    });

    setShowForm(false);
  };

  const handleDelete = (id) => {
    setAnnouncements(
      announcements.filter((announcement) => announcement.id !== id),
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8]">
      <div className="flex items-center justify-between border-b border-[#2B362E]/10 bg-white px-6 py-5">
        <div>
          <h1 className="text-2xl font-bold text-[#2B362E]">Announcements</h1>

          <p className="mt-1 text-sm text-slate-500">
            Create and manage bootcamp announcements.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2B362E] px-4 py-2.5 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063]"
        >
          <Plus className="h-4 w-4" />
          Create Announcement
        </button>
      </div>

      <main className="mx-auto max-w-5xl p-6">
        {showForm && (
          <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2B362E]">
                  Create Announcement
                </h2>

                <p className="text-sm text-slate-500">
                  Send an announcement to bootcamp members.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-full p-2 hover:bg-[#F5F0E8]"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2B362E]">
                  Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Announcement title"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2B362E]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2B362E]">
                  Message
                </label>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write your announcement..."
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2B362E]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2B362E]">
                  Audience
                </label>

                <select
                  name="audience"
                  value={form.audience}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-[#2B362E]"
                >
                  <option value="All">All</option>
                  <option value="Mentors">Mentors</option>
                  <option value="Students">Students</option>
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#2B362E] px-5 py-2.5 text-sm font-semibold text-[#F5F0E8] hover:bg-[#6B8063]"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        )}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="rounded-3xl bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBE5DA]">
                    <Megaphone className="h-5 w-5 text-[#2B362E]" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-[#2B362E]">
                        {announcement.title}
                      </h3>

                      <span className="rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#6B8063]">
                        {announcement.audience}
                      </span>
                    </div>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {announcement.message}
                    </p>

                    <p className="mt-3 text-xs text-slate-400">
                      Posted {announcement.date}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="rounded-xl p-2 text-slate-500 hover:bg-[#F5F0E8] hover:text-[#2B362E]">
                    <Pencil className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="rounded-xl p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Announcements;
