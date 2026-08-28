---
layout: post
title: "1. Beyond Packet Radio: Designing a Modern Radio Broadcast Protocol (HQFBP)"
date: 2026-08-20 17:42:00 +0200
author: Loïc
tags : [radio, satellite, DTN, HQFBP, rust]
lang: en
categories: radio
summary: A deep dive into HQFBP, a modular and robust file broadcasting protocol optimized for noisy, simplex amateur radio channels like satellite downlink.
---

*This is the first post in a series exploring [Delay-Tolerant Networking (DTN)](/tags/#dtn) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## The Simplex Noisy Satellite Challenge

### The FOSM-1 Mission

The main goal of the [**FOSM-1** experimental satellite mission](https://www.federation-openspacemakers.com/en/participate/projects/phoenix-infrastructure-informatique-orbi/fosm-1/) is to investigate and experiment the agility of radio communication protocols and onboard software. In addition to beacons, telemetry, and telecommands, one of the primary payloads involves broadcasting images and data captured from the onboard camera. It leverages the [open source radio board Spino from Electrolab](https://code.electrolab.fr/spino/cubesat_cs).

### The Problem: simplex, noisy, and unconnected

* **Type of files:** Bitmaps, telemetry, vector drawings, sensor logs, etc.
* **Link constraint:** No feedback loop (no active ARQ/acknowledgment) due to power or orbit constraints.
* **Noisy channel:** Designed for a Bit Error Rate (BER) of $10^{-3}$.

Under these constraints, existing amateur radio protocols show clear limitations:
* **AX.25 / PACSAT PFT:** Heavy packet overhead.
* **PACTOR / WINLINK:** Require active connected-mode handshakes (impossible in simplex broadcast).
* **FLAMP (FLDIGI):** Too verbose for tight constraints.
* [and others](https://github.com/loic-fejoz/hqfbp/tree/main#%EF%B8%8F-comparison-with-other-protocols)

---

## The HQFBP Concept (Hamradio Quick File Broadcasting Protocol)

HQFBP was designed to serve as a lightweight, flexible, and robust file broadcasting layer.
This was also a way for me to deep-dive into learning the basic building blocks for a radio protocol.

## Watch the Conference Presentation

For a complete breakdown of the protocol design, simulations, and lessons learned, watch the presentation at the AMSAT-F conference.
Slides are also on github: [2026-03-06-amsat-f.md](https://github.com/loic-fejoz/hqfbp/blob/main/docs/2026-03-06-amsat-f.md) (FR).
I believe the talk (in French) is much more fun to watch than reading this condensed article.

[![HQFBP Presentation](/images/K_YJYPONgYk.jpg)](https://youtu.be/K_YJYPONgYk?si=sPO8f-7F6s3IdIfn)

### 1. Compact Headers via CBOR

Instead of using verbose ASCII or XML metadata, HQFBP leverages **Canonical CBOR** (RFC 8949) combined with specific compression techniques outlined in the [HQFBP RFC](https://github.com/loic-fejoz/hqfbp/blob/main/RFC.md). An HTTP-like header describing a message's ID, source callsign, mime type, and file size can be packed down into a mere **16 bytes**.

### 2. Modular Content-Encoding Stack

Like HTTP's `Content-Encoding`, HQFBP models its protocols as a stack of reusable, parameterizable bricks:
* **Compression:** `gzip`
* **Integrity:** `crc16`, `crc32`
* **Forward Error Correction (FEC):** Reed-Solomon `rs(n,k)`, RaptorQ `rq(l,m,r)`, Convolutional codes `conv(k,r)`
* **Scrambling/Framing:** Additive scramblers `scr(p,i)`, reassembly markers `chunk(s)`, and simple repeats `repeat(k)`

For example, a traditional APRS packet can be represented in this stack notation as:
`aprs, ax.25, crc16, bstuff, post_asm(0x7E), asm(0x7E), nrzi`

---

## Simulations and the RaptorQ Poisoning Trap

To find the most efficient combination of encodages, we performed **Monte-Carlo simulations** representing randomly flipped bits at a BER of $10^{-3}$. The objective was to map the Pareto frontier, finding the combinations that minimized both file loss and total transmitted bits.
And dear I learned a lot!

![](/images/hqfbp-explore-2-size-vs-loss.png)
![](/images/hqfbp-explore-2-size-vs-eff.png)

### Finding: Reed-Solomon is king

* Reed-Solomon is incredible. His presence in the stack make the whole highly reliable.

### Finding: The RaptorQ Poisoning Trap

* **RaptorQ** (a Fountain Code/code fontaine) is very powerful: it allows the receiver to rebuild the original file as soon as any sufficient amount of packets (PDUs) is received.
* However, it is extremely vulnerable to **corrupted packets**.
* If a single corrupted packet slips through without being caught by a PDU-level CRC check, it will poison the entire decoding matrix, failing the reassembly completely. Hence, a robust PDU CRC is mandatory.
* That is why a CRC must **always** ensure a fountain code packet is not corrupted before integrating it.

### Optimal Stacks (re)Discovered

* **Small files (< 1024 bytes):** Reed-Solomon (like `rs(240,224)`) is highly efficient and outperforms RaptorQ.
* **Larger files/images (< 50 KB):** Foutain code dominates in file recovery rate, provided it is protected by a solid CRC.

![Graph describing the file loss vs file size](/images/hqfbp-explore-5-big-size-vs-loss.png)

Winners are all well known combination, but know I have understood why!

* `chunk(180),h,crc32,scr(0x21001),rs(240,224)`
* `rq(dlen,180,20%),crc32,h,rs(240,224)`
* `chunk(68),h,crc32,scr(0x21001),rs(120,112),conv(7,1/2)`
* `rq(dlen,68,20%),crc32,h,rs(120,112),conv(7,1/2)`

---

## Cognitive Radio and the Hailing Channel

Inspired by the vision of Joseph Mitola III (the father of Cognitive Radio), we want radios to understand their environment and adapt dynamically.

Rather than hardcoding static reception setups, HQFBP implements a **Hailing Channel** ([Hailing Specification](https://github.com/loic-fejoz/hqfbp/blob/main/HAILING.md)). By transmitting a compact announcement packet containing the exact structure of the encoding stack (e.g. which modulation, codec, and protocol are used), the receiver can auto-configure itself on the fly to decode incoming transmissions.

Hailing Channel is also a concept [emphasized by Steve Strogh N8GNJ](https://www.zeroretries.org/p/zero-retries-0220?open=false#%C2%A7hailing-channel-for-packet-radio).

---

## Next steps

If you want to give it a try, [HQFBP Rust implementation](https://github.com/loic-fejoz/hqfbp-rs) is my current reference implementation.
From both repositories, you will have everything at hand to reproduce the simulations' scenarios or use it on air!
I would also like to test [Daniel Estevez (EA4GPZ)' erasure FEC](https://destevez.net/2023/05/an-erasure-fec-for-ssdv/).
I also would like to use HQFBP as a convergence layer for Delay/Disruption tolerant network.

*In the [next post](/radio/2026/08/25/dtn-bundle-hardy/), we will start looking at DTN Delay/Disruption Tolerant Network.*
