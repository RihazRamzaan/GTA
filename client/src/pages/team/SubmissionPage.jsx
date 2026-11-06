import { useEffect, useState } from "react";
import useEventSettings from "../../hooks/useEventSettings.js";
import {
  getSubmission,
  saveSubmission,
} from "../../api/submission.js";

const emptyGame = {
  title: "",
  description: "",
  repoUrl: "",
  playableUrl: "",
  videoUrl: "",
};

export default function SubmissionPage() {
  const { status, settings } = useEventSettings();

  const isOpen =
    status === "ready" && settings?.submissionOpen === true;

  const [isEditing, setIsEditing] = useState(false);
  const [game, setGame] = useState(emptyGame);
  const [savedGame, setSavedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function loadSubmission() {
      try {
        const response = await getSubmission();
        const submission = response.data;

        if (submission) {
          setSavedGame(submission);
          setGame({
            title: submission.title || "",
            description: submission.description || "",
            repoUrl: submission.repoUrl || "",
            playableUrl: submission.playableUrl || "",
            videoUrl: submission.videoUrl || "",
          });
        }
      } catch (error) {
        console.error("Failed to load submission:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSubmission();
  }, []);

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
      return (
        url.protocol === "http:" ||
        url.protocol === "https:"
      );
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
      nextErrors.description =
        "Please enter your game description.";
    }

    if (!game.repoUrl.trim()) {
      nextErrors.repoUrl =
        "Please enter your GitHub repository URL.";
    } else {
      try {
        const url = new URL(game.repoUrl.trim());

        if (
          url.hostname !== "github.com" ||
          !["http:", "https:"].includes(url.protocol)
        ) {
          nextErrors.repoUrl =
            "Please enter a valid GitHub repository link.";
        }
      } catch {
        nextErrors.repoUrl =
          "Please enter a valid GitHub URL.";
      }
    }

    if (
      game.playableUrl.trim() &&
      !isValidUrl(game.playableUrl.trim())
    ) {
      nextErrors.playableUrl =
        "Please enter a valid playable game URL.";
    }

    if (
      game.videoUrl.trim() &&
      !isValidUrl(game.videoUrl.trim())
    ) {
      nextErrors.videoUrl =
        "Please enter a valid demo video URL.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!isOpen) {
      setMessage("Submissions are currently closed.");
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

      setMessage(
        error.response?.data?.error?.message ||
          "Could not save your submission. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit() {
    if (!isOpen || !savedGame) return;

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

  if (isLoading || status === "loading") {
    return (
      <main className="submission-page">
        <div className="sp-container">
          <section className="sp-locked">
            <h2>Loading Game Submission...</h2>
            <p>Please wait while we load your information.</p>
          </section>
        </div>
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="submission-page">
        <div className="sp-container">
          <section className="sp-locked">
            <h2>Unable to Load Settings</h2>
            <p>
              We could not load the submission status.
              Please try again later.
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="submission-page">
      <style>{`
        .submission-page {
          --sp-bg: #080714;
          --sp-panel: rgba(13, 17, 39, .92);
          --sp-cyan: #00e5ff;
          --sp-pink: #ff2bd6;
          --sp-text: #f5f7ff;
          --sp-muted: #aab3c8;
          --sp-line: rgba(0, 229, 255, .24);
          min-height: 100vh;
          padding: 34px 6%;
          box-sizing: border-box;
          color: var(--sp-text);
          background:
            radial-gradient(ellipse at 85% 4%, rgba(0,229,255,.13), transparent 32%),
            radial-gradient(ellipse at 8% 55%, rgba(255,43,214,.11), transparent 34%),
            var(--sp-bg);
          font-family: "Rajdhani", system-ui, sans-serif;
        }

        .submission-page * { box-sizing: border-box; }

        .sp-hero h1, .sp-card h2, .sp-locked h2 {
          font-family: "Orbitron", system-ui, sans-serif;
        }

        .sp-container {
          width: 100%;
          max-width: 1150px;
          margin: 0 auto;
        }

        .sp-tag, .sp-status, .sp-saved-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border: 1px solid var(--sp-line);
          border-radius: 5px;
          background: rgba(0,229,255,.07);
          color: var(--sp-cyan);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .sp-hero {
          text-align: center;
          margin: 0 auto 34px;
          max-width: 720px;
        }

        .sp-eyebrow {
          color: var(--sp-pink);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 4px;
        }

        .sp-hero h1 {
          margin: 16px 0 12px;
          color: #fff;
          font-size: clamp(34px, 6vw, 60px);
          line-height: 1.08;
          font-weight: 900;
        }

        .sp-hero h1 span { color: var(--sp-cyan); }

        .sp-hero p {
          color: var(--sp-muted);
          font-size: 15px;
          line-height: 1.8;
        }

        .sp-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.5fr) minmax(260px, .8fr);
          gap: 22px;
          align-items: start;
        }

        .sp-card {
          min-width: 0;
          padding: 26px;
          border: 1px solid var(--sp-line);
          border-radius: 10px;
          background: var(--sp-panel);
          box-shadow: 0 10px 35px rgba(0,0,0,.16);
        }

        .sp-card h2 {
          margin: 0 0 10px;
          color: #fff;
          font-size: 21px;
        }

        .sp-subtitle {
          margin: 0 0 22px;
          color: var(--sp-muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .sp-form label {
          display: block;
          margin: 18px 0 8px;
          color: var(--sp-text);
          font-size: 13px;
          font-weight: 700;
        }

        .sp-required { color: var(--sp-pink); }

        .sp-form input, .sp-form textarea {
          display: block;
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #303955;
          border-radius: 5px;
          outline: none;
          background: #080714;
          color: #fff;
          font: inherit;
          font-size: 14px;
        }

        .sp-form textarea {
          min-height: 118px;
          resize: vertical;
          line-height: 1.6;
        }

        .sp-form input:focus, .sp-form textarea:focus {
          border-color: var(--sp-cyan);
          box-shadow: 0 0 0 3px rgba(0,229,255,.1);
        }

        .sp-form input::placeholder, .sp-form textarea::placeholder {
          color: #77819b;
        }

        .sp-invalid { border-color: #ff668a !important; }

        .sp-error {
          display: block;
          margin-top: 6px;
          color: #ff668a;
          font-size: 12px;
        }

        .sp-hint {
          display: block;
          margin-top: 7px;
          color: var(--sp-muted);
          font-size: 11px;
        }

        .sp-button, .sp-submit {
          border: 1px solid var(--sp-pink);
          border-radius: 5px;
          padding: 11px 17px;
          color: #fff;
          background: var(--sp-pink);
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .sp-submit {
          width: 100%;
          margin-top: 25px;
          padding: 14px 18px;
          font-size: 14px;
          box-shadow: 0 0 16px rgba(255,43,214,.2);
        }

        .sp-button:disabled, .sp-submit:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .sp-cancel { margin: 14px 0 0 10px; }

        .sp-message {
          margin: 0 0 18px;
          padding: 12px 14px;
          border: 1px solid rgba(0,229,255,.4);
          border-radius: 5px;
          background: rgba(0,229,255,.07);
          color: var(--sp-cyan);
          font-size: 13px;
        }

        .sp-message.error {
          border-color: rgba(255,102,138,.5);
          background: rgba(255,102,138,.07);
          color: #ff668a;
        }

        .sp-guide-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 0;
          border-bottom: 1px solid #252d48;
        }

        .sp-guide-item:last-child { border-bottom: 0; }

        .sp-guide-icon {
          display: grid;
          place-items: center;
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(255,43,214,.25);
          border-radius: 5px;
          background: rgba(255,43,214,.1);
          font-size: 17px;
        }

        .sp-guide-item strong {
          display: block;
          margin-bottom: 5px;
          color: #fff;
          font-size: 13px;
        }

        .sp-guide-item p {
          margin: 0;
          color: var(--sp-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .sp-tip {
          margin-top: 20px;
          padding: 16px;
          border: 1px solid rgba(0,229,255,.3);
          border-radius: 7px;
          background: rgba(0,229,255,.05);
          color: var(--sp-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .sp-tip strong { color: var(--sp-cyan); }

        .sp-saved { margin-top: 24px; }

        .sp-saved-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
        }

        .sp-saved h2 {
          margin: 20px 0 10px;
          font-size: 23px;
        }

        .sp-saved p {
          color: var(--sp-muted);
          font-size: 13px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .sp-saved a {
          color: var(--sp-cyan);
          text-decoration: none;
          overflow-wrap: anywhere;
        }

        .sp-saved a:hover {
          color: var(--sp-pink);
          text-decoration: underline;
        }

        .sp-edit { margin-top: 10px; }

        .sp-locked {
          margin-bottom: 24px;
          padding: 38px 24px;
          border: 1px solid rgba(255,43,214,.4);
          border-radius: 10px;
          background: rgba(255,43,214,.06);
          text-align: center;
        }

        .sp-locked h2 { color: var(--sp-pink); }

        .sp-locked p {
          color: var(--sp-muted);
          line-height: 1.8;
        }

        @media (max-width: 800px) {
          .sp-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 520px) {
          .submission-page { padding: 24px 15px; }
          .sp-card { padding: 19px; }
          .sp-hero h1 { font-size: 35px; }
        }
      `}</style>

      <div className="sp-container">
        <header className="sp-hero">
          <span className="sp-eyebrow">
            YOUR IDEAS. YOUR CREATION.
          </span>

          <h1>
            GAME <span>SUBMISSION</span>
          </h1>

          <p>
            Bring your creativity to life.
            <br />
            Submit your game and showcase what your team has built.
          </p>
        </header>

        {isOpen && isEditing ? (
          <div className="sp-grid">
            <section className="sp-card">
              <span className="sp-status">
                ● SUBMISSIONS OPEN
              </span>

              <h2>
                {savedGame ? "Edit Your Game Submission" : "Create Your Game Submission"}
              </h2>

              <p className="sp-subtitle">
                Enter your team's game information below.
                Required fields are marked with an asterisk.
              </p>

              {message && (
                <div className="sp-message error">
                  {message}
                </div>
              )}

              <form
                className="sp-form"
                onSubmit={handleSave}
                noValidate
              >
                <label htmlFor="game-title">
                  Game Title <span className="sp-required">*</span>
                </label>

                <input
                  id="game-title"
                  name="title"
                  value={game.title}
                  onChange={handleChange}
                  placeholder="Enter your game title"
                  className={errors.title ? "sp-invalid" : ""}
                />

                {errors.title && (
                  <span className="sp-error">{errors.title}</span>
                )}

                <label htmlFor="game-description">
                  Game Description <span className="sp-required">*</span>
                </label>

                <textarea
                  id="game-description"
                  name="description"
                  value={game.description}
                  onChange={handleChange}
                  placeholder="Describe your game, its features and how to play..."
                  className={errors.description ? "sp-invalid" : ""}
                />

                {errors.description && (
                  <span className="sp-error">{errors.description}</span>
                )}

                <label htmlFor="game-repo">
                  GitHub Repository URL <span className="sp-required">*</span>
                </label>

                <input
                  id="game-repo"
                  type="url"
                  name="repoUrl"
                  value={game.repoUrl}
                  onChange={handleChange}
                  placeholder="https://github.com/your-team/game"
                  className={errors.repoUrl ? "sp-invalid" : ""}
                />

                {errors.repoUrl && (
                  <span className="sp-error">{errors.repoUrl}</span>
                )}

                <label htmlFor="game-playable">
                  Playable Game URL (Optional)
                </label>

                <input
                  id="game-playable"
                  type="url"
                  name="playableUrl"
                  value={game.playableUrl}
                  onChange={handleChange}
                  placeholder="https://your-game-link.com"
                  className={errors.playableUrl ? "sp-invalid" : ""}
                />

                {errors.playableUrl && (
                  <span className="sp-error">{errors.playableUrl}</span>
                )}

                <label htmlFor="game-video">
                  Demo Video URL (Optional)
                </label>

                <input
                  id="game-video"
                  type="url"
                  name="videoUrl"
                  value={game.videoUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/your-demo"
                  className={errors.videoUrl ? "sp-invalid" : ""}
                />

                {errors.videoUrl && (
                  <span className="sp-error">{errors.videoUrl}</span>
                )}

                <span className="sp-hint">
                  You can provide a YouTube or other accessible video link.
                </span>

                <button
                  type="submit"
                  className="sp-submit"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "✦ Save Game Submission"}
                </button>

                <button
                  type="button"
                  className="sp-button sp-cancel"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </button>
              </form>
            </section>

            <aside>
              <section className="sp-card">
                <h2>Submission Guide</h2>

                <p className="sp-subtitle">
                  Remember these things before submitting your game.
                </p>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">🎮</div>
                  <div>
                    <strong>Original Game</strong>
                    <p>Submit your team's own completed game project.</p>
                  </div>
                </div>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">💻</div>
                  <div>
                    <strong>GitHub Repository</strong>
                    <p>Make sure your repository link is accessible.</p>
                  </div>
                </div>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">🚀</div>
                  <div>
                    <strong>Playable Link</strong>
                    <p>Provide a working link so judges can test your game.</p>
                  </div>
                </div>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">🎥</div>
                  <div>
                    <strong>Demo Video</strong>
                    <p>Include a demonstration video if available.</p>
                  </div>
                </div>
              </section>

              <div className="sp-tip">
                <strong>✦ PRO TIP</strong>
                <br />
                Check all your links before submitting. Make sure
                your game is ready for the judges!
              </div>
            </aside>
          </div>
        ) : (
          <>
            {!isOpen && (
              <section className="sp-locked">
                <div className="sp-lock-icon">🔒</div>
                <h2>Submissions Are Closed</h2>
                <p>
                  The game submission period is not currently open.
                  <br />
                  You can view your existing submission,
                  but you cannot create or edit it.
                </p>
              </section>
            )}

            {savedGame ? (
              <section className="sp-card sp-saved">
                <div className="sp-saved-head">
                  <span className="sp-saved-badge">
                    ✓ SAVED SUBMISSION
                  </span>
                </div>

                <h2>🎮 {savedGame.title}</h2>
                <p>{savedGame.description}</p>

                <p>
                  <strong>GitHub Repository: </strong>
                  <a href={savedGame.repoUrl} target="_blank" rel="noreferrer">
                    {savedGame.repoUrl}
                  </a>
                </p>

                <p>
                  <strong>Playable Game: </strong>
                  {savedGame.playableUrl ? (
                    <a href={savedGame.playableUrl} target="_blank" rel="noreferrer">
                      {savedGame.playableUrl}
                    </a>
                  ) : "Not provided"}
                </p>

                <p>
                  <strong>Demo Video: </strong>
                  {savedGame.videoUrl ? (
                    <a href={savedGame.videoUrl} target="_blank" rel="noreferrer">
                      {savedGame.videoUrl}
                    </a>
                  ) : "Not provided"}
                </p>

                {message && (
                  <div className="sp-message">{message}</div>
                )}

                {isOpen && (
                  <button
                    type="button"
                    className="sp-button sp-edit"
                    onClick={handleEdit}
                  >
                    ✎ Edit Submission
                  </button>
                )}
              </section>
            ) : (
              <section className="sp-card sp-saved">
                <h2>No Game Submission Yet</h2>
                <p>Your team has not submitted a game yet.</p>

                {isOpen && (
                  <button
                    type="button"
                    className="sp-button sp-edit"
                    onClick={() => {
                      setGame(emptyGame);
                      setMessage("");
                      setErrors({});
                      setIsEditing(true);
                    }}
                  >
                    ✦ Create Your Game Submission
                  </button>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}