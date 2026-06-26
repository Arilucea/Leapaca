# <img src="images/header_icon_readme.png" width="48" valign="middle"> Leapaca

Leapaca is a browser extension that gives you complete control over your streaming experience. Built as a modular monorepo, it supports multiple streaming platforms with platform-specific optimizations. Take control of your binge-watching with automatic intro/recap skipping, seamless episode transitions, customizable playback speeds, and a sleek, modern interface.

## Prerequisites

- **Python 3.x** - Required for building the extension
- **Chrome/Chromium-based browser** - For running the extension
- **Node.js 14+** (optional) - Only needed if running tests

## Installation

Since this project is structured as a monorepo with a shared core and platform-specific overlays, you need to build the extension before loading it.

### 1. Clone the Repository

```bash
git clone https://github.com/Arilucea/Leapaca.git
cd Leapaca
```

### 2. Build the Extension

Run the build script to generate the extension files:

```bash
# Build the NX version (Netflix)
python3 build.py NX

# Or build all available apps into subdirectories
python3 build.py
```

This will create a `build/` directory containing the complete extension ready to load.

### 3. Load in Browser

1. Navigate to `chrome://extensions/` in your browser
2. Enable **Developer Mode** (toggle in top right corner)
3. Click **"Load unpacked"**
4. Select the generated `build` directory (or `build/NX` if you built all apps)

## Available Versions

### Leapaca ONE

<p align="center">
  <a href="https://chromewebstore.google.com/detail/leapaca-one/idafdjajkgpiaohjpkikhilpfndainlp">
    <img src="apps/ONE/icons/128.png" alt="Leapaca ONE" width="128">
  </a>
</p>

The **One** version is the universal version of the extension that includes support for all the platforms.

**Supported URL:** `https://tv.apple.com/*`, `https://www.netflix.com/*`, `https://www.primevideo.com/*`

### Leapaca NX (Netflix)  

<p align="center">
  <a href="https://chromewebstore.google.com/detail/leapaca-nx/jcjdafkppklahkefdgboamebpbbhnign">
    <img src="apps/NX/icons/128.png" alt="Leapaca NX" width="128">
  </a>
</p>

The **NX** version is optimized exclusively for **Netflix**, providing seamless integration and advanced features like Picture-in-Picture.

**Supported URL:** `https://www.netflix.com/*`

### Leapaca PV (Prime Video)  

<p align="center">
  <a href="https://chromewebstore.google.com/detail/leapaca-pv/nbpomnpleglfhaeamjdfpoibfojnefhf">
    <img src="apps/PV/icons/128.png" alt="Leapaca PV" width="128">
  </a>
</p>

The **PV** version is optimized for **Amazon Prime Video**, focusing on essential performance and automatic skips.

**Supported URL:** `https://www.primevideo.com/*`

### Leapaca ATV (Apple TV)

<p align="center">
  <a href="https://chromewebstore.google.com/detail/leapaca-atv/apdalemglkfaalhocddhbaempaohfaol">
    <img src="apps/ATV/icons/128.png" alt="Leapaca ATV" width="128">
  </a>
</p>

The **ATV** version is optimized for **Apple TV**, featuring automatic skips for intros, recaps, and ads.

**Supported URL:** `https://tv.apple.com/*`

## Features

- **⏩ Speed Control** - Adjust playback speed from 0x to 2.5x with fine-grained control (0.05x increments)
- **🔒 Lock Speed** - Maintain your preferred playback speed across different titles and episodes
- **⏭️ Auto-Skip Intro** - Automatically skips intro sequences as soon as they appear
- **🔄 Auto-Next Episode** - Seamlessly transitions to the next episode (Platform specific)
- **⏮️ Auto-Skip Recap** - Skips "Previously on..." recaps automatically
- **📺 Picture-in-Picture** - Watch in a floating window while multi-tasking (Platform specific)
- **🎨 Custom Themes** - Support for **Light**, **Dark**, and **Auto** (System) themes
- **🌐 Multi-language Support** - Available in **English** and **Spanish**
- **🔒 Privacy First** - Works entirely in your browser with minimal permissions (`storage` only)

## Configuration

The extension uses Chrome's sync storage to persist settings across devices. No external services or environment variables are required.

### Available Settings

| Setting       | Type    | Default         | Description                  |
| ------------- | ------- | --------------- | ---------------------------- |
| `speed`       | Number  | `1`             | Playback speed (0 to 2.5)    |
| `lockSpeed`   | Boolean | `false`         | Lock speed across all videos |
| `skipIntro`   | Boolean | `true`          | Auto-skip intro sequences    |
| `nextEpisode` | Boolean | `true`          | Auto-play next episode       |
| `skipPreplay` | Boolean | `false`         | Auto-skip recap/preplay      |
| `theme`       | String  | `"auto"`        | UI theme (auto/light/dark)   |
| `language`    | String  | Browser default | UI language (en/es)          |
| `enablePip`   | Boolean | `true`          | Enable PiP                   |

## Usage

### Basic Usage

