import { useEffect, useState } from "react";
import { getApiError } from "../../api/http.js";
import { getSubmission, saveSubmission } from "../../api/submission.js";
import { teamApi } from "../../api/team.js";
import TeamNav from "../../components/team/TeamNav.jsx";
import Dock from "../../components/layout/Dock.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import useEventSettings from "../../hooks/useEventSettings.js";

const emptyGame = {
  title: "",
  description: "",
  repoUrl: "",
  playableUrl: "",
  videoUrl: "",
};

export default function SubmissionPage() {
  const { user } = useAuth();
  const { status, settings } = useEventSettings({ fresh: true });

  const isOpen = status === "ready" && settings?.submissionOpen === true;

  const [isEditing, setIsEditing] = useState(false);
  const [game, setGame] = useState(emptyGame);
  const [savedGame, setSavedGame] = useState(null);
  const [team, setTeam] = useState(null);
  const [registrationStatus, setRegistrationStatus] = useState("pending");
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Load the saved submission and registration status
  useEffect(() => {
    let cancelled = false;
    async function loadSubmission() {
      setIsLoading(true);
      setLoadError("");

      try {
        const [response, teamData] = await Promise.all([
          getSubmission(),
          teamApi.getMyTeam(),
        ]);
        if (cancelled) return;
        const actualStatus = teamData?.registration?.status;

        if (!actualStatus) {
          throw new Error("Team registration status is missing.");
        }
        const submission = response.data;
        setSavedGame(submission || null);
        setGame(
          submission
            ? {
                title: submission.title || "",
                description: submission.description || "",
                repoUrl: submission.repoUrl || "",
                playableUrl: submission.playableUrl || "",
                videoUrl: submission.videoUrl || "",
              }
            : { ...emptyGame }
        );
        setRegistrationStatus(actualStatus);
        setTeam(
          teamData
            ? {
                id: teamData.id,
                name: teamData.name,
                code: teamData.id
                  ? `TEAM-${String(teamData.id).slice(-4).toUpperCase()}`
                  : null,
              }
            : null
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load submission details:", error);
          setLoadError(
            "We could not load your saved game and registration details. Please try again. Your saved game has not been changed."
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadSubmission();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  function handleChange(event) {
    const { name, value } = event.target;

    setGame((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setMessage("");
  }

  function isValidUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!game.title.trim()) {
      nextErrors.title = "Please enter your game title.";
    }

    if (!game.description.trim()) {
      nextErrors.description = "Please enter your game description.";
    }

    if (!game.repoUrl.trim()) {
      nextErrors.repoUrl = "Please enter your GitHub repository URL.";
    } else {
      try {
        const url = new URL(game.repoUrl.trim());

        if (
          url.hostname !== "github.com" ||
          !["http:", "https:"].includes(url.protocol)
        ) {
          nextErrors.repoUrl = "Please enter a valid GitHub repository link.";
        }
      } catch {
        nextErrors.repoUrl = "Please enter a valid GitHub URL.";
      }
    }

    if (game.playableUrl.trim() && !isValidUrl(game.playableUrl.trim())) {
      nextErrors.playableUrl = "Please enter a valid playable game URL.";
    }

    if (game.videoUrl.trim() && !isValidUrl(game.videoUrl.trim())) {
      nextErrors.videoUrl = "Please enter a valid demo video URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  // Save a new game or update an existing game
  async function handleSave(event) {
    event.preventDefault();

    if (!isOpen) {
      setMessage("Submissions are currently closed.");
      return;
    }

    if (registrationStatus !== "approved") {
      setMessage(
        "Your team registration must be confirmed before submitting a game. Registration is free; contact the organizers if your team is not confirmed."
      );
      return;
    }

    if (!validateForm()) {
      setMessage("Please correct the highlighted fields.");
      return;
    }

    try {
      setIsSaving(true);
      setMessage("");

      const response = await saveSubmission(game);
      const submission = response.data;

      setSavedGame(submission);
      setGame({
        title: submission.title || "",
        description: submission.description || "",
        repoUrl: submission.repoUrl || "",
        playableUrl: submission.playableUrl || "",
        videoUrl: submission.videoUrl || "",
      });

      setIsEditing(false);
      setErrors({});
      setMessage("Your game submission has been saved successfully!");
    } catch (error) {
      console.error("Failed to save submission:", error);

      const apiError = getApiError(error);

      setMessage(apiError.message);
      setErrors(apiError.fields || {});
    } finally {
      setIsSaving(false);
    }
  }

  // Edit an existing submission
  function handleEdit() {
    if (!isOpen || registrationStatus !== "approved" || !savedGame) {
      return;
    }

    setGame({
      title: savedGame.title || "",
      description: savedGame.description || "",
      repoUrl: savedGame.repoUrl || "",
      playableUrl: savedGame.playableUrl || "",
      videoUrl: savedGame.videoUrl || "",
    });

    setErrors({});
    setMessage("");
    setIsEditing(true);
  }

  function handleCancel() {
    if (savedGame) {
      setGame({
        title: savedGame.title || "",
        description: savedGame.description || "",
        repoUrl: savedGame.repoUrl || "",
        playableUrl: savedGame.playableUrl || "",
        videoUrl: savedGame.videoUrl || "",
      });
    } else {
      setGame(emptyGame);
    }

    setErrors({});
    setMessage("");
    setIsEditing(false);
  }

  // Loading screen
  if (isLoading || status === "loading") {
    return (
      <div className="relative min-h-screen max-w-5xl mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-24 pb-36 text-center font-body text-[#cac7e0] bg-[#070714]">
        <div>
          <div className="inline-block w-10 h-10 border-4 border-[#00e5ff] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-xl font-bold text-white font-display">Loading Game Submission...</p>
          <p className="text-sm text-[#a7a6b8] mt-1">
            Please wait while we load your team and submission information
          </p>
        </div>
        <Dock />
      </div>
    );
  }

  // Settings error screen
  if (status === "error") {
    return (
      <div className="relative min-h-screen max-w-5xl mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-16 pb-36 font-body text-[#cac7e0] bg-[#070714]">
        <div
          role="alert"
          className="max-w-xl mx-auto rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#141025] to-[#0c0b19] p-8 text-center text-white shadow-2xl backdrop-blur-md space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h2 className="font-display text-2xl font-bold text-[#f6f4fc]">
            Unable to Load Settings
          </h2>
          <p className="text-sm text-[#cac7e0] leading-relaxed">
            We could not load the submission status. Please try again later.
          </p>
        </div>
        <Dock />
      </div>
    );
  }

  // A failed request must not be presented as an empty submission.
  if (loadError) {
    return (
      <div className="relative min-h-screen max-w-5xl mx-auto flex flex-col justify-between px-4 sm:px-6 lg:px-8 pt-16 pb-36 font-body text-[#cac7e0] bg-[#070714]">
        <div
          role="alert"
          className="max-w-xl mx-auto rounded-2xl border border-red-500/40 bg-gradient-to-b from-[#141025] to-[#0c0b19] p-8 text-center text-white shadow-2xl backdrop-blur-md space-y-4"
        >
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-2xl">
            ⚠️
          </div>
          <h2 className="font-display text-2xl font-bold text-[#f6f4fc]">
            Unable to Load Submission Details
          </h2>
          <p className="text-sm text-[#cac7e0] leading-relaxed">{loadError}</p>
          <button
            type="button"
            className="mt-2 rounded-full bg-[#00e5ff] hover:brightness-110 px-6 py-2.5 font-body font-bold text-xs uppercase tracking-wider text-[#070714] transition"
            onClick={() => setRetryCount((count) => count + 1)}
          >
            Retry
          </button>
        </div>
        <Dock />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-36 font-body text-[#cac7e0] bg-[#070714] space-y-8">
      {/* Ambient top radial glow matching Home/Team art direction */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 h-[360px] w-[580px] max-w-full rounded-full bg-gradient-to-b from-[#8b3dff]/15 via-[#00e5ff]/5 to-transparent blur-3xl" />

      {/* Team Navigation & Account Header */}
      <TeamNav team={team} user={user} currentStatus={registrationStatus} />

      {/* Page Header */}
      <div className="pb-2">
        <span className="font-body text-xs font-bold tracking-[0.25em] text-[#00e5ff] uppercase">
          Your Ideas • Your Creation
        </span>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-black tracking-tight text-[#f6f4fc]">
          GAME <span className="text-[#00e5ff]">SUBMISSION</span>
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#a7a6b8] max-w-2xl leading-relaxed">
          Bring your creativity to life. Submit your game and showcase what your team has built to the judges and community.
        </p>
      </div>

      {/* Registration pending message */}
      {isOpen && registrationStatus !== "approved" && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 sm:p-7 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-xl text-amber-300">
              ⚠️
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-[#f6f4fc]">
                Team Registration Needs Attention
              </h2>
              <p className="text-sm text-[#a7a6b8] leading-relaxed">
                Registration is free and new teams are confirmed automatically. Your saved registration is not confirmed. Contact the organizers to check your registration; no payment is required.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Submissions closed message */}
      {!isOpen && (
        <div
          role="alert"
          className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 sm:p-7 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 text-xl text-slate-300">
              🔒
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-lg font-bold text-[#f6f4fc]">
                Submissions Are Closed
              </h2>
              <p className="text-sm text-[#a7a6b8] leading-relaxed">
                The game submission period is not currently open. You can view your existing submission below, but you cannot create or edit it.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Show form only when event is open and team is approved */}
      {isOpen && registrationStatus === "approved" && isEditing ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 sm:p-8 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-body bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                SUBMISSIONS OPEN
              </span>
            </div>

            <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f6f4fc]">
              {savedGame ? "Edit Your Game Submission" : "Create Your Game Submission"}
            </h2>
            <p className="mt-1 mb-6 text-xs sm:text-sm text-[#a7a6b8]">
              Enter your team's game information below. Required fields are marked with an asterisk.
            </p>

            {message && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-400/50 bg-red-500/10 p-3.5 text-sm font-semibold text-red-300"
              >
                {message}
              </div>
            )}

            <form onSubmit={handleSave} noValidate className="space-y-5">
              <div>
                <label
                  htmlFor="game-title"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
                >
                  Game Title <span className="text-[#ff2bd6]">*</span>
                </label>
                <input
                  id="game-title"
                  name="title"
                  value={game.title}
                  onChange={handleChange}
                  placeholder="Enter your game title"
                  className={`w-full rounded-lg bg-[#070714] border px-3.5 py-2.5 font-body text-base text-[#f6f4fc] placeholder-white/30 transition focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 ${
                    errors.title ? "border-red-500/70" : "border-white/15"
                  }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="game-description"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
                >
                  Game Description <span className="text-[#ff2bd6]">*</span>
                </label>
                <textarea
                  id="game-description"
                  name="description"
                  rows={5}
                  value={game.description}
                  onChange={handleChange}
                  placeholder="Describe your game, its features and how to play..."
                  className={`w-full rounded-lg bg-[#070714] border px-3.5 py-2.5 font-body text-base text-[#f6f4fc] placeholder-white/30 transition focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 ${
                    errors.description ? "border-red-500/70" : "border-white/15"
                  }`}
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.description}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="game-repo"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
                >
                  GitHub Repository URL <span className="text-[#ff2bd6]">*</span>
                </label>
                <input
                  id="game-repo"
                  type="url"
                  name="repoUrl"
                  value={game.repoUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/your-team/game"
                  className={`w-full rounded-lg bg-[#070714] border px-3.5 py-2.5 font-body text-base text-[#f6f4fc] placeholder-white/30 transition focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 ${
                    errors.repoUrl ? "border-red-500/70" : "border-white/15"
                  }`}
                />
                {errors.repoUrl && (
                  <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.repoUrl}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="game-playable"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
                >
                  Playable Game URL (Optional)
                </label>
                <input
                  id="game-playable"
                  type="url"
                  name="playableUrl"
                  value={game.playableUrl}
                  onChange={handleChange}
                  placeholder="https://your-game-link.com"
                  className={`w-full rounded-lg bg-[#070714] border px-3.5 py-2.5 font-body text-base text-[#f6f4fc] placeholder-white/30 transition focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 ${
                    errors.playableUrl ? "border-red-500/70" : "border-white/15"
                  }`}
                />
                {errors.playableUrl && (
                  <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.playableUrl}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="game-video"
                  className="block text-xs font-bold uppercase tracking-wider text-[#a7a6b8] mb-1.5"
                >
                  Demo Video URL (Optional)
                </label>
                <input
                  id="game-video"
                  type="url"
                  name="videoUrl"
                  value={game.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/your-demo"
                  className={`w-full rounded-lg bg-[#070714] border px-3.5 py-2.5 font-body text-base text-[#f6f4fc] placeholder-white/30 transition focus:outline-none focus:border-[#00e5ff] focus:ring-1 focus:ring-[#00e5ff]/40 ${
                    errors.videoUrl ? "border-red-500/70" : "border-white/15"
                  }`}
                />
                {errors.videoUrl && (
                  <p className="mt-1.5 text-xs font-semibold text-red-400">{errors.videoUrl}</p>
                )}
                <p className="mt-1.5 text-xs text-[#a7a6b8]">
                  You can provide a YouTube or other accessible video link.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] font-bold text-xs uppercase tracking-wider px-6 py-2.5 transition shadow-[0_0_16px_rgba(255,43,214,0.35)] disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "✦ Save Game Submission"}
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleCancel}
                  className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>

          {/* Guide Aside */}
          <aside className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 sm:p-7 shadow-xl backdrop-blur-md space-y-5">
              <div>
                <h2 className="font-display text-lg font-bold text-[#f6f4fc]">Submission Guide</h2>
                <p className="mt-1 text-xs text-[#a7a6b8]">
                  Remember these things before submitting your game.
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                    🎮
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#f6f4fc] block">Original Game</strong>
                    <p className="text-xs text-[#a7a6b8] mt-0.5 leading-relaxed">
                      Submit your team's own completed game project.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                    💻
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#f6f4fc] block">GitHub Repository</strong>
                    <p className="text-xs text-[#a7a6b8] mt-0.5 leading-relaxed">
                      Make sure your repository link is accessible.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                    🚀
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#f6f4fc] block">Playable Link</strong>
                    <p className="text-xs text-[#a7a6b8] mt-0.5 leading-relaxed">
                      Provide a working link so judges can test your game.
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3.5 flex items-start gap-3.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-lg">
                    🎥
                  </div>
                  <div>
                    <strong className="text-sm font-bold text-[#f6f4fc] block">Demo Video</strong>
                    <p className="text-xs text-[#a7a6b8] mt-0.5 leading-relaxed">
                      Include a demonstration video if available.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl border border-[#00e5ff]/30 bg-[#00e5ff]/5 p-5 text-xs text-[#cac7e0] leading-relaxed backdrop-blur-sm">
              <strong className="font-display text-xs tracking-wider text-[#00e5ff] block mb-1">
                ✦ PRO TIP
              </strong>
              Check all your links before submitting. Make sure your game is ready for the judges!
            </div>
          </aside>
        </div>
      ) : (
        <>
          {/* Display previously saved game or empty state */}
          {savedGame ? (
            <section className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#141025]/90 to-[#0c0b19]/95 p-6 sm:p-8 shadow-xl backdrop-blur-md space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-body bg-emerald-500/15 text-emerald-300 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  SAVED SUBMISSION
                </span>

                {isOpen && registrationStatus === "approved" && (
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-full border border-[#00e5ff]/50 bg-[#00e5ff]/10 text-[#00e5ff] hover:bg-[#00e5ff] hover:text-[#070714] font-bold text-xs uppercase tracking-wider px-5 py-2 transition"
                  >
                    ✎ Edit Submission
                  </button>
                )}
              </div>

              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-[#f6f4fc] flex items-center gap-3">
                  <span>🎮</span>
                  <span>{savedGame.title}</span>
                </h2>
                <p className="mt-3 text-sm sm:text-base text-[#cac7e0] leading-relaxed">
                  {savedGame.description}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a7a6b8]">
                    GitHub Repository
                  </span>
                  <a
                    href={savedGame.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-mono text-[#00e5ff] hover:underline break-all"
                  >
                    {savedGame.repoUrl}
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a7a6b8]">
                    Playable Game
                  </span>
                  {savedGame.playableUrl ? (
                    <a
                      href={savedGame.playableUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-mono text-[#00e5ff] hover:underline break-all"
                    >
                      {savedGame.playableUrl}
                    </a>
                  ) : (
                    <span className="text-sm text-[#a7a6b8] italic">Not provided</span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#a7a6b8]">
                    Demo Video
                  </span>
                  {savedGame.videoUrl ? (
                    <a
                      href={savedGame.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-mono text-[#00e5ff] hover:underline break-all"
                    >
                      {savedGame.videoUrl}
                    </a>
                  ) : (
                    <span className="text-sm text-[#a7a6b8] italic">Not provided</span>
                  )}
                </div>
              </div>

              {message && (
                <div
                  role="status"
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300"
                >
                  {message}
                </div>
              )}
            </section>
          ) : (
            <section className="rounded-2xl border border-dashed border-white/15 bg-gradient-to-b from-[#141025]/60 to-[#0c0b19]/70 p-8 sm:p-12 text-center shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl mb-4">
                🎮
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f6f4fc]">
                No Game Submission Yet
              </h2>
              <p className="mt-2 text-sm text-[#a7a6b8] max-w-md mx-auto">
                Your team has not submitted a game yet. When you are ready, submit your game link and repository below.
              </p>

              {isOpen && registrationStatus === "approved" && (
                <button
                  type="button"
                  onClick={() => {
                    setGame(emptyGame);
                    setMessage("");
                    setErrors({});
                    setIsEditing(true);
                  }}
                  className="mt-6 rounded-full bg-[#ff2bd6] hover:brightness-110 text-[#070714] font-bold text-xs uppercase tracking-wider px-7 py-3 transition shadow-[0_0_20px_rgba(255,43,214,0.45)]"
                >
                  ✦ Create Your Game Submission
                </button>
              )}
            </section>
          )}
        </>
      )}

      {/* Clean inline footer matching Register/Login/Team */}
      <footer className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 font-body text-xs text-[#a7a6b8]">
        <a href="https://www.sesa.lk" target="_blank" rel="noopener noreferrer" className="transition hover:text-[#f6f4fc]">SESA × IEEE SB UOK ↗</a>
        <span>© {new Date().getFullYear()} {settings?.event?.name || 'Cyberpunk Game Buildathon'}</span>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="transition hover:text-[#f6f4fc]">Back to top ↑</button>
      </footer>

      {/* Floating Home Dock */}
      <Dock />
    </div>
  );
}
