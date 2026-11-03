
import { useState } from "react";

export default function SubmissionPage() {
  const exampleGame = {
    title: "Cyber Quest",
    description:
      "A cyberpunk adventure game where players solve puzzles and explore a futuristic world.",
    repoUrl: "https://github.com/octocat/Hello-World",
    playableUrl: "https://example.com",
    videoUrl: "",
  };

  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [game, setGame] = useState({ ...exampleGame });
  const [savedGame, setSavedGame] = useState({ ...exampleGame });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

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
    } else if (!isValidUrl(game.repoUrl)) {
      nextErrors.repoUrl = "Please enter a valid GitHub URL.";
    } else if (!game.repoUrl.toLowerCase().includes("github.com")) {
      nextErrors.repoUrl = "Please enter a GitHub repository link.";
    }

    if (game.playableUrl.trim() && !isValidUrl(game.playableUrl)) {
  nextErrors.playableUrl = "Please enter a valid playable game URL.";
}

    

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSave(event) {
    event.preventDefault();

    if (!validateForm()) {
      setMessage("Please correct the highlighted fields.");
      return;
    }

    setSavedGame({ ...game });
    setIsEditing(false);
    setErrors({});
    setMessage("Your sample game submission has been saved successfully!");
  }

  function handleEdit() {
    if (!isOpen) return;

    setGame({ ...savedGame });
    setErrors({});
    setMessage("");
    setIsEditing(true);
  }

  function handleCancel() {
    setGame({ ...savedGame });
    setErrors({});
    setMessage("");
    setIsEditing(false);
  }

  function changePreview(open) {
    setIsOpen(open);
    setIsEditing(false);
    setMessage("");
    setErrors({});
  }

  return (
    <main className="submission-page">
      <style>{`
        .submission-page {
          --sp-bg: #080a1c;
          --sp-panel: rgba(13, 17, 39, .92);
          --sp-cyan: #00d9f5;
          --sp-pink: #f725d8;
          --sp-text: #f5f7ff;
          --sp-muted: #aab3c8;
          --sp-line: rgba(0, 217, 245, .24);

          min-height: 100vh;
          padding: 34px 6%;
          box-sizing: border-box;
          color: var(--sp-text);

          background:
            radial-gradient(
              ellipse at 85% 4%,
              rgba(0,217,245,.13),
              transparent 32%
            ),
            radial-gradient(
              ellipse at 8% 55%,
              rgba(247,37,216,.11),
              transparent 34%
            ),
            var(--sp-bg);

          font-family: "Rajdhani", system-ui, sans-serif;
        }

        .submission-page * {
          box-sizing: border-box;
        }

        .sp-logo,
        .sp-hero h1,
        .sp-card h2,
        .sp-locked h2 {
          font-family: "Orbitron", system-ui, sans-serif;
        }

        .sp-container {
          width: 100%;
          max-width: 1150px;
          margin: 0 auto;
        }

        .sp-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 20px;
          margin-bottom: 48px;
          border-bottom: 1px solid var(--sp-line);
        }

        .sp-logo {
          color: #fff;
          font-size: 23px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .sp-logo span {
          color: var(--sp-pink);
        }

        .sp-tag,
        .sp-status,
        .sp-saved-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border: 1px solid var(--sp-line);
          border-radius: 5px;
          background: rgba(0,217,245,.07);
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
          letter-spacing: 1px;
        }

        .sp-hero h1 span {
          color: var(--sp-cyan);
        }

        .sp-hero p {
          color: var(--sp-muted);
          font-size: 15px;
          line-height: 1.8;
          margin: 0;
        }

        .sp-preview-controls {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin: 0 0 28px;
        }

        .sp-button {
          border: 1px solid var(--sp-pink);
          border-radius: 5px;
          padding: 11px 17px;
          color: var(--sp-pink);
          background: transparent;
          font: inherit;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s ease;
        }

        .sp-button:hover,
        .sp-button.active {
          background: var(--sp-pink);
          color: #fff;
          box-shadow: 0 0 18px rgba(247,37,216,.3);
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

        .sp-required {
          color: var(--sp-pink);
        }

        .sp-form input,
        .sp-form textarea {
          display: block;
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #303955;
          border-radius: 5px;
          outline: none;
          background: #080a1c;
          color: #fff;
          font: inherit;
          font-size: 14px;
          transition: border-color .2s, box-shadow .2s;
        }

        .sp-form textarea {
          min-height: 118px;
          resize: vertical;
          line-height: 1.6;
        }

        .sp-form input:focus,
        .sp-form textarea:focus {
          border-color: var(--sp-cyan);
          box-shadow: 0 0 0 3px rgba(0,217,245,.1);
        }

        .sp-form input::placeholder,
        .sp-form textarea::placeholder {
          color: #77819b;
        }

        .sp-invalid {
          border-color: #ff668a !important;
        }

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

        .sp-submit {
          width: 100%;
          margin-top: 25px;
          padding: 14px 18px;
          border: 1px solid var(--sp-pink);
          border-radius: 5px;
          background: var(--sp-pink);
          color: #fff;
          font: inherit;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 0 16px rgba(247,37,216,.2);
          transition: transform .2s, box-shadow .2s;
        }

        .sp-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(247,37,216,.4);
        }

        .sp-cancel {
          margin: 14px 0 0 10px;
        }

        .sp-message {
          margin: 0 0 18px;
          padding: 12px 14px;
          border: 1px solid rgba(0,217,245,.4);
          border-radius: 5px;
          background: rgba(0,217,245,.07);
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

        .sp-guide-item:last-child {
          border-bottom: 0;
        }

        .sp-guide-icon {
          display: grid;
          place-items: center;
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          border: 1px solid rgba(247,37,216,.25);
          border-radius: 5px;
          background: rgba(247,37,216,.1);
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
          border: 1px solid rgba(0,217,245,.3);
          border-radius: 7px;
          background: rgba(0,217,245,.05);
          color: var(--sp-muted);
          font-size: 12px;
          line-height: 1.7;
        }

        .sp-tip strong {
          color: var(--sp-cyan);
        }

        .sp-saved {
          margin-top: 24px;
        }

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

        .sp-edit {
          margin-top: 10px;
          background: var(--sp-pink);
          color: #fff;
        }

        .sp-locked {
          margin-bottom: 24px;
          padding: 38px 24px;
          border: 1px solid rgba(247,37,216,.4);
          border-radius: 10px;
          background: rgba(247,37,216,.06);
          text-align: center;
        }

        .sp-lock-icon {
          margin-bottom: 12px;
          font-size: 38px;
        }

        .sp-locked h2 {
          color: var(--sp-pink);
        }

        .sp-locked p {
          color: var(--sp-muted);
          line-height: 1.8;
        }

        .sp-footer {
          margin-top: 48px;
          padding-bottom: 12px;
          color: #77819b;
          text-align: center;
          font-size: 11px;
          letter-spacing: 1px;
        }

        @media (max-width: 800px) {
          .sp-grid {
            grid-template-columns: 1fr;
          }

          .sp-topbar {
            margin-bottom: 38px;
          }
        }

        @media (max-width: 520px) {
          .submission-page {
            padding: 24px 15px;
          }

          .sp-card {
            padding: 19px;
          }

          .sp-topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .sp-hero h1 {
            font-size: 35px;
          }
        }
      `}</style>

      <div className="sp-container">
        <nav className="sp-topbar">
          <div className="sp-logo">
            BUILD<span>ATHON.</span>
          </div>

          <span className="sp-tag">
            2026 · GAME SUBMISSION
          </span>
        </nav>

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

        <div className="sp-preview-controls">
          <button
            type="button"
            className={`sp-button ${isOpen ? "active" : ""}`}
            onClick={() => changePreview(true)}
          >
            Preview Open State
          </button>

          <button
            type="button"
            className={`sp-button ${!isOpen ? "active" : ""}`}
            onClick={() => changePreview(false)}
          >
            Preview Closed State
          </button>
        </div>

        {isOpen && isEditing ? (
          <div className="sp-grid">
            <section className="sp-card">
              <span className="sp-status">
                ● SUBMISSIONS OPEN
              </span>

              <h2>Edit Your Game Submission</h2>

              <p className="sp-subtitle">
                Enter your team's game information below.
                Required fields are marked with an asterisk.
              </p>

              {message && (
                <div
                  className={`sp-message ${
                    Object.keys(errors).length ? "error" : ""
                  }`}
                >
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

                <button type="submit" className="sp-submit">
                  ✦ Save Sample Submission
                </button>

                <button
                  type="button"
                  className="sp-button sp-cancel"
                  onClick={handleCancel}
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
                    <p>
                      Submit your team's own completed game project.
                    </p>
                  </div>
                </div>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">💻</div>
                  <div>
                    <strong>GitHub Repository</strong>
                    <p>
                      Make sure your repository link is accessible.
                    </p>
                  </div>
                </div>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">🚀</div>
                  <div>
                    <strong>Playable Link</strong>
                    <p>
                      Provide a working link so judges can test your game.
                    </p>
                  </div>
                </div>

                <div className="sp-guide-item">
                  <div className="sp-guide-icon">🎥</div>
                  <div>
                    <strong>Demo Video</strong>
                    <p>
                      Include a demonstration video if available.
                    </p>
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
                  The game submission period has ended.
                  <br />
                  You can view your existing submission,
                  but you cannot create or edit it.
                </p>
              </section>
            )}

            <section className="sp-card sp-saved">
              <div className="sp-saved-head">
                <span className="sp-saved-badge">
                  ✓ SAVED EXAMPLE {isOpen ? "" : "— READ ONLY"}
                </span>

                {isOpen && (
                  <span className="sp-tag">
                    SAMPLE PROJECT
                  </span>
                )}
              </div>

              <h2>🎮 {savedGame.title}</h2>

              <p>{savedGame.description}</p>

              <p>
                <strong>GitHub Repository: </strong>
                <a
                  href={savedGame.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {savedGame.repoUrl}
                </a>
              </p>

              <p>
                <strong>Playable Game: </strong>
                <a
                  href={savedGame.playableUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {savedGame.playableUrl}
                </a>
              </p>

              <p>
                <strong>Demo Video: </strong>

                {savedGame.videoUrl ? (
                  <a
                    href={savedGame.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {savedGame.videoUrl}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>

              {message && (
                <div className="sp-message">
                  {message}
                </div>
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
          </>
        )}

        <footer className="sp-footer">
          BUILDATHON 2026 · CREATE. INNOVATE. COMPETE.
        </footer>
      </div>
    </main>
  );
}