1. **Install the extension** following the installation steps above
2. **Navigate to supported platform**
3. **Click the extension icon** to open the popup interface
4. **Adjust settings** as desired:
   - Drag the speed slider to change playback speed
   - Toggle auto-skip features on/off
   - Lock speed to maintain across videos

### Advanced Features

- **Speed Lock**: When enabled, your selected speed will persist even when platform tries to reset it
- **Theme Switching**: Click the settings icon (⚙️) to access theme and language options
- **Automatic Reset**: Speed automatically resets to 1x when browsing (not watching content)

## Available Scripts

### Build Scripts

| Command               | Description                               |
| --------------------- | ----------------------------------------- |
| `python3 build.py ONE`| Build the One version only                |
| `python3 build.py NX` | Build the Netflix (NX) version only       |
| `python3 build.py PV` | Build the Prime Video (PV) version only   |
| `python3 build.py ATV`| Build the Apple TV (ATV) version only     |
| `python3 build.py`    | Build all available platform versions     |

### Test Scripts

| Command                 | Description                    |
| ----------------------- | ------------------------------ |
| `npm test`              | Run JavaScript tests with Jest |
| `npm run test:watch`    | Run tests in watch mode        |
| `npm run test:coverage` | Generate test coverage report  |
| `npm run test:python`   | Run Python build script tests  |

## Project Structure

```
Leapaca/
├── core/                      # Shared logic and assets
│   ├── _locales/             # Internationalization files
│   │   ├── en/              # English translations
│   │   └── es/              # Spanish translations
│   ├── content.js           # Content script (injected into pages)
│   ├── popup.js             # Popup UI logic
│   ├── popup.html           # Popup UI structure
│   ├── popup.css            # Popup UI styles
│   └── i18n.js              # Internationalization utilities
├── apps/                      # Platform-specific overlays
│   ├── ATV/                  # Apple TV-specific files
│   │   ├── manifest.json    # Extension manifest
│   │   ├── content.js       # Platform-specific selectors
│   │   ├── popup.js         # Modular popup logic (skip customization)
│   │   ├── popup.html       # Modular popup UI elements
│   │   ├── popup.css        # Platform-specific styles
│   │   ├── _locales/        # Platform-specific translations
│   │   └── icons/           # Platform-specific icons
│   ├── NX/                   # Netflix-specific files
│   │   ├── manifest.json    # Extension manifest
│   │   ├── content.js       # Platform-specific selectors
│   │   ├── popup.js         # Modular popup logic (PiP, Next Episode)
│   │   ├── popup.html       # Modular popup UI elements
│   │   ├── popup.css        # Platform-specific styles
│   │   └── icons/           # Platform-specific icons
│   ├── ONE/                  # Universal version files (Netflix, Prime, Apple TV)
│   │   ├── manifest.json    # Extension manifest
│   │   ├── content.js       # Multi-platform content script
│   │   ├── popup.js         # Universal popup logic
│   │   ├── popup.html       # Universal popup UI elements
│   │   ├── popup.css        # Universal popup styles
│   │   ├── _locales/        # Universal translations
│   │   └── icons/           # Universal icons
│   └── PV/                   # Prime Video-specific files
│       ├── manifest.json    # Extension manifest
│       ├── content.js       # Platform-specific selectors
│       ├── popup.css        # Platform-specific styles
│       └── icons/           # Platform-specific icons
├── build/                     # Generated extension (gitignored)
├── tests/                     # Test suite
│   ├── extension.test.js    # JavaScript tests
│   ├── test_build.py        # Python build tests
│   └── requirements.txt     # Python test dependencies
├── images/                    # Documentation assets
├── build.py                   # Build script (merges core + app)
├── package.json              # Node.js dependencies (tests only)
├── jest.config.js            # Jest configuration
└── README.md                 # This file
```

## Dependencies

### Production Dependencies

**None** - The extension is built with vanilla JavaScript and requires no external runtime dependencies.

### Development Dependencies

#### JavaScript (Testing)

- `jest` (^29.7.0) - JavaScript testing framework
- `jest-environment-jsdom` (^29.7.0) - DOM environment for tests
- `@types/jest` (^29.5.12) - TypeScript definitions for Jest
- `@types/chrome` (^0.0.268) - TypeScript definitions for Chrome APIs

#### Python (Build & Testing)

- `pytest` (>=8.0.0) - Python testing framework
- `pytest-cov` (>=4.1.0) - Coverage plugin for pytest

## Testing

### Running Tests

#### JavaScript Tests

```bash
# Install dependencies first
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

#### Python Tests

```bash
# Install test dependencies
pip install -r tests/requirements.txt

