# ⚡ All-In-One Site Audit & Quality Report

> **Verdict:** F (Pure Slop) | **Overall Score:** 0/100 | **Slop Index:** 100/100
> **Standards Active:** `slop.md` • `BraveBrand` • `lets-scroll` • `HyperFrames` • `Remotion`

## 1. Absolute Execution Laws (Hard Gates)

| ID | Law | Status | Evidence / Location |
| :--- | :--- | :--- | :--- |
| M1 | **Content Visible by Default** | ❌ FAIL | `css/work.css:195` |
| X2 | **Clear the Cut** | ✅ PASS | Verified Clean |
| X3 | **Parallel Baseline Anchors** | ✅ PASS | Verified Clean |
| X1 | **Real Optical Centering** | ✅ PASS | Verified Clean |
| X5 | **Legible Contrast & Accessible Focus** | ❌ FAIL | `nuvio/src/index.css:290` |
| M8 | **Functional Controls** | ❌ FAIL | `nuvio/src/pages/Landing.jsx:237` |

## 2. Confirmed Slop Tells & Prescriptions

| ID | Severity | Tell | Location | Fix Prescription |
| :--- | :--- | :--- | :--- | :--- |
| `W1` | **MINOR** | AI Em-Dash Overuse | `projects/pavilhao-sereno.html:132` | Break up em-dash-heavy copy into short human fragments or colons. |
| `W1` | **MINOR** | AI Em-Dash Overuse | `projects/casa-mouraria.html:132` | Break up em-dash-heavy copy into short human fragments or colons. |
| `C1` | **MAJOR** | Blue-to-Purple Gradient | `nuvio/tailwind.config.js:26` | Replace generic blue-purple gradient with intentional monochromatic value shift or warm tone. |
| `C1` | **MAJOR** | Blue-to-Purple Gradient | `nuvio/src/index.css:234` | Replace generic blue-purple gradient with intentional monochromatic value shift or warm tone. |
| `C5` | **MAJOR** | Symmetrical Glow Halo | `nuvio/src/index.css:362` | Light must come from a directional source (e.g. top-left rake), never a concentric center bloom. |
| `T1` | **MAJOR** | Google-Shelf Default Signature Font | `nuvio/src/index.css:53` | Choose high-personality display type (e.g. Gambarino, Clash, Sentient, Cabinet Grotesk). |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/components/auth/GoogleSelector.jsx:97` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/components/admin/SocialMatrix.jsx:129` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/components/admin/AuditLogs.jsx:81` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/components/studyverse/TriviaBingo.jsx:123` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/components/studyverse/SubjectUno.jsx:131` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/components/studyverse/EduLudo.jsx:96` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `W1` | **MINOR** | AI Em-Dash Overuse | `nuvio/src/pages/Landing.jsx:413` | Break up em-dash-heavy copy into short human fragments or colons. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Landing.jsx:298` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Onboarding.jsx:71` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/FocusTimer.jsx:118` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `M2` | **MINOR** | Button / Card Hover Boop | `nuvio/src/pages/FocusTimer.jsx:121` | Buttons and cards should not jump on hover. Use subtle color/surface shifts or icon slides. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Profile.jsx:208` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `M2` | **MINOR** | Button / Card Hover Boop | `nuvio/src/pages/Profile.jsx:219` | Buttons and cards should not jump on hover. Use subtle color/surface shifts or icon slides. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Calendar.jsx:312` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Admin.jsx:63` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/LearningGroups.jsx:106` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Messages.jsx:35` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Homework.jsx:243` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Achievements.jsx:102` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Dashboard.jsx:416` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `M2` | **MINOR** | Button / Card Hover Boop | `nuvio/src/pages/Dashboard.jsx:444` | Buttons and cards should not jump on hover. Use subtle color/surface shifts or icon slides. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/UserProfile.jsx:179` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/JourneyMap.jsx:402` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `C1` | **MAJOR** | Blue-to-Purple Gradient | `nuvio/src/pages/BossRaid.jsx:145` | Replace generic blue-purple gradient with intentional monochromatic value shift or warm tone. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/BossRaid.jsx:190` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/TriviaGame.jsx:333` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/KnowledgeMap.jsx:151` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `M2` | **MINOR** | Button / Card Hover Boop | `nuvio/src/pages/KnowledgeMap.jsx:118` | Buttons and cards should not jump on hover. Use subtle color/surface shifts or icon slides. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/StudyVerse.jsx:151` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SeasonalPass.jsx:103` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/StudySites.jsx:119` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/Flashcards.jsx:202` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `M2` | **MINOR** | Button / Card Hover Boop | `nuvio/src/pages/Flashcards.jsx:124` | Buttons and cards should not jump on hover. Use subtle color/surface shifts or icon slides. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/StudyHub.jsx:84` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/RevisionSuite.jsx:93` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/PracticeArena.jsx:83` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/MasteryChallenge.jsx:151` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/WorkedExamples.jsx:62` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/CheatsheetDrawer.jsx:34` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/ChapterIntro.jsx:26` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/LearningBlocks.jsx:47` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/index.jsx:333` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `C5` | **MAJOR** | Symmetrical Glow Halo | `nuvio/src/pages/SubjectLibrary/ChapterCompletion.jsx:45` | Light must come from a directional source (e.g. top-left rake), never a concentric center bloom. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/ChapterCompletion.jsx:76` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/ConceptExplorer.jsx:303` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/HeronExplorer.jsx:54` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/Class6MathSandbox.jsx:30` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/Class9ScienceSandbox.jsx:47` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/NarrativeMap.jsx:15` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/CartesianPlotter.jsx:24` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/CellExplorer.jsx:228` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/MotionSimulator.jsx:56` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/AtomExplorer.jsx:40` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/SeparationLab.jsx:235` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `K13` | **MINOR** | Hard 1px Contrasting Outline on Everything | `nuvio/src/pages/SubjectLibrary/Sandboxes/Class6ScienceSandbox.jsx:447` | Use tonal surface value shifts and soft inner highlights instead of hard 1px outlines everywhere. |
| `W1` | **MINOR** | AI Em-Dash Overuse | `nuvio/src/services/curriculumData.js:1837` | Break up em-dash-heavy copy into short human fragments or colons. |
| `W2` | **MINOR** | AI Copy Buzzwords | `nuvio/src/services/curriculumData.js:533` | Rewrite boilerplate marketing filler with crisp, specific, authentic product claims. |

## 3. Mandatory Architectural Redesign Protocol

> [!IMPORTANT]
> **Cosmetic Patching is Banned:** Swapping shapes or colors on a generic template is still slop.
> A proper redesign requires full structural re-architecture:

1. **Demolish Centered Hero Stack:** Replace with composed asymmetry or editorial split-screen.
2. **Commit to the Art Bible:** Signature display face (Fontshare), unexpected directional palette, bespoke silhouettes.
3. **Build the Signature Focal Artifact:** Anchor with high-effort custom asset (interactive SVG, 3D, Remotion/HyperFrames motion).
4. **Continuous Composed Atmosphere:** Carry volumetric light, texture, and grain down the entire scroll.
