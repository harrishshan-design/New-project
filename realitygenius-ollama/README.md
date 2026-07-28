# RealityGenius AI — Ollama Local Model

Local Ollama setup for RealityGenius AI, a property and business assistant for buyers, agents, admins, and the RealityGenius founder.

## Folder structure

```
realitygenius-ollama/
├── Modelfile
├── system-prompt.md
├── knowledge/
│   ├── platform-information.md
│   ├── agent-guidelines.md
│   └── property-rules.md
└── README.md
```

- **Modelfile** — the Ollama build definition (base model, parameters, and system prompt) used by `ollama create`.
- **system-prompt.md** — the full reference version of the system prompt (source of truth; the Modelfile's `SYSTEM` block is a condensed copy of this).
- **knowledge/** — supporting reference docs for the assistant's domain knowledge. These aren't auto-loaded by Ollama; paste relevant sections into the Modelfile's `SYSTEM` block or your app's retrieval layer as needed.

## Setup

Requires [Ollama](https://ollama.com) installed locally.

```bash
ollama pull llama3.2
ollama create realitygenius-ai -f Modelfile
ollama run realitygenius-ai
```

`ollama create` builds a customized model from the instructions in the Modelfile — it does **not** fine-tune or retrain the underlying model weights. Swap `llama3.2` in the Modelfile's `FROM` line for any other model already installed locally.

## Updating the assistant's behavior

Edit `system-prompt.md` for the full policy reference, then update the `SYSTEM` block in `Modelfile` to match, and rebuild:

```bash
ollama create realitygenius-ai -f Modelfile
```
