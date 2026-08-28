---
layout: post
title: "4. Going Mobile: The Native Kotlin dtn-android-messenger"
date: 2026-08-27 13:57:41 +0200
author: Loïc
tags : [radio, DTN, android, kotlin, telemetry]
lang: en
categories: radio
summary: Taking DTN off-grid with a native Kotlin Android application supporting chat, file sharing, and SenML telemetry.
---

*This is the fourth post in a series exploring [Delay-Tolerant Networking (DTN)](/tags/#dtn) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## DTN in Your Pocket

For delay-tolerant networking to be useful during disasters, field operations, or off-grid expeditions, it cannot remain confined to desktop computers or stationary servers. It has to run on the devices people carry daily: their smartphones. Also smartphone will be easy to later on connect to actual radio.

To experiment this, I designed **`dtn-android-messenger`**, a native Android messaging, file transfer application, and telemetry viewer. Built in Kotlin, it acts as a lightweight DTN node, yet capable of storing and forwarding bundles directly from a mobile device. The DTN core is inspired by [**picoD3TN**](https://gitlab.com/d3tn/picod3tn) in its simplicity.

![](/images/dtn-android-messenger-home.png)

---

## Practical Daily Use Cases

Instead of focusing on protocol specifications, the app is built around concrete user actions:

### 1. Offline Text Chat
The app offers a familiar chat interface. You can type messages to other nodes, and the app packages them as raw plain text (Markdown) within BPv7 bundles. If there is no route immediately available, the messages sit in your local queue. The moment your phone connects to another node (such as a home gateway or a passing peer), the messages are transmitted automatically. Currently very basic but works well accross `dtn-android-messenger` but also with `dtnsend`/`dtinprint` presented in the previous post.

![A screenshot of the chat looking familiar with bubble text, and a field on top to set next destinator](/images/dtn-android-messenger-chat.png).

### 2. Telemetry and Weather Monitoring (SenML)
One of the most practical applications of this app is sensor visualization. It supports **SenML (Sensor Measurement Lists / RFC 8428)**, parsing sensor data encoded in JSON or CBOR (preferrably). 
* A remote weather station or sensor node packages measurements (eg temperature, humidity, wind speed) as SenML and broadcasts them.
* Your phone receives these bundles opportunistically.
* The app automatically parses them and displays them in a clean, human-readable dashboard showing the latest readings from your weather station.

![](/images/dtn-android-messenger-senml-last.png)

As of 2026-08-27, one can reorder the sensors list, change the name of the sensor (SenML identify sensors by URN), remote the sensor from the list.

### 3. File and Document Exchange
Because DTN treats payloads as generic data, the app integrates directly with Android's system share menu. You can select a photo, a PDF, a voice file, or a Markdown text file from another app and "share" it to `dtn-android-messenger`. When received by a peer, the app automatically renders the image or formats the Markdown or display an audio player.

| | |
|-|-|
| <img src="/images/dtn-android-messenger-files-list.png" /> | <img src="/images/dtn-android-messenger-bundle-detail.png" /> |

---

## Configurability

In fact, the user interface is configurable. One can map an `EID` to one of the previously kind of listed view. So one can adjust its application as per its expected usage. It makes it easy to have a view per DTN application.

Moreover it can also handle "broadcast" EID, ie one can view bundle without being the destination EID. Indeed there exists some generic destination EID to simulate broadcast. This is the case for `dtn://beacon/` in the [RADIANT project](https://radiant.amsat-uk.org/). There is also a configuration to enable local usage *AND* normal routing. Speaking about routing, as of today (2026-08-27), `dtn-android-messenger` only supports static routes.

![](/images/dtn-android-messenger-services.png)

---

## Interoperability & Connectivity

To interact with other nodes in the mesh, the application implements two main Convergence Layers (CLAs):
* **TCPCLv4:** The standard TCP convergence layer, enabling direct synchronization with **Hardy** servers or other BPv7 routers.
* **Bluetooth RFCOMM:** An in-house, lightweight Bluetooth CLA allowing direct peer-to-peer sync between two phones in the field, without needing cellular towers, Wi-Fi access points, or pre-existing infrastructure. It is very basic as it transmit one bundle at a time.

*Note on Security:* To comply with amateur radio regulations (like ITU Article 25) which prohibit encrypted messages on public frequencies, we only implement **BPSec BIB (Block Integrity Blocks / RFC 9103)** using HMAC-SHA256. This signs the bundles to verify their source and guarantee they haven't been tampered with, while leaving the payloads in cleartext.

![](/images/dtn-android-messenger-convergence-layers.png)

---

## Engineering for Mobile Constraints

Running a store-and-forward router on a battery-powered device requires special attention. To protect battery life and CPU usage, the application makes several deliberate design trade-offs:

1. **Ephemeral Sockets:** Instead of holding persistent TCP or Bluetooth connections open, the app establishes on-demand sockets, drains the bundle queues, and immediately closes the connection to let the radio sleep.
2. **Single-Segment Transfers:** Bundles are sent and received as whole single segments. By avoiding complex multi-fragment streaming reassembly buffers, the application keeps memory footprint tiny.
3. **Strict Responsibility Transfer:** To prevent data loss in simplex or unreliable links, the convergence layer never sends a transfer acknowledgment (`XFER_ACK`) prematurely. It only confirms receipt once the incoming bundle has passed all security checks, has been written to the persistent disk storage, and is committed to the local database.

---

## Next steps

I am currently using it daily to watch out sensors from home. I am playing from time to time by exchanging messages with my computer thanks to the utilities as per my previous post. It seems really promising especially when you have off-grid in mind, or hybrid scenario where part of the network is off-grid, the otehr part is connected. Again I have learned a lot on the detail of the protocol and its implication.

*In the next post, we will move to another use-cases and explore how we can retrieve internet pages or files asynchronously using an experimental protocol: DTN Basket Protocol.*
