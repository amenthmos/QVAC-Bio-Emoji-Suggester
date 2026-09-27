# QVAC Bio Emoji Suggester

Enter a few interests or hobbies and an on-device AI suggests emoji for your social media bio. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32039

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

Type a comma-separated list of interests or hobbies and submit it. The server sends the model a short system prompt plus two few-shot examples so it learns to reply with a plain string of emoji instead of words. The streamed reply is scanned with a unicode emoji range regex to pull out just the emoji characters (dropping any stray words the model might add). If no emoji were found or the model output looks like a refusal, a small built-in keyword-to-emoji lookup table matches the interests you typed instead, so the page never comes back empty.

**Example**

- Input: `hiking, coffee, photography, dogs`
- Output: `🥾 ☕ 📷 🐶 🌄 🌲`

## License

MIT
