import { useEffect, useState } from "react";
import axios from "axios";
import { Megaphone, Send, Trash2 } from "lucide-react";

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
    <div className="p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-[#EBE5DA] p-3">
          <Megaphone className="h-6 w-6 text-[#2B362E]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-[#2B362E]">Announcements</h1>

          <p className="text-sm text-slate-500">
            Publish announcements for everyone or mentors only.
          </p>
        </div>
      </div>

      <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5">
        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B362E]">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Bootcamp Orientation"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2B362E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B362E]">
              Message
            </label>

            <textarea
              rows={4}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement..."
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2B362E]"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[#2B362E]">
              Send to
            </label>

            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#2B362E]"
            >
              <option value="all">Everyone</option>
              <option value="mentor">Mentors only</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[#2B362E] px-5 py-3 text-sm font-semibold text-[#F5F0E8] transition hover:bg-[#6B8063] disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {loading ? "Publishing..." : "Publish Announcement"}
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item._id}
            className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-[#2B362E]/5"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2B362E]">
                  {item.title}
                </h3>

                <span className="mt-2 inline-block rounded-full bg-[#EBE5DA] px-3 py-1 text-xs font-medium text-[#2B362E]">
                  {item.audience === "all" ? "Everyone" : "Mentors only"}
                </span>
              </div>

              <button
                onClick={() => handleDelete(item._id)}
                className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <p className="leading-7 text-slate-600">{item.body}</p>

            <p className="mt-4 text-xs text-slate-400">
              {new Date(item.createdAt).toLocaleString()}
            </p>
          </div>
        ))}

        {announcements.length === 0 && (
          <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-[#2B362E]/5">
            No announcements yet.
          </div>
        )}
      </div>
    </div>
  );
}

export default Announcements;
