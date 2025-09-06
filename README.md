# 100 Days of Node.JS

![100DaysofNodeJs](https://github.com/AyeshaIftikhar/100-Days-of-Nodejs/blob/main/100daysofnodejs.png)

**_Goal:_** Build 100 Node.js projects to master backend development.

<p>
<a href="https://www.linkedin.com/in/seayeshaiftikhar/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg" alt="Linkedin" height="30" width="40" /></a>
<a href="https://web.facebook.com/ayeshaifitikharofficial/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/facebook.svg" alt="Facebook" height="30" width="40" /></a>
<a href="https://www.youtube.com/channel/UCUI0fN6xPUT3SfGLfh8B9Lg" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/youtube.svg" alt="Youtube" height="30" width="40" /></a>
<a href="https://whatsapp.com/channel/0029VaCZPbjGJP8EQY19Xz1v" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/whatsapp.svg" alt="Whatsapp" height="30" width="40" /></a>
<a href="https://www.instagram.com/aishayyy____" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/instagram.svg" alt="Instagram" height="30" width="40" /></a>
</p>

## Table of Contents

- [Beginner Projects (1-30)](#beginner-projects-1-30)
- [Intermediate Projects (31-70)](#intermediate-projects-31-70)
- [Advanced Projects (71-100)](#advanced-projects-71-100)
- [How to Use This List](#how-to-use-this-list)
- [Contributing](#contributing)

## 🎯 Rules

- **1 Project Per Day** (15-60 mins)
- **Document Every Project** (README + Screenshots)
- **Post Progress on Social Media** (#100daysofcode, #100daysofnodejs)

## Set Up Your System

- Install [Node.js](https://nodejs.org/en) (LTS version).
- Use [VS Code](http://code.visualstudio.com/) (with extensions like **ESLint**, **Prettier**).
- Version control with **Git/GitHub**.
- Optional: Use [Postman](https://www.postman.com/) for API testing.

## Project Setup

- Create a folder and run the following to initialize a nodejs project

```cmd
npm init -y
```

- Install Dependencies

```cmd
npm install
```

- Run the script

```cmd
node app.js
```

## Project Catelogue

### 🔹 Level 1: Core Node.js

_Focus_: Core Node.Js, CLI Tools, Basic APIs

| Sr. | Project Name                                      | Status | Last Updated | Architecture/Type       | Main Design Patterns Uses                                                          |
| --- | ------------------------------------------------- | ------ | ------------ | ----------------------- | ---------------------------------------------------------------------------------- |
| 1.  | 🤝🏻 hello-world-server                           | ✅     | 2025-06-16   | Minimal HTTP Server     | Singleton (server instance), Separation of Concerns                                |
| 2.  | 📂 file-organizer-cli                             | ✅     | 2025-06-17   | CLI Modular             | Command Pattern, Single Responsibility                                             |
| 3.  | ☁️ weather-cli                                    | ✅     | 2025-06-18   | CLI Modular             | Command Pattern, Adapter (for API), Separation of Concerns                         |
| 4.  | 📙 Note Taking App **_(FS Module CURD)_**         | ✅     | 2025-06-19   | CLI/REST, File-based    | Repository Pattern, Command Pattern, Separation of Concerns                        |
| 5.  | 🎲 Random Quote Generator **_(Local JSON Data)_** | ✅     | 2025-06-20   | CLI Modular             | Command Pattern, Singleton/Module Pattern                                          |
| 6.  | 🏋 BMI Calculator **_(HTTP endpoints)_**          | ✅     | 2025-06-21   | REST API (Express)      | MVC Pattern, Service Layer, Router Pattern                                         |
| 7.  | ⏰ Timezone Converter                             | ✅     | 2025-06-22   | CLI Modular             | Command Pattern, Adapter (for timezones), Separation of Concerns                   |
| 8.  | 🔗 URL Shortener **_(File-based DB)_**            | ✅     | 2025-06-23   | REST API (Express)      | Repository Pattern, Router Pattern, Singleton (for DB)                             |
| 9.  | 🗝️ Password Generator **_(CLI tool)_**            | ✅     | 2025-06-24   | CLI Modular             | Command Pattern, Strategy (for password rules), Separation of Concerns             |
| 10. | 🌍 HTTP Proxy Server                              | ✅     | 2025-06-25   | Middleware (Express)    | Proxy Pattern, Middleware Pattern                                                  |
| 11. | 🕸️ Markdown to HTML Converter                     | ✅     | 2025-06-26   | CLI Modular             | Command Pattern, Strategy/Factory (for templates), Separation of Concerns          |
| 12. | 🌍 REST Countries API Wrapper                     | ✅     | 2025-06-27   | REST API (Express)      | Repository Pattern, Router Pattern, Separation of Concerns                         |
| 13. | 🪙 Currency Converter CLI                         | ✅     | 2025-06-28   | CLI Modular             | Command Pattern, Strategy (for conversion logic), Separation of Concerns           |
| 14. | 📑 Word Counter **_(FS module)_**                 | ✅     | 2025-06-29   | CLI Modular             | Command Pattern, Single Responsibility                                             |
| 15. | 🔐 Simple Auth System **_(JWT + files)_**         | ✅     | 2025-06-30   | REST API (Express)      | MVC Pattern, Service Layer, Repository Pattern, JWT Auth Pattern                   |
| 16. | 📉 RSS Feed Parser                                | ✅     | 2025-07-01   | CLI Modular             | Command Pattern, Adapter (for RSS parsing), Separation of Concerns                 |
| 17. | 🗃️ CSV to JSON Converter                          | ✅     | 2025-07-02   | CLI Modular             | Command Pattern, Adapter (for CSV parsing), Single Responsibility                  |
| 18. | ☑️ Todo API **_(No DB)_**                         | ✅     | 2025-07-03   | REST API (Express)      | MVC Pattern, Router Pattern, In-memory Repository Pattern                          |
| 19. | 🚨 System Info Logger **_(OS module)_**           | ✅     | 2025-07-04   | CLI Modular             | Command Pattern, Adapter (for OS module), Single Responsibility                    |
| 20. | 📧 Email Extractor **_(Regex + FS)_**             | ✅     | 2025-07-05   | CLI Modular             | Command Pattern, Adapter (Regex/File), Single Responsibility                       |
| 21. | 🙀 GitHub Profile Fetcher **_(GitHub API)_**      | ✅     | 2025-07-06   | CLI Modular             | Command Pattern, Adapter (for API), Separation of Concerns                         |
| 22. | ✔️ Palindrome Checker API                         | ✅     | 2025-07-07   | REST API (Express)      | MVC Pattern, Router Pattern, Service Layer, Input Validation                       |
| 23. | 🧿 Base64 Encoder/Decoder                         | ✅     | 2025-07-08   | CLI Modular + REST API  | Command Pattern, Adapter (Buffer/FS), Separation of Concerns                       |
| 24. | 🗂️ File Uploader **_(Multipart forms)_**          | ✅     | 2025-07-09   | REST API (Express)      | Middleware Pattern, Adapter (multer), Separation of Concerns                       |
| 25. | 🌐 Static File Server                             | ✅     | 2025-07-10   | Static Server (Express) | Middleware Pattern, Singleton (server instance), Separation of Concerns            |
| 26. | 📝 CLI Quiz App **_(Readline)_**                  | ✅     | 2025-07-11   | CLI Modular             | Command Pattern, Adapter (Readline), Separation of Concerns, Single Responsibility |
| 27. | 🌍 HTTP Logger Middleware                         | ✅     | 2025-07-12   | Express Middleware      | Middleware Pattern, Singleton (logger instance), Separation of Concerns            |
| 28. | 🎲 Dice Roll Simulator API                        | ✅     | 2025-07-13   | REST API (Express)      | MVC Pattern, Router Pattern, Service Layer, Separation of Concerns                 |
| 29. | 🌊 Lorem Ipsum Generator                          | ✅     | 2025-07-14   | CLI Modular + REST API  | Command Pattern, Strategy Pattern (text generation), Separation of Concerns        |
| 30. | 🌐 Simple Web Scraper **_(Cheerio)_**             | ✅     | 2025-07-15   | CLI Modular + REST API  | Command Pattern, Adapter (Cheerio), Separation of Concerns, Single Responsibility  |

## ⚡️ Design Patterns

- **CLI Modular:** Command-line tool with modular code organization.
- **REST API (Express):** RESTful API using Express.
- **Static Server (Express):** Serves static files using Express.
- **Command Pattern:** Used in CLI tools to parse and execute commands.
- **Adapter:** Used to interface with external APIs, modules, or file systems.
- **MVC Pattern:** Model-View-Controller, typical for REST APIs.
- **Router Pattern:** Organizes endpoints in Express apps.
- **Service Layer:** Business logic separated from controllers/routes.
- **Middleware Pattern:** Uses Express middleware for request/file handling.
- **Singleton:** Single instance for server or shared resource.
- **Separation of Concerns:** Logic, data, and presentation are separated.
- **Single Responsibility:** Each module/class does one thing.
- **In-memory Repository:** Data is stored in memory, not persisted.
- **Middleware (Express):** Uses Express middleware for request handling.
- **Repository Pattern:** Abstracts data access (e.g., with files or lowdb).
- **Strategy/Factory:** For selecting templates, password rules, or conversion logic.
- **Singleton/Module:** For managing shared state (e.g., quote list, DB).
- **JWT Auth Pattern:** Uses JWT for authentication.
- **MVC (API):** Model-View-Controller, typical for REST APIs.
- **Express Middleware:** Custom middleware for Express apps.
- **Strategy Pattern:** For selecting text generation logic.

### 🔹 Level 2: Databases & APIs (Projects 31-70)

_Focus_: Database, APIs, Integrations, Authentications

| Sr. | Project Name                                             | Status | Last Updated |
| --- | -------------------------------------------------------- | ------ | ------------ |
| 31. | MongoDB CRUD API                                         | ✅ ✔️  | 16-07-2025   |
| 32. | Redis Caching Layer                                      | ✅ ✔️  | 17-07-2025   |
| 33. | JWT Auth API _(Express + MongoDB)_                       | ✅ ✔️  | 18-07-2025   |
| 34. | OAuth Login _(Google/GitHub)_                            | ✅ ✔️  | 19-07-2025   |
| 35. | RESTful Blog API _(Express + MySQL)_                     | ✅ ✔️  | 20-07-2025   |
| 36. | GraphQL API _(Apollo Server)_                            | ✅ ✔️  | 21-07-2025   |
| 37. | Webhook Listener _(Ngrok)_                               | ✅ ✔️  | 22-07-2025   |
| 38. | Slack/Discord Bot                                        | ✅ ✔️  | 23-05-2025   |
| 39. | Automated Email Sender _(Nodemailer)_                    | ✅ ✔️  | 24-05-2025   |
| 40. | PDF Generator API _(PDFKit)_                             | ✅ ✔️  | 25-07-2025   |
| 41. | PWeb Scraper with Storage _(Cheerio + DB)_               | ✅ ✔️  | 26-07-2025   |
| 42. | Rate-Limited API _(Redis)_                               | ✅ ✔️  | 27-07-2025   |
| 43. | Real-Time Chat _(Socket.io)_                             | ✅ ✔️  | 28-07-2025   |
| 44. | File Encryption Tool _(Crypto module)_                   | ✅ ✔️  | 29-07-2025   |
| 45. | RSS Feed Reader                                          | ✅ ✔️  | 30-07-2025   |
| 46. | Stock Price Fetcher _(Alpha Vantage API)_                | ✅ ✔️  | 31-07-2025   |
| 47. | Dockerized Node App                                      | ✅ ✔️  | 01-08-2025   |
| 48. | Load-Testing Tool _(Artillery)_                          | ✅ ✔️  | 02-08-2025   |
| 49. | Serverless Function _(AWS Lambda/Vercel)_                | ✅ ✔️  | 03-08-2025   |
| 50. | QR Code Generator API                                    | ✅ ✔️  | 04-08-2025   |
| 51. | Headless CMS _(Strapi/Sanity clone)_                     | ✅ ✔️  | 05-08-2025   |
| 52. | Automated Backup Script _(AWS S3)_                       | ✅ ✔️  | 06-08-2025   |
| 53. | WebSocket Game _(Tic-Tac-Toe)_                           | ✅ ✔️  | 07-08-2025   |
| 54. | REST API with Swagger Docs                               | ✅ ✔️  | 08-08-2025   |
| 55. | YouTube Downloader _(ytdl-core)_                         | ✅ ✔️  | 09-08-2025   |
| 56. | Job Queue _(Bull + Redis)_                               | ✅ ✔️  | 10-08-2025   |
| 57. | PDF Invoice Generator                                    | ✅ ✔️  | 11-08-2025   |
| 58. | Geolocation API _(IP lookup)_                            | ✅ ✔️  | 12-08-2025   |
| 59. | CLI Password Manager _(Encrypted)_                       | ✅ ✔️  | 13-08-2025   |
| 60. | Memcached Integration                                    | ✅ ✔️  | 14-08-2025   |
| 61. | GraphQL Subscription API                                 | ✅ ✔️  | 15-08-2025   |
| 62. | OTP Service _(Twilio)_                                   | ✅ ✔️  | 16-08-2025   |
| 63. | Markdown Blog Engine                                     | ✅ ✔️  | 17-08-2025   |
| 64. | Server-Sent Events _(SSE)_ Demo                          | ✅ ✔️  | 18-08-2025   |
| 65. | Image Downloader                                         | ✅ ✔️  | 19-08-2025   |
| 66. | ProxyPulse (URL + VPN Checker)                           | ✅ ✔️  | 20-08-2025   |
| 67. | Automated Screenshot Service _(Puppeteer)_               | ✅ ✔️  | 21-08-2025   |
| 68. | Meme Generator (Canvas)                                  | ✅ ✔️  | 22-08-2025   |
| 69. | VoxAssist (Text-to-Speech (TTS) + Simple Voice Assitant) | ✅ ✔️  | 23-08-2025   |
| 70. | CLI SQL Query Runner                                     | ✅ ✔️  | 24-08-2025   |

### 🔹 Level 3: Advanced Backend (Projects 71-100)

_Focus_: Microservices, DevOps, Scalability, AI

| Sr.  | Project Name                                       | Status | Last Updated |
| ---- | -------------------------------------------------- | ------ | ------------ |
| 71.  | Microservices Auth System                          | ✅     | 25-08-2025   |
| 72.  | Passwordless Auth                                  | ✅     | 26-08-2025   |
| 73.  | API Gateway (Kong/Tyk)                             | ✅     | 27-08-2025   |
| 74.  | Serverless (Webhooks + CRUD API (DynamoDB) )       | ✅     | 28-09-2025   |
| 75.  | Elasticsearch Integration                          | ✅     | 29-09-2025   |
| 76.  | Real-Time Analytics Dashboard                      | ✅     | 30-08-2025   |
| 77.  | Distributed Cache + Task Scheduler                 | ✅     | 31-08-2025   |
| 78.  | Logging System (ELK Stack)                         | ✅     | 01-09-2025   |
| 79.  | Server-Side Rendering (SSR) App                    | ✅     | 02-09-2025   |
| 80.  | Payment Gateway Integration (Stripe)               | ✅     | 03-09-2025   |
| 81.  | Feature Flag Service                               | ✅     | 04-09-2025   |
| 82.  | GraphQL Federation                                 | ✅     | 05-09-2025   |
| 83.  | Video Streaming API (HLS)                          | ✅     | 06-09-2025   |
| 84.  | ChatApp (Voice + Video)                            | ✅     | 07-09-2025   |
| 85.  | Automated Testing Framework                        | 🔄     | 08-09-2025   |
| 86.  | WebAssembly-Powered API                            | 🔄     | 09-09-2025   |
| 87.  | Chaos Engineering Tool                             | 🔄     | 10-09-2025   |
| 88.  | Real-Time Collaborative Editor                     | 🔄     | 11-09-2025   |
| 89.  | Low-Code API Builder                               | 🔄     | 12-09-2025   |
| 90.  | Auth0 Clone                                        | 🔄     | 13-09-2025   |
| 91.  | Database Sharding Demo                             | 🔄     | 14-09-2025   |
| 92.  | Zero-Knowledge Proof Demo                          | 🔄     | 15-09-2025   |
| 93.  | Blockchain Explorer (API + Stimulator)             | 🔄     | 16-09-2025   |
| 94.  | Automated Trading Bot                              | 🔄     | 17-09-2025   |
| 95.  | Decentralized App (Ethereum)                       | 🔄     | 18-09-2025   |
| 96.  | Facial Recognition System                          | 🔄     | 19-09-2025   |
| 97.  | Automated Deployment Bot                           | 🔄     | 20-09-2025   |
| 98.  | Kubernetes-Deployed API                            | 🔄     | 21-09-2025   |
| 99.  | CI/CD Pipeline (GitHub Actions)                    | 🔄     | 22-09-2025   |
| 100. | Open-Source Contribution (Fix a Node.js lib issue) | 🔄     | 23-09-2025   |

## ⚡ Step 3: Execution Strategy

✅ 1 Project Per Day (15-60 mins)
✅ Document Every Project (GitHub README with screenshots)
✅ Post Progress on LinkedIn/Instagram (Use #100DaysOfNodeJS)
✅ Monetize After 50 Projects (Freelancing, templates, coaching)
✅ Complexity Gradient: Every 10 projects, increase difficulty.

## 🔖 Bonus: Monetization Ideas

- **Sell Project Templates:** Bundle projects 50-100 as "Node.js Starter Kits" (Gumroad).
- **Freelancing:** Offer to build custom APIs (use projects 30+ as proof).
- **YouTube:** Record a "100 Node.js Projects" series (affiliate links in description).
- **Sponsorships:** Partner with hosting tools (e.g., "This project uses Railway").
