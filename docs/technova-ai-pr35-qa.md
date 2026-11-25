# TechNova AI Quiz Generator — PR #35 QA

## Scope
- Adds a browser-only quiz generator below the existing assistant.
- User pastes their own notes; the tool creates multiple-choice and/or true/false questions using deterministic sentence and keyword rules.
- Supports easy, medium and hard keyword selection, 5/10/15 questions, immediate feedback, explanations, progress and final scoring.
- Source text and answers remain in page memory only; no upload, external API, local storage, Supabase or paid AI service.

## Manual QA
1. Open the AI Assistant page and confirm the Quiz Generator appears below the existing assistant.
2. Confirm the existing chat, history, document tools, quick tools, Writing Studio and answer controls still appear and work.
3. Paste at least three complete sentences with varied keywords.
4. Generate a mixed quiz at each difficulty and confirm both question types appear.
5. Generate multiple-choice-only and true/false-only quizzes.
6. Try 5, 10 and 15 questions; confirm the generator reports when there is insufficient source text.
7. Select an answer, check it, and confirm feedback and source-based explanation appear.
8. Complete the quiz and confirm the score and percentage are correct.
9. Use Try again and Create another quiz.
10. Test keyboard navigation, visible focus, narrow/mobile layout and screen-reader announcements.
11. Refresh the page and confirm pasted notes and quiz answers were not persisted.

## Limitations
- This is not a generative AI model. It uses simple sentence extraction, keyword blanks and word substitutions; some distractors may be awkward or ambiguous.
- Difficulty changes keyword selection heuristics, not an independently validated educational difficulty level.
- Use clear notes with complete sentences. Very short, fragmented or highly technical notation may not produce good questions.
- Review the source notes and explanations; the tool is a revision aid, not an authoritative assessment.
- Automated syntax/static checks do not replace manual browser testing.
