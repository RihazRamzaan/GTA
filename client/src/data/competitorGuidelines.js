// Official Competitor Guidelines from docs/GAMORA_2026_Official_Competitor_Guidelines.md

export const competitorGuidelines = {
  title: 'GAMORA 2026 — Official Competitor Guidelines',
  subtitle: 'Game Development Buildathon: Competition Rules, Evaluation and Submission',
  overview: {
    period: '10 days',
    teamSize: '2-4 members',
    gameType: 'Single player',
    topicAnnouncement:
      'The official game development topic and challenge requirements will be shared one day before the development period begins. The topic is not disclosed in this document.',
    assetSummary:
      'Teams may use their own assets and third-party assets where legally permitted. However, every team must also incorporate the official assets provided by the organizing committee into its submitted game.',
  },
  sections: [
    {
      id: 'competition-format',
      number: '01',
      title: 'Competition Format',
      intro:
        'The buildathon challenges teams to design, develop and submit a playable game based on an official topic announced by the organizers. Phase 1 is evaluated remotely from submitted materials; only finalist teams attend the final-day evaluation. This document does not reveal the topic.',
      table: {
        headers: ['Rule', 'Requirement'],
        rows: [
          [
            'Topic announcement',
            'The official topic and challenge brief will be announced one day before the development period starts.',
          ],
          [
            'Planning period',
            'Teams may review the announced brief, clarify requirements and discuss plans on the announcement day. Development work may begin only at the official start time.',
          ],
          [
            'Development window',
            'Each team has 10 days from the official development start time to complete its entry.',
          ],
          [
            'Team composition',
            '2-4 members per team. Members should contribute meaningfully and be ready to explain their work.',
          ],
          [
            'Game format',
            'Single-player only. The game must be demonstrable offline.',
          ],
          [
            'Allowed engines',
            'Unreal Engine or Unity only. Other game engines are not permitted.',
          ],
        ],
      },
    },
    {
      id: 'topic-creative-freedom',
      number: '02',
      title: 'Topic and Creative Freedom',
      intro:
        'The official challenge brief released by the organizers will define the required theme, gameplay objectives and any mandatory features. All entries must meet those requirements.',
      bullets: [
        'Teams may propose original mechanics, level layouts, progression systems, AI behavior, puzzles and player interactions consistent with the announced topic.',
        'Creativity, game balance, accessibility and clarity of player feedback are encouraged.',
        'Additional features are optional; a stable, polished experience is preferred over an unfinished collection of mechanics.',
        'Any topic-specific requirements announced in the official brief take precedence over general examples in these guidelines.',
      ],
    },
    {
      id: 'mandatory-technical-conditions',
      number: '03',
      title: 'Mandatory Technical Conditions',
      bullets: [
        'Use Unity or Unreal Engine and submit a functioning single-player game.',
        'Provide an offline playable packaged build. A live demonstration is required only for finalists in Phase 2.',
        'Include clear player controls, a start/restart flow and enough feedback for judges to understand the game.',
        'Deliver an understandable gameplay objective, meaningful progression and an identifiable outcome, consistent with the announced topic.',
        'Test the game on the stated target hardware and resolve game-breaking issues before submission.',
      ],
    },
    {
      id: 'official-asset-policy',
      number: '04',
      title: 'Official Asset Usage Policy',
      intro:
        'Teams may use their own assets, and the official organizer-provided assets are mandatory. The organizing committee will distribute an asset pack. Each submitted game must meaningfully incorporate relevant assets from this pack.',
      table: {
        headers: ['Permitted', 'Requirements / Restrictions'],
        rows: [
          [
            'Use organizer-provided models, textures, animations, audio and other supplied assets.',
            'Organizer-provided assets must be included in the actual playable game, not just the project folder or video.',
          ],
          [
            'Use self-created or legally sourced third-party assets, including models, textures, sounds and animations.',
            'Teams are responsible for complying with licenses and intellectual property rights.',
          ],
          [
            'Modify, recolor, combine, animate and optimize both their own and organizer-provided assets.',
            'Modifications must not remove the requirement to meaningfully use organizer-provided assets.',
          ],
          [
            'Use Blender, Maya, engine-native primitives, lights, cameras, physics, UI and other technical features.',
            'Asset choices and any AI-generated content must comply with the AI policy and be disclosed where applicable.',
          ],
        ],
      },
      callout: {
        label: 'Clarification',
        text: 'Teams are free to supplement the official asset pack with their own assets. Using only self-sourced assets without incorporating the organizer-provided assets does not meet the requirement.',
      },
    },
    {
      id: 'ai-tool-policy',
      number: '05',
      title: 'AI Tool Policy',
      bullets: [
        'AI tools are allowed for coding assistance, debugging, explanations, technical planning and gameplay logic.',
        'AI-assisted asset creation is permitted, provided outputs comply with applicable rights and licenses and the team discloses significant use.',
        'Teams must understand their implementation and disclose significant AI assistance in their submission.',
        'Responsibility for originality, functionality, licensing and rule compliance remains with the team.',
      ],
    },
    {
      id: 'fair-play-compliance',
      number: '06',
      title: 'Fair Play and Compliance',
      bullets: [
        'No game implementation work may start before the official development start time.',
        'Pre-existing gameplay systems, templates or completed projects may not be brought into the challenge unless expressly authorized by the organizers. Pre-existing art assets may be used under the asset policy.',
        'All teams must follow the same development window and must meaningfully use the organizer-provided assets.',
        'The organizing committee may inspect project files, asset sources and implementation history to check compliance.',
        'Rule violations may lead to point deductions or disqualification, depending on severity.',
      ],
    },
    {
      id: 'phase-1-evaluation',
      number: '07',
      title: 'Phase 1 — Development and Initial Evaluation',
      intro:
        'The development period is 10 days. Phase 1 is a submission-based evaluation worth 100 points. There is no physical presentation or live demonstration in Phase 1. Judges review the uploaded playable game, pre-recorded gameplay video, project files and supporting documentation. The top 5 teams qualify for Phase 2.',
      subsections: [
        {
          title: 'Phase 1 — Required Google Drive Submission',
          desc: 'Each team must upload all items below to a Google Drive folder and share the folder link with the organizing committee by the official deadline.',
          table: {
            headers: ['Required Item', 'Description'],
            rows: [
              [
                'Packaged game',
                'Complete offline playable packaged game/build, including necessary files and launch instructions.',
              ],
              [
                'Pre-recorded gameplay video',
                'A 5-minute gameplay recording showing the actual submitted game and its key features.',
              ],
              [
                'Supporting document',
                'A concise document covering game overview, controls, setup, technical features, known limitations, team contributions, and organizer-provided / self-sourced assets and AI usage.',
              ],
              [
                'Complete game project',
                'Full Unreal Engine project files (or the corresponding complete Unity project if Unity is the chosen permitted engine).',
              ],
              [
                'Google Drive link',
                'One accessible folder link containing all required deliverables. Check sharing permissions before submitting.',
              ],
            ],
          },
        },
        {
          title: 'Phase 1 — Judging Criteria Overview (100 Points Total)',
          table: {
            headers: ['Category', 'Max Points'],
            rows: [
              ['Game Design and Gameplay', '60'],
              ['Game Optimization', '20'],
              ['Submitted Gameplay Video and Documentation', '20'],
            ],
            total: ['Total', '100'],
          },
        },
        {
          title: 'Game Design & Gameplay — 60 Points',
          table: {
            headers: ['Criterion', 'Points'],
            rows: [
              ['Gameplay mechanics and functional completeness', '15'],
              ['Creativity and originality', '10'],
              ['Level and environment design', '10'],
              ['AI programming and behavioral systems', '8'],
              ['Puzzle / challenge design', '7'],
              ['UI and UX design', '5'],
              ['Gameplay balance, pacing and engagement', '5'],
            ],
            total: ['Subtotal', '60'],
          },
        },
        {
          title: 'Optimization — 20 Points',
          table: {
            headers: ['Criterion', 'Points'],
            rows: [
              ['Frame rate, responsiveness and runtime stability', '8'],
              ['Efficient assets, textures and memory usage', '5'],
              ['Rendering, lighting and scene efficiency', '4'],
              ['Loading behavior and technical reliability', '3'],
            ],
            total: ['Subtotal', '20'],
          },
        },
        {
          title: 'Submitted Video & Documentation — 20 Points',
          table: {
            headers: ['Criterion', 'Points'],
            rows: [
              ['Gameplay clarity and demonstration in the 5-minute recording', '8'],
              ['Technical explanation in the supporting document', '5'],
              ['Design decisions and development challenges documented', '4'],
              ['Team contributions and submission completeness', '3'],
            ],
            total: ['Subtotal', '20'],
          },
        },
      ],
    },
    {
      id: 'phase-2-evaluation',
      number: '08',
      title: 'Phase 2 — Final Evaluation',
      intro:
        'The top 5 teams selected in Phase 1 advance to the final day. Each finalist team receives 30 minutes for an in-person evaluation.',
      table: {
        headers: ['Final-Day Activity', 'Duration'],
        rows: [
          ['Game presentation and live demonstration', '20 minutes'],
          ['Judging panel questions and answers (Q&A)', '10 minutes'],
        ],
        total: ['Total', '30 minutes'],
      },
      note: 'The judging panel will determine the final rankings following Phase 2.',
    },
    {
      id: 'submission-access-rules',
      number: '09',
      title: 'Submission and Access Rules',
      bullets: [
        'Only the shared Google Drive submission is required for Phase 1; teams do not attend a physical presentation or demonstration.',
        'The 5-minute recording must show gameplay from the submitted build, not an unrelated concept or mock-up.',
        'Ensure the packaged game, supporting document and complete project are accessible in the linked folder.',
        'Teams are responsible for validating the Drive link permissions and the integrity of all uploaded files.',
        'Phase 2 live presentation and Q&A apply only to the five qualified teams.',
      ],
    },
    {
      id: 'development-guidance',
      number: '10',
      title: 'Development Guidance (Suggested 10-Day Plan)',
      intro:
        'The 10-day development period may be organized as follows. This is a suggested plan, not a mandatory schedule.',
      table: {
        headers: ['Days', 'Recommended Focus'],
        rows: [
          ['1–2', 'Interpret the announced challenge, allocate roles and prototype core gameplay.'],
          ['3–4', 'Implement primary game systems, interactions and progression.'],
          ['5–6', 'Develop challenge-specific mechanics, AI, levels and content.'],
          ['7–8', 'Improve usability, balance, performance and overall polish.'],
          ['9–10', 'Test the full game, record the 5-minute gameplay video, prepare files and submit the Google Drive link.'],
        ],
      },
      callout: {
        label: 'Final note',
        text: 'The detailed game topic, mission requirements and mandatory organizer-provided asset pack will be distributed separately during the official topic announcement. Teams may add their own assets under Section 04. The organizing committee will communicate exact deadlines and the Drive-link submission procedure.',
      },
    },
  ],
};

