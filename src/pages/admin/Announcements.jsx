import { useEffect, useState } from "react";
import axios from "axios";
import {
  Megaphone,
  Send,
  Trash2,
  Users,
  CalendarDays,
  Bell,
} from "lucide-react";

function Announcements() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("all");

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/announcements",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setAnnouncements(response.data.announcements);
      } catch (error) {
        console.error("Fetch announcements error:", error);
      }
    }

    loadAnnouncements();
  }, [token]);

  const handlePublish = async (e) => {
    e.preventDefault();

    if (!title || !body) return;

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/announcements",
        { title, body, audience },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const response = await axios.get(
        "http://localhost:5000/api/announcements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAnnouncements(response.data.announcements);

      setTitle("");
      setBody("");
      setAudience("all");
    } catch (error) {
      console.error("Publish announcement error:", error);

      alert(error.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/announcements/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const response = await axios.get(
        "http://localhost:5000/api/announcements",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error("Delete announcement error:", error);
    }
  };

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
                Publish important updates for your bootcamp community.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#B3CFE5]/50 md:p-7">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-[#EAF3F9] p-2.5">
              <Bell className="h-5 w-5 text-[#1A3D63]" />
            </div>

            <div>
              <h2 className="font-semibold text-[#0A1931]">
                Create Announcement
              </h2>

              <p className="text-sm text-slate-500">
                Share an update with your selected audience.
              </p>
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Title <span className="text-red-500">*</span>
              </label>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Bootcamp Orientation"
                className="w-full rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm text-[#0A1931] outline-none transition placeholder:text-slate-400 focus:border-[#4A7FA7] focus:bg-white focus:ring-2 focus:ring-[#B3CFE5]/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#0A1931]">
                Message <span className="text-red-500">*</span>
              </label>

              <textarea
                rows={5}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write your announcement..."
                className="w-full resize-none rounded-xl border border-[#B3CFE5] bg-[#F6FAFD] px-4 py-3 text-sm text-[#0A1931] outline-none transition placeholder:text-slate-400 focus:border-[#4A7FA7] focus:bg-white focus:ring-2 focus:ring-[#B3CFE5]/40"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold text-[#0A1931]">
                Send to
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setAudience("all")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    audience === "all"
                      ? "border-[#1A3D63] bg-[#EAF3F9] ring-2 ring-[#B3CFE5]/50"
                      : "border-[#B3CFE5] bg-white hover:bg-[#F6FAFD]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-xl bg-white p-2.5">
                      <Users className="h-5 w-5 text-[#1A3D63]" />
                    </div>

                    {audience === "all" && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1A3D63]" />
                    )}
                  </div>

                  <p className="font-semibold text-[#0A1931]">Everyone</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Send to all bootcamp members
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setAudience("mentor")}
                  className={`rounded-2xl border p-4 text-left transition ${
                    audience === "mentor"
                      ? "border-[#1A3D63] bg-[#EAF3F9] ring-2 ring-[#B3CFE5]/50"
                      : "border-[#B3CFE5] bg-white hover:bg-[#F6FAFD]"
                  }`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="rounded-xl bg-white p-2.5">
                      <Users className="h-5 w-5 text-[#1A3D63]" />
                    </div>

                    {audience === "mentor" && (
                      <span className="h-2.5 w-2.5 rounded-full bg-[#1A3D63]" />
                    )}
                  </div>

                  <p className="font-semibold text-[#0A1931]">Mentors Only</p>

                  <p className="mt-1 text-xs text-slate-500">
                    Send only to bootcamp mentors
                  </p>
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#0A1931] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#1A3D63] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" />

                {loading ? "Publishing..." : "Publish Announcement"}
              </button>
            </div>
          </form>
        </div>

        <div>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#0A1931]">
                Recent Announcements
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {announcements.length} announcement
                {announcements.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((item) => (
              <div
                key={item._id}
                className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-[#B3CFE5]/50 transition hover:shadow-md md:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="hidden h-fit rounded-xl bg-[#EAF3F9] p-3 sm:block">
                      <Megaphone className="h-5 w-5 text-[#1A3D63]" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-[#0A1931]">
                        {item.title}
                      </h3>

                      <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-[#EAF3F9] px-3 py-1 text-xs font-medium text-[#1A3D63]">
                        <Users className="h-3.5 w-3.5" />

                        {item.audience === "all" ? "Everyone" : "Mentors only"}
                      </span>

                      <p className="mt-4 leading-7 text-slate-600">
                        {item.body}
                      </p>

                      <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarDays className="h-3.5 w-3.5" />

                        {new Date(item.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="shrink-0 rounded-xl p-2.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Delete announcement"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
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
                  Create your first announcement using the form above.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Announcements;
