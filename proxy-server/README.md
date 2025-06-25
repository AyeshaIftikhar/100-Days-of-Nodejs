# 🌍 HTTP Proxy Server

A proxy server is an intermediary between a client (like your computer or phone) and a server (like a website or service you’re trying to access). It "sits in the middle" and handles the communication between the two.

## 🔁 Simple Analogy:
Imagine you’re in a classroom and want to pass a note to someone, but you don’t want them to know it’s from you. So, you give the note to a friend and they pass it on for you. Your friend is acting as a proxy.

## 🧠 In Technical Terms:
- When your device sends a request (like opening a webpage), a proxy server:
- Receives your request
- Forwards it to the actual destination (e.g., example.com)
- Gets the response (e.g., the webpage)
- Sends it back to you

## 🔒 Why Use a Proxy Server?
- Privacy: Hides your real IP address from the destination website.
- Security: Can filter harmful content or restrict access.
- Access Control: Used in schools or companies to block certain sites.
- Caching: Stores frequent responses to reduce server load and speed up access.
- Bypass Geo-Restrictions: Lets you appear to be from another country.

## 🔧 Types of Proxy Servers:
| Type                                   | What it Does                                                                 |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| **Forward Proxy**                      | Forwards client requests to the internet. Most common.                       |
| **Reverse Proxy**                      | Sits in front of servers to manage traffic, improve speed, and add security. |
| **Transparent Proxy**                  | Users don’t know it’s there; used for filtering or monitoring.               |
| **Anonymous Proxy**                    | Hides your IP but reveals you are using a proxy.                             |
| **High Anonymity Proxy (Elite Proxy)** | Hides both your IP and the fact that you’re using a proxy.                   |

## 🧩 Example in Action:
You → Proxy Server → Google.com
Google.com replies → Proxy Server → You

Google never sees your real IP—only the proxy server's.



## Features in this project
- Basic HTTP request forwarding
- Request/Response logging
- Simple request modification
- Error handling
- Support for HTTPS traffic

## Testing the Proxy
You can test with curl:

```bash
curl http://localhost:3000/proxy
```

Or in a browser, navigate to:

```text
http://localhost:3000/proxy
```
