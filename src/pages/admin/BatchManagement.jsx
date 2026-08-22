import { useState, useEffect } from "react";
import api from "../../utils/api";
import {
  ClipboardList,
  Plus,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

function BatchManagement() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionId, setActionId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    description: "",
    status: "upcoming",
  });

  /* =========================================================
     FETCH BATCHES
  ========================================================= */

  const fetchBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/batches");

      setBatches(response.data?.batches || []);
    } catch (err) {
      console.error("Fetch batches error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to fetch batches from the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  /* =========================================================
     CREATE BATCH
  ========================================================= */

  const handleCreateBatch = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Batch name is required.");
      return;
    }

    if (
      formData.startDate &&
      formData.endDate &&
      new Date(formData.startDate) > new Date(formData.endDate)
    ) {
      setError("End date cannot be before start date.");
      return;
    }

    try {
      setActionId("creating");

      await api.post("/batches", {
        name: formData.name.trim(),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        description: formData.description.trim(),
        status: formData.status,
      });

      setSuccess("Batch created successfully.");

      setFormData({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
        status: "upcoming",
      });

      await fetchBatches();
    } catch (err) {
      console.error("Create batch error:", err);

      setError(
        err.response?.data?.message || "Failed to create batch."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     CHANGE STATUS
  ========================================================= */

  const handleStatusChange = async (batchId, newStatus) => {
    const batch = batches.find((item) => item._id === batchId);

    if (!batch || batch.status === newStatus) return;

    setError("");
    setSuccess("");

    try {
      setActionId(batchId);

      const response = await api.patch(
        `/batches/${batchId}/status`,
        {
          status: newStatus,
        }
      );

      setSuccess(
        response.data?.message ||
          "Batch status updated successfully."
      );

      if (response.data?.batches) {
        setBatches(response.data.batches);
      } else if (response.data?.batch) {
        setBatches((previousBatches) =>
          previousBatches.map((item) =>
            item._id === batchId
              ? response.data.batch
              : item
          )
        );
      } else {
        setBatches((previousBatches) =>
          previousBatches.map((item) =>
            item._id === batchId
              ? {
                  ...item,
                  status: newStatus,
                }
              : item
          )
        );
      }
    } catch (err) {
      console.error(
        "Update batch status error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update batch status."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     TOGGLE REGISTRATION
  ========================================================= */

  const handleToggleRegistration = async (batchId) => {
    setError("");
    setSuccess("");

    try {
      setActionId(`registration-${batchId}`);

      const response = await api.patch(
        `/batches/${batchId}/toggle-registration`
      );

      if (response.data?.batches) {
        setBatches(response.data.batches);
      } else if (response.data?.batch) {
        setBatches((previousBatches) =>
          previousBatches.map((batch) =>
            batch._id === batchId
              ? response.data.batch
              : batch
          )
        );
      } else {
        await fetchBatches();
      }

      setSuccess(
        response.data?.message ||
          "Registration status updated successfully."
      );
    } catch (err) {
      console.error(
        "Toggle registration error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Failed to update registration status."
      );
    } finally {
      setActionId(null);
    }
  };

  /* =========================================================
     DATE
  ========================================================= */

  const formatDate = (dateString) => {
    if (!dateString) return "Not Set";

    return new Date(dateString).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /* =========================================================
     STATUS COLORS
  ========================================================= */

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return `
          border-emerald-300/60
          bg-emerald-400/15
          text-emerald-700
        `;

      case "upcoming":
        return `
          border-blue-300/60
          bg-blue-400/15
          text-blue-700
        `;

      case "completed":
        return `
          border-slate-300/70
          bg-slate-400/15
          text-slate-700
        `;

      default:
        return `
          border-slate-300/70
          bg-slate-400/15
          text-slate-700
        `;
    }
  };

  const hasOpenRegistration = batches.some(
    (batch) =>
      batch.isRegistrationOpen === true
  );

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <>
      {/* =====================================================
          ANIMATION STYLES
      ===================================================== */}

      <style>{`
        @keyframes floatOne {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(50px, -40px, 0) scale(1.12);
          }
        }

        @keyframes floatTwo {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          50% {
            transform: translate3d(-60px, 50px, 0) scale(1.08);
          }
        }

        @keyframes floatThree {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(35px, 35px, 0);
          }
        }

        @keyframes pulseGlow {
          0%, 100% {
            opacity: .35;
          }
          50% {
            opacity: .7;
          }
        }

        @keyframes pageEnter {
          from {
            opacity: 0;
            transform: translateY(25px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .float-one {
          animation: floatOne 12s ease-in-out infinite;
        }

        .float-two {
          animation: floatTwo 15s ease-in-out infinite;
        }

        .float-three {
          animation: floatThree 10s ease-in-out infinite;
        }

        .pulse-glow {
          animation: pulseGlow 4s ease-in-out infinite;
        }

        .page-enter {
          animation: pageEnter .8s ease-out both;
        }

        .slide-down {
          animation: slideDown .7s ease-out both;
        }

        .batch-row {
          animation: pageEnter .6s ease-out both;
        }

        .glass-shimmer {
          background-size: 200% 100%;
          animation: shimmer 8s linear infinite;
        }
      `}</style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        className="
          relative
          min-h-screen
          overflow-hidden
          bg-gradient-to-br
          from-[#bfe7fb]
          via-[#dce8e9]
          via-55%
          to-[#ffd0b1]
          p-4
          md:p-8
        "
      >

        {/* BACKGROUND ORBS */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">

          {/* Large blue */}
          <div
            className="
              float-one
              absolute
              -left-32
              top-[-100px]
              h-[550px]
              w-[550px]
              rounded-full
              bg-[#67c8fa]/45
              blur-[110px]
            "
          />

          {/* Main orange */}
          <div
            className="
              float-two
              absolute
              right-[-160px]
              top-[-80px]
              h-[620px]
              w-[620px]
              rounded-full
              bg-[#ff914d]/45
              blur-[115px]
            "
          />

          {/* Bright orange */}
          <div
            className="
              float-three
              absolute
              right-[10%]
              top-[35%]
              h-[360px]
              w-[360px]
              rounded-full
              bg-[#ffb16f]/40
              blur-[100px]
            "
          />

          {/* Blue center */}
          <div
            className="
              float-two
              absolute
              left-[20%]
              bottom-[-180px]
              h-[500px]
              w-[500px]
              rounded-full
              bg-[#91d9f7]/35
              blur-[120px]
            "
          />

          {/* Orange bottom */}
          <div
            className="
              pulse-glow
              absolute
              right-[30%]
              bottom-[-220px]
              h-[450px]
              w-[450px]
              rounded-full
              bg-[#ff9d61]/35
              blur-[110px]
            "
          />

          {/* Small decorative circles */}

          <div
            className="
              float-one
              absolute
              left-[45%]
              top-[8%]
              h-16
              w-16
              rounded-full
              bg-white/30
              blur-xl
            "
          />

          <div
            className="
              float-three
              absolute
              right-[35%]
              top-[65%]
              h-20
              w-20
              rounded-full
              bg-[#ff9a62]/25
              blur-2xl
            "
          />

          {/* Subtle grid */}
          <div
            className="
              absolute
              inset-0
              opacity-[0.08]
              [background-image:linear-gradient(rgba(20,50,70,.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,50,70,.5)_1px,transparent_1px)]
              [background-size:45px_45px]
            "
          />
        </div>

        {/* ===================================================
            CONTENT
        =================================================== */}

        <div className="relative z-10 mx-auto max-w-7xl">

          {/* =================================================
              TOP HEADER
          ================================================= */}

          <div
            className="
              slide-down
              mb-8
              overflow-hidden
              rounded-[30px]
              border
              border-white/50
              bg-[#0b1d35]/90
              p-6
              shadow-[0_25px_70px_rgba(15,35,55,.25)]
              backdrop-blur-2xl
              md:p-8
            "
          >

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              {/* Decorative glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-20
                  -top-32
                  h-72
                  w-72
                  rounded-full
                  bg-orange-400/20
                  blur-3xl
                "
              />

              <div className="relative flex items-center gap-5">

                <div
                  className="
                    group
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#ff914d]
                    to-[#ffb276]
                    text-white
                    shadow-lg
                    shadow-orange-500/20
                    transition
                    duration-500
                    hover:rotate-6
                    hover:scale-110
                  "
                >
                  <ClipboardList className="h-7 w-7 transition duration-500 group-hover:scale-110" />
                </div>

                <div>
                  <div className="mb-1 flex items-center gap-2">

                    <span
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-[0.25em]
                        text-orange-300
                      "
                    >
                      Administration
                    </span>

                    <Sparkles className="h-4 w-4 text-orange-300" />

                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
                    Batch Management
                  </h1>

                  <p className="mt-2 text-sm text-slate-300 md:text-base">
                    Create, organize and manage your bootcamp batches.
                  </p>
                </div>

              </div>

              {/* Registration */}

              <div
                className="
                  relative
                  rounded-2xl
                  border
                  border-white/10
                  bg-white/10
                  px-6
                  py-4
                  backdrop-blur-xl
                  transition
                  duration-300
                  hover:-translate-y-1
                  hover:bg-white/15
                "
              >

                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Registration
                </p>

                <div className="mt-2 flex items-center gap-3">

                  <span
                    className={`
                      h-3
                      w-3
                      rounded-full
                      shadow-lg
                      ${
                        hasOpenRegistration
                          ? "bg-emerald-400 shadow-emerald-400/60"
                          : "bg-red-400 shadow-red-400/60"
                      }
                    `}
                  />

                  <span className="font-bold text-white">
                    {hasOpenRegistration
                      ? "Currently Open"
                      : "Currently Closed"}
                  </span>

                </div>

              </div>

            </div>
          </div>

          {/* =================================================
              ALERTS
          ================================================= */}

          {error && (
            <div
              className="
                page-enter
                mb-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-red-200/70
                bg-red-50/75
                p-4
                text-red-700
                shadow-lg
                backdrop-blur-xl
              "
            >
              <AlertCircle className="h-5 w-5 shrink-0" />

              <p className="text-sm font-semibold">
                {error}
              </p>
            </div>
          )}

          {success && (
            <div
              className="
                page-enter
                mb-6
                flex
                items-center
                gap-3
                rounded-2xl
                border
                border-emerald-200/70
                bg-emerald-50/75
                p-4
                text-emerald-700
                shadow-lg
                backdrop-blur-xl
              "
            >
              <CheckCircle2 className="h-5 w-5 shrink-0" />

              <p className="text-sm font-semibold">
                {success}
              </p>
            </div>
          )}

          {/* =================================================
              CREATE SECTION
          ================================================= */}

          <section
            className="
              page-enter
              mb-10
              rounded-[28px]
              border
              border-white/60
              bg-white/35
              p-6
              shadow-[0_20px_60px_rgba(40,70,90,.12)]
              backdrop-blur-2xl
              md:p-8
            "
          >

            <div className="mb-7 flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-gradient-to-br
                    from-[#1b4d73]
                    to-[#397fa9]
                    text-white
                    shadow-lg
                    transition
                    duration-300
                    hover:-rotate-6
                    hover:scale-110
                  "
                >
                  <Plus className="h-6 w-6" />
                </div>

                <div>

                  <h2 className="text-xl font-black text-[#102b43]">
                    Create New Batch
                  </h2>

                  <p className="mt-1 text-sm text-[#627789]">
                    Add a new bootcamp batch to the system.
                  </p>

                </div>

              </div>

              <div className="hidden rounded-full border border-white/70 bg-white/50 px-4 py-2 text-xs font-bold text-[#49667b] backdrop-blur-md md:block">
                {batches.length} Existing Batches
              </div>

            </div>

            <form onSubmit={handleCreateBatch}>

              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">

                {/* NAME */}

                <div className="group">
                  <label className="text-sm font-bold text-[#16324a]">
                    Batch Name
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="e.g. Batch 1 (2026)"
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/55
                      px-4
                      py-3.5
                      text-sm
                      font-medium
                      text-[#102b43]
                      shadow-sm
                      outline-none
                      backdrop-blur-xl
                      transition
                      duration-300
                      placeholder:text-slate-400
                      hover:bg-white/75
                      focus:-translate-y-0.5
                      focus:border-[#ff9a5a]
                      focus:bg-white/85
                      focus:ring-4
                      focus:ring-orange-200/40
                    "
                  />
                </div>

                {/* START */}

                <div>
                  <label className="text-sm font-bold text-[#16324a]">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startDate: e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/55
                      px-4
                      py-3.5
                      text-sm
                      font-medium
                      text-[#102b43]
                      shadow-sm
                      outline-none
                      backdrop-blur-xl
                      transition
                      duration-300
                      hover:bg-white/75
                      focus:-translate-y-0.5
                      focus:border-[#4b9bc6]
                      focus:bg-white/85
                      focus:ring-4
                      focus:ring-blue-200/40
                    "
                  />
                </div>

                {/* END */}

                <div>
                  <label className="text-sm font-bold text-[#16324a]">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        endDate: e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/55
                      px-4
                      py-3.5
                      text-sm
                      font-medium
                      text-[#102b43]
                      shadow-sm
                      outline-none
                      backdrop-blur-xl
                      transition
                      duration-300
                      hover:bg-white/75
                      focus:-translate-y-0.5
                      focus:border-[#4b9bc6]
                      focus:bg-white/85
                      focus:ring-4
                      focus:ring-blue-200/40
                    "
                  />
                </div>

                {/* STATUS */}

                <div>
                  <label className="text-sm font-bold text-[#16324a]">
                    Initial Status
                  </label>

                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/55
                      px-4
                      py-3.5
                      text-sm
                      font-medium
                      text-[#102b43]
                      shadow-sm
                      outline-none
                      backdrop-blur-xl
                      transition
                      duration-300
                      hover:bg-white/75
                      focus:-translate-y-0.5
                      focus:border-[#4b9bc6]
                      focus:bg-white/85
                      focus:ring-4
                      focus:ring-blue-200/40
                    "
                  >
                    <option value="upcoming">
                      Upcoming
                    </option>

                    <option value="active">
                      Active
                    </option>
                  </select>
                </div>
              </div>

              {/* DESCRIPTION + BUTTON */}

              <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">

                <div>
                  <label className="text-sm font-bold text-[#16324a]">
                    Description
                  </label>

                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe this bootcamp batch..."
                    className="
                      mt-2
                      w-full
                      resize-none
                      rounded-2xl
                      border
                      border-white/80
                      bg-white/55
                      px-4
                      py-3.5
                      text-sm
                      font-medium
                      text-[#102b43]
                      shadow-sm
                      outline-none
                      backdrop-blur-xl
                      transition
                      duration-300
                      placeholder:text-slate-400
                      hover:bg-white/75
                      focus:-translate-y-0.5
                      focus:border-[#ff9a5a]
                      focus:bg-white/85
                      focus:ring-4
                      focus:ring-orange-200/40
                    "
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionId === "creating"}
                  className="
                    group
                    flex
                    min-h-[56px]
                    min-w-[195px]
                    items-center
                    justify-center
                    gap-3
                    rounded-2xl
                    bg-gradient-to-r
                    from-[#173c5d]
                    to-[#28638c]
                    px-7
                    py-3
                    font-bold
                    text-white
                    shadow-xl
                    shadow-blue-900/20
                    transition
                    duration-300
                    hover:-translate-y-1
                    hover:scale-[1.02]
                    hover:from-[#1d4d73]
                    hover:to-[#347ca8]
                    hover:shadow-2xl
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {actionId === "creating" ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5 transition duration-300 group-hover:rotate-90" />
                  )}

                  Create Batch

                  <ArrowUpRight
                    className="
                      h-4
                      w-4
                      opacity-60
                      transition
                      duration-300
                      group-hover:translate-x-1
                      group-hover:-translate-y-1
                    "
                  />
                </button>

              </div>
            </form>
          </section>

          {/* =================================================
              BATCH LIST
          ================================================= */}

          <section className="page-enter">

            <div className="mb-6 flex items-end justify-between">

              <div>

                <div className="mb-2 flex items-center gap-3">

                  <span className="h-2 w-2 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50" />

                  <span className="text-xs font-black uppercase tracking-[0.2em] text-[#63798a]">
                    Bootcamp Overview
                  </span>

                </div>

                <h2 className="text-2xl font-black text-[#102b43] md:text-3xl">
                  Existing Batches
                </h2>

                <p className="mt-1 text-sm text-[#607789]">
                  Manage your bootcamp schedule and registration.
                </p>

              </div>

              <div
                className="
                  hidden
                  rounded-2xl
                  border
                  border-white/70
                  bg-white/45
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-[#29465d]
                  shadow-sm
                  backdrop-blur-xl
                  md:block
                "
              >
                {batches.length}{" "}
                {batches.length === 1
                  ? "Batch"
                  : "Batches"}
              </div>

            </div>

            {/* LOADING */}

            {loading ? (
              <div
                className="
                  flex
                  min-h-[250px]
                  items-center
                  justify-center
                  rounded-[28px]
                  border
                  border-white/60
                  bg-white/35
                  shadow-xl
                  backdrop-blur-xl
                "
              >
                <div className="text-center">

                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#173c5d] text-white shadow-xl">
                    <Loader2 className="h-7 w-7 animate-spin" />
                  </div>

                  <p className="font-bold text-[#18364e]">
                    Loading batches...
                  </p>

                </div>
              </div>

            ) : batches.length === 0 ? (

              /* EMPTY */

              <div
                className="
                  rounded-[28px]
                  border
                  border-dashed
                  border-white/80
                  bg-white/40
                  py-20
                  text-center
                  shadow-xl
                  backdrop-blur-xl
                "
              >

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e5f2fa] text-[#1A3D63]">
                  <ClipboardList className="h-8 w-8" />
                </div>

                <p className="mt-5 text-lg font-black text-[#102b43]">
                  No batches found
                </p>

                <p className="mt-2 text-sm text-[#607789]">
                  Create your first bootcamp batch above.
                </p>

              </div>

            ) : (

              /* =================================================
                 MODERN TABLE
              ================================================= */

              <div
                className="
                  overflow-hidden
                  rounded-[28px]
                  border
                  border-white/70
                  bg-white/40
                  p-2
                  shadow-[0_25px_70px_rgba(30,60,80,.15)]
                  backdrop-blur-2xl
                "
              >

                <div className="overflow-x-auto rounded-[22px]">

                  <table className="w-full min-w-[1000px] border-separate border-spacing-y-2">

                    <thead>

                      <tr>

                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#62788a]">
                          Batch
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#62788a]">
                          Duration
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#62788a]">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-[0.18em] text-[#62788a]">
                          Registration
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-[0.18em] text-[#62788a]">
                          Action
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {batches.map(
                        (batch, index) => (
                          <tr
                            key={batch._id}
                            className="
                              batch-row
                              group
                              transition
                              duration-300
                            "
                            style={{
                              animationDelay: `${index * 80}ms`,
                            }}
                          >

                            {/* BATCH */}

                            <td
                              className="
                                rounded-l-2xl
                                border-y
                                border-l
                                border-white/80
                                bg-white/65
                                px-6
                                py-5
                                shadow-sm
                                backdrop-blur-xl
                                transition
                                duration-300
                                group-hover:-translate-y-1
                                group-hover:bg-white/90
                                group-hover:shadow-lg
                              "
                            >

                              <div className="flex items-center gap-4">

                                <div
                                  className="
                                    flex
                                    h-12
                                    w-12
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-gradient-to-br
                                    from-[#dff2fc]
                                    to-[#c5e5f5]
                                    text-[#1b5278]
                                    shadow-sm
                                    transition
                                    duration-300
                                    group-hover:rotate-3
                                    group-hover:scale-110
                                  "
                                >
                                  <ClipboardList className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">

                                  <p className="font-black text-[#102b43]">
                                    {batch.name}
                                  </p>

                                  {batch.description && (
                                    <p className="mt-1 max-w-xs truncate text-xs text-[#718391]">
                                      {batch.description}
                                    </p>
                                  )}

                                </div>

                              </div>

                            </td>

                            {/* DURATION */}

                            <td
                              className="
                                border-y
                                border-white/80
                                bg-white/65
                                px-6
                                py-5
                                shadow-sm
                                backdrop-blur-xl
                                transition
                                duration-300
                                group-hover:-translate-y-1
                                group-hover:bg-white/90
                              "
                            >

                              <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#367ba4]">
                                  <Calendar className="h-4 w-4" />
                                </div>

                                <div>

                                  <p className="text-sm font-bold text-[#17344b]">
                                    {formatDate(
                                      batch.startDate
                                    )}
                                  </p>

                                  <p className="mt-0.5 text-xs text-[#758796]">
                                    to{" "}
                                    {formatDate(
                                      batch.endDate
                                    )}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* STATUS */}

                            <td
                              className="
                                border-y
                                border-white/80
                                bg-white/65
                                px-6
                                py-5
                                shadow-sm
                                backdrop-blur-xl
                                transition
                                duration-300
                                group-hover:-translate-y-1
                                group-hover:bg-white/90
                              "
                            >

                              <div className="flex items-center gap-2">

                                <select
                                  value={
                                    batch.status ||
                                    "upcoming"
                                  }
                                  onChange={(e) =>
                                    handleStatusChange(
                                      batch._id,
                                      e.target.value
                                    )
                                  }
                                  disabled={
                                    actionId ===
                                    batch._id
                                  }
                                  className={`
                                    cursor-pointer
                                    rounded-full
                                    border
                                    px-4
                                    py-2
                                    text-xs
                                    font-black
                                    outline-none
                                    transition
                                    duration-300
                                    hover:-translate-y-0.5
                                    hover:shadow-md
                                    ${getStatusStyle(
                                      batch.status
                                    )}
                                    ${
                                      actionId ===
                                      batch._id
                                        ? "cursor-not-allowed opacity-50"
                                        : ""
                                    }
                                  `}
                                >

                                  <option value="upcoming">
                                    Upcoming
                                  </option>

                                  <option value="active">
                                    Active
                                  </option>

                                  <option value="completed">
                                    Completed
                                  </option>

                                </select>

                                {actionId ===
                                  batch._id && (
                                  <Loader2 className="h-4 w-4 animate-spin text-[#1A3D63]" />
                                )}

                              </div>

                            </td>

                            {/* REGISTRATION */}

                            <td
                              className="
                                border-y
                                border-white/80
                                bg-white/65
                                px-6
                                py-5
                                shadow-sm
                                backdrop-blur-xl
                                transition
                                duration-300
                                group-hover:-translate-y-1
                                group-hover:bg-white/90
                              "
                            >

                              <div
                                className={`
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-full
                                  border
                                  px-4
                                  py-2
                                  text-xs
                                  font-black
                                  transition
                                  duration-300
                                  hover:scale-105
                                  ${
                                    batch.isRegistrationOpen
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : "border-slate-200 bg-slate-100/80 text-slate-600"
                                  }
                                `}
                              >

                                <span
                                  className={`
                                    h-2.5
                                    w-2.5
                                    rounded-full
                                    ${
                                      batch.isRegistrationOpen
                                        ? "bg-emerald-500 shadow-lg shadow-emerald-400/60"
                                        : "bg-slate-400"
                                    }
                                  `}
                                />

                                {batch.isRegistrationOpen
                                  ? "Open"
                                  : "Closed"}

                              </div>

                            </td>

                            {/* ACTION */}

                            <td
                              className="
                                rounded-r-2xl
                                border-y
                                border-r
                                border-white/80
                                bg-white/65
                                px-6
                                py-5
                                text-right
                                shadow-sm
                                backdrop-blur-xl
                                transition
                                duration-300
                                group-hover:-translate-y-1
                                group-hover:bg-white/90
                              "
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleRegistration(
                                    batch._id
                                  )
                                }
                                disabled={
                                  actionId ===
                                  `registration-${batch._id}`
                                }
                                className={`
                                  group/button
                                  inline-flex
                                  items-center
                                  justify-center
                                  gap-2
                                  rounded-xl
                                  px-4
                                  py-2.5
                                  text-xs
                                  font-black
                                  shadow-sm
                                  transition
                                  duration-300
                                  hover:-translate-y-1
                                  hover:scale-[1.03]
                                  hover:shadow-lg
                                  active:translate-y-0
                                  disabled:cursor-not-allowed
                                  disabled:opacity-50
                                  ${
                                    batch.isRegistrationOpen
                                      ? "bg-red-50 text-red-600 hover:bg-red-100"
                                      : "bg-[#173f60] text-white hover:bg-[#22577f]"
                                  }
                                `}
                              >

                                {actionId ===
                                `registration-${batch._id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    {batch.isRegistrationOpen
                                      ? "Close Registration"
                                      : "Open Registration"}

                                    <ArrowUpRight
                                      className="
                                        h-3.5
                                        w-3.5
                                        opacity-60
                                        transition
                                        duration-300
                                        group-hover/button:-translate-y-0.5
                                        group-hover/button:translate-x-0.5
                                      "
                                    />
                                  </>
                                )}

                              </button>

                            </td>

                          </tr>
                        )
                      )}

                    </tbody>

                  </table>

                </div>
              </div>
            )}

          </section>
        </div>
      </div>
    </>
  );
}

export default BatchManagement;