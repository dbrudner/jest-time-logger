## Installation

1. Install @dbrudner/jest-time-logger as a devDependency

    - **NPM** - `npm i --save-dev @dbrudner/jest-time-logger`
    - **YARN** - `yarn add -D @dbrudner/jest-time-logger`

2. Add `watchPlugins: ["./node_modules/@dbrudner/jest-time-logger]` to your project's jest.config.js

Done!

## Usage

Running jest in watch mode shows a new menu option: `press d to get metrics from jest-time-logger`. Pressing `d` runs this command and outputs statistics on logged tests.