# Run build script tests
npm run test:python
# Or directly:
pytest tests/test_build.py -v
```

### Test Coverage

The test suite includes:

- **15+ Python test cases** - Build script validation, error handling, security checks
- **10+ JavaScript test cases** - Extension functionality, storage operations, UI interactions
- **Coverage reporting** - Configured for both Python and JavaScript

Current test coverage: **~90%** of core functionality

## Development

### Building for Development

The build system merges core files with platform-specific overlays:

1. **Core files** are copied to the build directory. These contain the base logic and **placeholders**.
2. **Platform-specific files** (`apps/<app>/`) are processed selectively:
   - **JSON files** - Merged (e.g., `manifest.json` gets app-specific icons and permissions).
   - **CSS files** - Core styles are appended with app-specific styles (allowing for overrides).
   - **Content & UI JavaScript** - Use a **Marker System** to inject app-only features (like PiP in NX) into the core template.
   - **HTML placeholders** - UI fragments are injected into defined core layout positions.

### Modular Component System

To keep the shared core clean while allowing rich features on specific platforms, Leapaca uses a marker-based injection system in the build script.

#### JavaScript Markers

Wrap app-specific logic in `apps/<app>/content.js` or `popup.js` using comments:

```javascript
/* APP_ON_MESSAGE_START */
// Your platform-specific message handler (e.g. PiP toggle)
/* APP_ON_MESSAGE_END */

/* APP_POPUP_LISTENERS_START */
// Your platform-specific UI listeners
/* APP_POPUP_LISTENERS_END */
```

#### HTML Markers

Similarly for UI fragments in `apps/<app>/popup.html`:

```html
<!-- APP_SIDEBAR_TOP_BUTTONS_START -->
<!-- Your platform button here -->
<!-- APP_SIDEBAR_TOP_BUTTONS_END -->
```

#### Supported Placeholders

| Placeholder         | Core File      | Description                               |
| ------------------- | -------------- | ----------------------------------------- |
| `SELECTORS`         | `content.js`   | Platform-specific DOM queries             |
| `IS_HOME_PAGE`      | `content.js`   | Logic to determine if URL is a home page |
| `ON_MESSAGE`        | `content.js`   | Message listener body                     |
| `VIDEO_INIT`        | `content.js`   | Initialization code for video elements    |
| `TRY_NEXT_EPISODE`  | `content.js`   | Logic for automatic series transitions    |
| `POPUP_LOGIC`       | `popup.js`     | UI variables, config, and listeners       |
| `POPUP_UI`          | `popup.html`   | Buttons and setting toggles               |

### Adding a New Platform

1. Create a new directory in `apps/` (e.g., `apps/YT/`).
2. Add a platform-specific `manifest.json`.
3. Create `content.js` and define the required `SELECTORS` and `IS_HOME_PAGE` function:
   ```javascript
   const SELECTORS = { video: "video", ... };
   const IS_HOME_PAGE = (path) => path === "/home";
   ```
4. Define optional feature markers if needed (PiP, Next Episode, etc.).
5. Create platform styles in `popup.css` (e.g. customize `--main-color` or `--popup-height`).
6. Build with `python3 build.py YT`.

### Code Quality

This project follows professional coding standards:

- ✅ **Comprehensive error handling** - All storage operations have error callbacks
- ✅ **DRY principle** - No code duplication, reusable utility functions
- ✅ **No magic numbers** - All constants clearly named
- ✅ **Input validation** - Security checks on all user inputs
- ✅ **Extensive testing** - 90%+ test coverage

See `PROJECT_IMPROVEMENTS_SUMMARY.md` for detailed quality metrics.

## Deployment

### Building for Production

```bash
# Build the specific platform version
python3 build.py NX

# The build/ directory is now ready for distribution
```

### Publishing to Chrome Web Store

1. Build the extension: `python3 build.py NX`
2. Create a ZIP archive of the `build/` directory
3. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
4. Fill in store listing details
5. Submit for review

### Version Management

Update version numbers in:

- `apps/NX/manifest.json` (or respective platform manifest)
- This README (if documenting current version)

## Contributing

Contributions are welcome! This project follows a monorepo structure to support multiple platforms efficiently.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes in `core/` or platform-specific `apps/` directories
4. Run tests: `npm test` and `npm run test:python`
5. Build and test the extension: `python3 build.py NX`
6. Commit your changes: `git commit -am 'Add new feature'`
7. Push to the branch: `git push origin feature/my-feature`
8. Submit a pull request

### Code Standards

- Use vanilla JavaScript (no frameworks)
- Follow existing code style and patterns
- Add tests for new functionality
- Validate all user inputs
- Handle all errors gracefully
- Use named constants instead of magic numbers

## Built With

- **Vanilla JavaScript** - Core logic and performance
- **HTML5 & CSS3** - Modern, responsive popup interface
- **Chrome Extension API (Manifest V3)** - Latest browser standards
- **Python 3** - Build system and automation
- **Jest** - JavaScript testing framework
- **pytest** - Python testing framework

## License

This project is licensed under the **GNU General Public License v3.0**.

You are free to:

- ✅ Use this software for any purpose
- ✅ Study and modify the source code
- ✅ Distribute copies
- ✅ Distribute modified versions

Under the conditions that:

- 📋 You must disclose the source code
- 📋 You must license derivative works under GPL-3.0
- 📋 You must state significant changes made
- 📋 You must include the original copyright notice

See the [LICENSE](LICENSE) file for full details.

## Acknowledgments

- Inspired by the need for a lightweight, privacy-focused streaming enhancement tool
