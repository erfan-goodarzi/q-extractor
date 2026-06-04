<div dir="rtl" align=center>

[**راهنمای فارسی**](README_FA.md) / [**English**](README.md)

# Exam Question Extractor

<div style="text-align:center">
<img alt="logo" src="./public/logo.svg">
</div>

<div align=left>
A Chromium-based extension that extracts exam questions and their answer options from pasted HTML.

## Motivation
The motivation behind this project was to help students to simply copy the extracted question from the page. This is mainly work for **PNU** universities exams.

In the new exam method, there are restrictions such as limitations on copying text from the page. 

Therefore, I decided to build an extension to solve this problem. While anyone can technically inspect the page and copy the question, that approach is too difficult for non-technical students.

# Installation

1. Go to [Releases](https://github.com/erfan-goodarzi/q-extractor/releases) page.
2. Download the latest `crx-q-extractor-<version>.zip` asset.
3. Unzip the downloaded file.

## Chrome

1. Open `chrome://extensions` in Chrome, Edge, Brave, or another Chromium browser 
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the unzipped folder

## Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` inside the unzipped folder

> Firefox removes temporary extensions after a browser restart.


## Load Unpacked (Local Build)

1. Clone the code
2. Build the unpacked using `pnpm dev`
3. Open `chrome://extensions` in Chrome, Edge, Brave, or another Chromium browser.
4. Enable Developer Mode.
5. Click Load unpacked.
6. Select the `dist` folder.

## Development

Install dependencies:

```sh
pnpm install
```

Run Vite:

```sh
pnpm run dev
```

Check formatting and lint rules:

```sh
pnpm run lint
```

## Build

Create the unpacked extension in `dist/` and a release zip in `release/`:

```sh
pnpm run build
```

The generated zip is named from the extension name and version, for example:

```text
release/crx-q-extractor-<version>.zip
```

Upload that zip to the GitHub release.

## Questions or Feedback?

If you have any questions, found a bug, or have suggestions for improving the extension, feel free to reach out:

- GitHub Issues: [Issues](https://github.com/erfan-goodarzi/q-extractor/issues)
- Telegram: [@yellow_dark88](t.me/yellow_dark88)

Happy to help ❤️. Donate : https://daramet.com/erfan_goodarzi
