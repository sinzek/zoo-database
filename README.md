# Zoo Database Project (Team 10)

## Learn

We'll be using Vite for a frontend dev server. Learn more about it here:
<https://vite.dev/guide/>

We're also using react to add 'reactivity' and 'componentization' to our website. Read about those here:
<https://react.dev/learn>

For our backend, we'll be using Node.js. It's a rabbit hole, so here's a quick guide:
<https://www.youtube.com/watch?v=ENrzD9HAZK4>

## Get started

Install NodeJS to your system: <https://nodejs.org/en/download>

Install the Vercel CLI: `npm i -g vercel@latest`

After cloning this repo, run `npm install` in the project root (npm is the Node Package Manager).

To spin up a dev server, run `vercel dev` when in the project root.

### Vercel Setup for Teammates

Since we are on the Vercel free plan, each team member must link to their own Vercel project for local development.

When you run `vercel dev` for the first time:

1. It will ask to set up the project. Answer **Yes**.
2. It will ask to link to an existing project. Answer **No**.
3. Give your new project a unique name (e.g., `yourname-zoo-db`).
4. After the project is created, you must add your own environment variables (e.g., database credentials) to your new Vercel project via the Vercel dashboard or by running `vercel env add <VARIABLE_NAME>`. All environment variables used in this project can be found in the `#resources` channel on Discord.

This will create a `.vercel` directory locally that links to your personal project. This directory is in `.gitignore` and should not be committed.

## Commit naming conventions

feat for features, fix for bugfixes, chore for everything else

Example:
`feat: created navbar component for frontend pages`
