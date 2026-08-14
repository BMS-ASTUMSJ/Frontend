import { useState } from "react";
import { Megaphone, Plus, X } from "lucide-react";

function Announcements() {
  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState("all");

  const [announcements, setAnnouncements] = useState([]);

  const handlePublish = (e) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert("Please fill in the title and message.");
      return;
    }

    const newAnnouncement = {
      id: Date.now(),
      title,
      message,
      audience,
      date: new Date().toLocaleDateString(),
    };

    setAnnouncements((prev) => [newAnnouncement, ...prev]);

    setTitle("");
    setMessage("");
    setAudience("all");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#EBE5DA] p-3">
              <Megaphone className="h-6 w-6 text-[#2B362E]" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-[#2B362E]">
                Announcements
              </h2>

              <p className="mt-1 text-slate-500">
                Share important updates with bootcamp members.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-[#2B362E] px-5 py-3 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063]"
        >
          <Plus className="h-5 w-5" />
          New Announcement
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#2B362E]">
              Create Announcement
            </h3>

            <button
              onClick={() => setShowForm(false)}
              className="rounded-full p-2 hover:bg-[#F5F0E8]"
            >
              <X className="h-5 w-5 text-slate-600" />
            </button>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#2B362E]">
                Announcement Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2B362E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#2B362E]">
                Message
              </label>

              <textarea
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your announcement..."
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#2B362E]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-[#2B362E]">
                Audience
              </label>

              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2B362E]"
              >
                <option value="all">Everyone</option>

                <option value="mentors">Mentors Only</option>
              </select>

              <p className="mt-2 text-xs text-slate-500">
                Students cannot be selected as a separate audience.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-[#2B362E] px-5 py-3 text-sm font-semibold text-[#F5F0E8] hover:bg-[#6B8063]"
              >
                Publish Announcement
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="rounded-3xl bg-white p-12 text-center shadow-sm">
            <Megaphone className="mx-auto h-10 w-10 text-slate-300" />

            <h3 className="mt-4 text-lg font-semibold text-[#2B362E]">
              No announcements yet
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Create your first announcement to share an update.
            </p>
          </div>
        ) : (
          announcements.map((announcement) => (
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
                  {announcement.audience === "all" ? "Everyone" : "Mentors"}
                </span>
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-600">
                {announcement.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Announcements;
