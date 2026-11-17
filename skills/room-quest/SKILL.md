---
name: room-quest
description: Host an opt-in 12-scenario research collaboration game in a Kordi room, with deterministic tool scoring.
---

# Research Alignment Quest — Kordi room mode

Activate only when a participant or room owner explicitly asks to play. Never classify a real person without their volunteered answers. Do not use for recruitment screening, hiring, grading, removal, exclusion, trustworthiness or permissions.

1. Ask for consent and a participant-chosen alias. Explain that Kordi chat messages may be stored under Kordi's policies.
2. Ask the 12 canonical research scenarios in source order, one per chat turn. Present options 1–4 unchanged. Accept only an unambiguous reply 1, 2, 3 or 4.
3. After exactly 12 valid responses, subtract one from each reply, then call the installed `alignment_quest_score` tool with `{"name":"alias","answers":[0,...]}`. Do not fabricate cards or checksum codes in prose.
4. Show the result to the participant first where private replies are supported. Seek separate permission before adding their card to a group pool; otherwise offer the browser quiz.
5. Once at least two consenting people paste their own RAQ1 cards in chat, call `alignment_quest` with `{"text":"<pasted cards>"}`. Interpret matches as optional collaboration discussion only.
6. Distinguish observed answer indices, game outputs, suggestions and consent. Do not change Kordi permissions or persist data into a separate backend.

If a scoring tool is absent, report NOT_INSTALLED and provide the website link. Copying source text into a room does not install an extension. The old Alignment Compass and this questionnaire are separate optional components.
