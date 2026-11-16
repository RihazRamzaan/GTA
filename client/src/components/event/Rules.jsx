import React, { useState } from 'react';
import { competitorGuidelines } from '../../data/competitorGuidelines.js';

export default function Rules() {
  const { overview, sections } = competitorGuidelines;
  const [expandAll, setExpandAll] = useState(false);

  return (
    <section id="rules" className="home-guidelines home-section home-wrap">
      <header data-reveal>
        <p className="home-eyebrow">OFFICIAL COMPETITOR GUIDELINES</p>
        <h2>
          The rulebook.<br />
          <span className="home-outline">Engineered for fair play.</span>
        </h2>
        <p className="home-muted">
          Review the complete competition rules, engine regulations, official asset mandate, Google Drive submission format, and 100-point judging rubrics.
        </p>
      </header>

      {/* Quick Metrics */}
      <div className="guideline-metrics" data-reveal>
        <div className="guideline-metric-card">
          <span className="round-index">01 / SPRINT</span>
          <h3 className="guideline-metric-val">{overview.period}</h3>
          <p className="guideline-metric-desc">
            10 days from kickoff announcement to submission deadline.
          </p>
        </div>

        <div className="guideline-metric-card">
          <span className="round-index">02 / SQUAD</span>
          <h3 className="guideline-metric-val">{overview.teamSize}</h3>
          <p className="guideline-metric-desc">
            Undergraduates contributing meaningfully to the game.
          </p>
        </div>

        <div className="guideline-metric-card">
          <span className="round-index">03 / ENGINE</span>
          <h3 className="guideline-metric-val">{overview.gameType}</h3>
          <p className="guideline-metric-desc">
            Offline playable. Unreal Engine or Unity only.
          </p>
        </div>
      </div>

      {/* Critical Notices */}
      <div className="guideline-notices" data-reveal>
        <div className="guideline-notice-card">
          <span className="round-index">KICKOFF PROTOCOL</span>
          <h3>Topic Announcement</h3>
          <p>{overview.topicAnnouncement}</p>
        </div>

        <div className="guideline-notice-card">
          <span className="round-index">ASSET MANDATE</span>
          <h3>Official Asset Pack Required</h3>
          <p>{overview.assetSummary}</p>
        </div>
      </div>

      {/* Guidelines Toolbar */}
      <div className="guideline-toolbar" data-reveal>
        <span className="guideline-toolbar-title">
          Guidelines &amp; Rubrics ({sections.length} Sections)
        </span>
        <button
          type="button"
          onClick={() => setExpandAll((prev) => !prev)}
          className="guideline-toggle-btn"
        >
          {expandAll ? 'Collapse All Sections ↑' : 'Expand All Sections ↓'}
        </button>
      </div>

      {/* Accordion List */}
      <div className="home-accordions">
        {sections.map((section) => (
          <details
            key={section.id}
            open={expandAll ? true : undefined}
            data-reveal
          >
            <summary>
              <span className="accordion-number">{section.number}</span>
              <span className="accordion-title">{section.title}</span>
              <span className="accordion-plus" aria-hidden="true">
                +
              </span>
            </summary>

            <div className="guideline-content">
              {section.intro && (
                <p className="guideline-intro">{section.intro}</p>
              )}

              {Array.isArray(section.bullets) && section.bullets.length > 0 && (
                <ul className="guideline-bullets">
                  {section.bullets.map((bullet, idx) => (
                    <li key={idx}>{bullet}</li>
                  ))}
                </ul>
              )}

              {section.table && <GuidelineTable table={section.table} />}

              {section.callout && (
                <div className="guideline-callout">
                  <span className="guideline-callout-label">
                    {section.callout.label}
                  </span>
                  <p>{section.callout.text}</p>
                </div>
              )}

              {Array.isArray(section.subsections) &&
                section.subsections.map((sub, sIdx) => (
                  <div key={sIdx} className="guideline-subsection">
                    <h4>{sub.title}</h4>
                    {sub.desc && (
                      <p className="guideline-subsection-desc">{sub.desc}</p>
                    )}
                    {sub.table && <GuidelineTable table={sub.table} />}
                  </div>
                ))}

              {section.note && (
                <div className="guideline-note">
                  <strong>Important Note</strong>
                  {section.note}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function GuidelineTable({ table }) {
  if (!table) return null;
  const isPointsTable =
    table.headers.includes('Max Points') || table.headers.includes('Points');

  return (
    <div className="guideline-table-wrap">
      <table className="guideline-table">
        <thead>
          <tr>
            {table.headers.map((header, hIdx) => {
              const isLastPoints =
                hIdx === table.headers.length - 1 && isPointsTable;
              return (
                <th key={hIdx} className={isLastPoints ? 'col-points' : ''}>
                  {header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => {
                const isPrimary = cIdx === 0;
                const isPoints = cIdx === row.length - 1 && isPointsTable;
                return (
                  <td
                    key={cIdx}
                    className={`${isPrimary ? 'col-primary' : ''} ${
                      isPoints ? 'col-points' : ''
                    }`}
                  >
                    {cell}
                  </td>
                );
              })}
            </tr>
          ))}
          {table.total && (
            <tr className="row-total">
              <td className="col-primary">{table.total[0]}</td>
              <td className={isPointsTable ? 'col-points' : ''}>
                {table.total[1]}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
