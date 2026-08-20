---
layout: post
title: "Enter the Bundle: Meeting Hardy, a Rust BPv7 Router"
date: 2026-08-20 13:52:59
author: Loïc
tags : [radio, dtn, rust, space]
lang: en
categories: radio
summary: An introduction to the Bundle Protocol v7 (BPv7), a comparison of available implementations, and a hands-on look at Hardy, a high-performance Rust BPA.
---

*This is the second post in a series exploring Delay-Tolerant Networking (DTN) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## What is Delay-Tolerant Networking?

At the network layer, DTN operates using the **Bundle Protocol version 7 (BPv7 / RFC 9171)**. Unlike traditional IP routing which assumes a continuous end-to-end path, BPv7 works on a "Store, Carry, and Forward" paradigm. 

The architecture is divided into two primary actors:
1. **BPA (Bundle Processing Agent):** The central router. It stores bundles, makes routing decisions, and coordinates with services.
2. **CLA (Convergence Layer Adapter):** The adapter that interfaces the BPA with specific transport mediums. The BPA doesn't need to know if a bundle is traveling over TCP, Bluetooth, LoRa, or raw radio KISS frames; it delegates those physical transmission details to a dedicated CLA.

---

## The Landscape: BPv7 Implementations

Depending on the use case—ranging from high-end cloud servers to memory-constrained microcontrollers—several BPv7 implementations are available:

* **NASA ION (Delay-Tolerant Networking):** Written in C, highly robust, and widely used by NASA for space operations. It is extremely comprehensive but has a steep learning curve.
* **picoD3TN / microD3TN:** Developed by D3TN. Written in C, they are optimized for resource-constrained systems like small microcontrollers and embedded devices.
* **dtn7-rs / dtn7-go:** Modern implementations in Rust and Go, offering clean APIs for application development and desktop/server routing.
* **Hardy:** A modular, compliant, and extensible BPv7 solution written in reliable, asynchronous Rust. It is built from the ground up for the cloud and high-performance server deployments while maintaining `no_std` compatibility in its core libraries.

---

## Meeting Hardy: Modern BPA in Rust

Hardy (`hardy-bpa-server`) brings the power of modern asynchronous Rust to the DTN world:

* **Thread-Safety & Performance:** Designed for concurrent operations and high-throughput deployments.
* **Pluggable Storage:** Flexible backends ranging from light SQLite databases and postgres instances to S3 object storage for bundle payloads.
* **Time-Variant Routing (TVR):** Built-in support to dynamic routing based on predictable schedules (e.g., satellite passes, scheduled radio contacts).
* **gRPC API:** A clean interface that separates the BPA daemon from user applications and convergence layers.

---

## The Radio Bridge: `hardy-hqfbp-cla`

To bridge Hardy's BPv7 bundles with the custom **HQFBP** radio link introduced in our first post, we built `hardy-hqfbp-cla`. 

This standalone daemon acts as a Convergence Layer Adapter:
1. It registers on the running Hardy BPA daemon via gRPC.
2. It processes incoming bundles, extracts destination EIDs, and packages them into KISS frames.
3. It sends the KISS frames over a TCP socket.

### Tested "Offline"
For now, this integration has been tested **offline**—using simulated local connections (such as UDP loopbacks and local KISS-over-TCP sockets) rather than physical radio transmitters. This allowed us to validate the reassembly manager, the deframer, and the FQDN extraction rules in a controlled environment. 

Our next steps will involve moving this setup onto actual RF transceivers to test the stack under real-world noise and packet loss.

---

*In the next post, we will explore how to interact with our running Hardy daemon from the command line using `dtn-hdy-utils`.*
