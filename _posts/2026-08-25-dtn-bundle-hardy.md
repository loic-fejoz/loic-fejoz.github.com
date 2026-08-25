---
layout: post
title: "Hardy DTN & HQFBP"
date: 2026-08-25 19:08:00 +0200
author: Loïc
tags : [radio, satellite, DTN, HQFBP, rust]
lang: en
categories: radio
summary: A brief about the Bundle Protocol v7 (BPv7), a short list of available implementations, and a convergence layer based on HQFBP
---

*This is the second post in a series exploring [Delay-Tolerant Networking (DTN)](/tags/#dtn) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## What is Delay/Disruption-Tolerant Networking (DTN)?

From an application perspective, DTN is just a very special network layer meant to be highly asynchronous with high-latency in mind.
Newer DTN implementations operate using the **Bundle Protocol version 7 (BPv7 / RFC 9171)**. Unlike traditional IP routing which assumes a continuous end-to-end path, BPv7 works on a "Store, Carry, and Forward" paradigm. Actually, DTN will leverage any kind of physical network one may have.

This is why the architecture is divided into two primary actors:
1. **Bundle Processing Agent (BPA):** The central router. It stores bundles, makes routing decisions, and coordinates with services.
2. **Convergence Layer Adapter (CLA):** The adapter that interfaces the BPA with specific transport mediums. The BPA doesn't need to know if a bundle is traveling over TCP, Bluetooth, LoRa, or raw radio KISS frames; it delegates transmission of bundles to the dedicated CLAs.

So actually, a bundle moves from one producer application connected to a BPA to another BPA via a first CLA. It is stored there until another CLA enables it to move to another BPA, and so on, until it eventually reaches the BPA where the consumer application will use the data. Along the road, BPAs are always checking the lifetime of the bundle so it may be destroyed. Also, the routing applied by one BPA is very specific to its configuration and the scientific literature has plenty of routing algorithms, e.g., Spray-and-wait, PRoPHET, Hybrid DTN-MANET, contact graph routing, HYMAD, etc. Note that this is very different from a network like Meshtastic for instance, as bundles can be stored and the routing algorithm is not one-size-fits-all.

---

## The Landscape: BPv7 Implementations

Implementations of DTN BPv7 range from cloud oriented servers to memory-constrained microcontrollers:

* [**NASA ION (Delay-Tolerant Networking):**](https://github.com/nasa-jpl/ION-DTN) Written in C, highly robust, and widely used by NASA for space operations. It is the historical implementation.
* [**picoD3TN**](https://gitlab.com/d3tn/picod3tn) / **microD3TN:** Developed by D3TN. Written in C, they are optimized for resource-constrained systems like small microcontrollers and embedded devices. [picoD3TN has even been sent into space recently](https://lnkd.in/p/e9M7BEfB).
* **dtn7-rs / dtn7-go:** Modern implementations in Rust and Go, offering clean APIs for application development and desktop/server routing.
* [**Hardy:**](https://github.com/ricktaylor/hardy/) A modular, compliant, and extensible BPv7 solution written in reliable, asynchronous Rust initiated by Rick Taylor, chairman of the IETF Delay/Disruption Tolerant Networking (DTN) Working Group. Hardy targets RFC compliance.

---

## Hardy: a modern BPA in Rust

Hardy (`hardy-bpa-server`) brings the power of modern asynchronous Rust to the DTN domain. Hardy is built for the cloud and high-performance server deployments while still maintaining Rust `no_std` compatibility in its core libraries.

* **Thread-Safety & Performance:** Designed for concurrent operations and high-throughput deployments.
* **Pluggable Storage:** Flexible backends ranging from light SQLite databases and postgres instances to S3 object storage for bundle payloads.
* **Time-Variant Routing (TVR):** Built-in support for dynamic routing based on predictable schedules (e.g., satellite passes, scheduled radio contacts).
* **gRPC API:** A clean interface that separates the BPA daemon from user applications and convergence layers.

---

## My Radio Bridge: `hardy-hqfbp-cla`

To bridge Hardy's BPv7 bundles with the custom **HQFBP** radio link introduced in [our first post](/radio/2026/08/20/beyond-ax25-hqfbp/), I built [`hardy-hqfbp-cla`](https://github.com/loic-fejoz/dtn-hdy-hqfbp-cla). This is a standalone Convergence Layer Adapter (CLA) daemon written in Rust. It bridges the Hardy BPA (communicating via gRPC using hardy-proto) with a radio communication link running [HQFBP (Hamradio Quick File Broadcasting Protocol)](/tags/#hqfbp) over a KISS frame TCP link.

1. It registers on the running Hardy BPA daemon via gRPC.
2. It processes incoming bundles, extracts destination EIDs, and packages them into KISS frames.
3. It sends the KISS frames over a TCP socket.

### Tested "Offline"

For now, this integration has been tested **offline**—using simulated local connections, i.e., over a local KISS-over-TCP socket, rather than physical radio transmitters. This allowed me to validate the reassembly manager, the deframer, and the FQDN extraction rules in a controlled environment.

As expected, everything went smoothly and nothing spectacular happened. Yet this is an important step for me to bridge both worlds. By the way, if you have read the previous article, you know that it is unidirectional.

# Next steps

The next steps will involve moving this setup onto actual RF transceivers to test the stack under real-world noise and packet loss. I wonder if I should try a dedicated configuration of Direwolf or something more generic... What do you think?

*In the next post, we will explore how to interact with our running Hardy daemon from the command line using `dtn-hdy-utils`. Indeed I am now using my hardy instance on a daily basis!*
