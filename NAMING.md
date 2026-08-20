# Naming candidates

The site currently uses **Tiltable** as its working name. Before that was
chosen, these eight were drafted as options for the placeholder that used to
sit here — weighted toward easy English pronunciation and a realistic shot
at a usable `.com` (either the exact match or a workable variant —
"Ringo.com" itself is very unlikely to be free at any price; check
availability before committing to any of these). Kept here in case
"Tiltable" doesn't stick and it's worth revisiting.

| Name | Reasoning |
|---|---|
| **Tilt** | One syllable, impossible to mispronounce or misspell from hearing it once, and it names the physical motion directly — but it's a plain dictionary word, so expect to need a variant like `tilttable.com` or `gettilt.com`. |
| **Nudge** | Two easy syllables; "nudge" already carries the right tone of a small, polite request rather than a demand, which matches the "no shouting, no waving" positioning better than most alternatives. |
| **Beacon** | Evokes a light visible from across a room, which is literally the product's core feature; more distinctive than a one-word verb, so slightly better odds on domain availability, though "beacon" is a fairly common tech/SaaS name elsewhere. |
| **Fliq** | A stylized respelling of "flick" — reads and sounds exactly like the familiar word (so pronunciation is a non-issue) while the unusual spelling meaningfully improves `.com` odds, the same trick that worked for names like Flickr. |
| **Tably** | "Table" plus the modern SaaS "-ly" suffix; immediately legible as table-related software, easy to say, and coined enough that the `.com` is plausibly free. |
| **Cue** | Short, easy, and an actual hospitality/theater term for "the signal to act" — strong thematic fit, but it's a homophone of "queue," which risks guests or investors briefly reading it as a waitlist product rather than a call button. |
| **Turnly** | Built from "turn" (as in turning the device over) plus "-ly"; very easy to pronounce, unambiguous once explained, and coined enough to likely be available — the main risk is blending into the sea of other "-ly" SaaS names. |
| **Ringo** | "Ring" (to call/summon) plus a friendly "-o" ending makes it warm and easy to say; the main downside is the unavoidable Beatles association, which could read as a coincidence or a distraction depending on the audience. |

## How to rename again

1. Find-and-replace the literal text `Tiltable` (and lowercase `tiltable`,
   used in CSS variable and class names) across every `.html`, `.css` and
   `.js` file.
2. Update the `PRODUCT_NAME` constant in `assets/js/main.js`.
3. Re-check the `<title>` and Open Graph meta tags on each page — a plain
   find-and-replace will already update them, but re-read them once for
   flow (e.g. "It only buzzes for your tables." doesn't need the name in
   the sentence, but the `<title>` prefix does).
4. If the new name changes the brand color story, update `--tiltable-green`
   and `--tiltable-green-deep` in `assets/css/style.css` (see README.md).
