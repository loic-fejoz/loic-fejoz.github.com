---
layout: post
title: "The CLI Toolbox: Writing DTN Applications with dtn-hdy-utils"
date: 2026-08-20 13:55:25
author: Loïc
tags : [radio, dtn, rust, linux]
lang: en
categories: radio
summary: Building lightweight DTN client applications using gRPC, and building interactive chat bridges and notification systems.
---

*This is the third post in a series exploring Delay-Tolerant Networking (DTN) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## Interfacing with the BPA over gRPC

Once you have a Bundle Processing Agent (like **Hardy**) running in the background, how do your user-facing programs talk to it? 

Instead of forcing applications to implement complex routing tables, database storage, and transmission retry loops, Hardy exposes a lightweight **gRPC API**. User applications connect as simple clients. They can send bundles, register to receive bundles sent to a specific Endpoint Identifier (EID), or query the local store.

To make this interaction simple on Linux systems, we built **`dtn-hdy-utils`**, a toolkit of Rust-based command-line utilities.

---

## The Core Utilities

* **`dtnping`:** The DTN equivalent of ICMP ping. It registers as a lightweight client, sends a bundle to a destination EID, and measures the Round-Trip Time (RTT) and paths taken.
* **`dtnsend` & `dtnprint`:** The fundamental send/receive pipes. You can pipe any raw text or binary payload from `stdin` into `dtnsend` and have `dtnprint` listen and dump incoming data directly to `stdout`.
* **`dtnquery`:** Inspects local bundle storage offline (SQLite/PostgreSQL databases) to check the state of the bundle queues and analyze network health.

---

## Automation via `dtntrigger`

The most powerful utility in the stack is **`dtntrigger`**. It subscribes to a specific DTN service endpoint and blocks. Whenever a new bundle is received:
1. It writes the bundle payload to a temporary file.
2. It executes a pre-configured script or executable, passing the sender EID and the temporary file path as arguments.

By combining `dtntrigger` with simple scripts, you can build full offline application gateways. Here are three examples available in the `dtn-hdy-utils/examples` directory:

### 1. Matrix Notification Bridge (`dtn-matrix.py`)
If a disaster zones triggers an alert, how do we forward it to the internet once a gateway node gets connectivity? The `dtn-matrix.py` script acts as a bridge. 
* It intercepts incoming bundles targeting a `matrix` endpoint.
* It logs into a specified Matrix home server and posts the message directly to a chat room.
* **Security:** It fully supports End-to-End Encryption (E2EE) using `matrix-nio[e2e]`, managing cryptographic keys locally on the gateway node.

### 2. Interactive Fortune Responder (`dtn-fortune.sh`)
This script acts as a classic interactive server over an asynchronous radio link.
* A remote station sends a bundle containing their preferred language (e.g. `fr` or `en`) to `dtn://<node>/fortune`.
* `dtntrigger` receives it and starts the bash script.
* The script reads the request, generates a random quote using the local `fortune` database, and triggers `dtnsend` to transmit the reply bundle back to the original sender's EID.

### 3. Local Desktop Alerts (`dtn-notify.sh`)
A lightweight utility for home stations or field laptops. It subscribes to a notification endpoint and triggers standard system desktop alerts (using `notify-send`) showing the sender's EID and the message text whenever a bundle arrives.

---

## Beyond Text: Chat and File Sharing

Using these tools, you are not limited to simple command-line pings. Because the Bundle Protocol handles arbitrary payloads:
* **Chat:** You can pipe live chat applications. Text messages are encapsulated into DTN bundles and routed opportunistically to the destination.
* **File Exchange:** Large binary payloads—such as high-resolution images, PDF documents, or weather charts—can be packaged and sent over the DTN link, with the protocol ensuring the files are stored and forwarded hop-by-hop across the mesh.

---

*In the next post, we will take a step away from the desktop and look at how we can carry these delay-tolerant conversations in our pockets using a native Android messenger application.*
