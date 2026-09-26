---
name: LoneDWispOverlayAgent
description: Describe what this custom agent does and when to use it.
argument-hint: The inputs this agent expects, e.g., "a task to implement" or "a question to answer".
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

<!-- Tip: Use /create-agent in chat to generate content with agent assistance -->

- Components folder is src/Components
- Hooks folder is src/Hooks
- All CSS colors must be inside src/styles.css inside the :root as variables. No colors must be used inside other css files, use the variables instead.
- Read all local README.md files if they exist in the directory you currently reading or writting. Always look in the parent folder for README.md files as well
- useEffects must allways be isolated in custom hooks. Futher instructions `.github\agents\rules\customHooks.md`
- custom hooks must always follow the instructions inside: `.github\agents\rules\customHooks.md`
- hooks must always have a single and well defined reponsability