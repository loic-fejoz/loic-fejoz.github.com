---
layout: post
title: "Delay-Tolerant Resource Retrieval: The DTN Basket Protocol (dtnbasket)"
date: 2026-08-20 13:58:48
author: Loïc
tags : [radio, dtn, protocol, cbor]
lang: en
categories: radio
summary: A deep dive into the DTN Basket Protocol, an asynchronous, CBOR-based resource retrieval schema for Bundle Protocol v7 networks.
---

*This is the fifth post in a series exploring Delay-Tolerant Networking (DTN) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## The Web without Connections

Standard web communication (HTTP/HTTPS) is inherently synchronous. A client opens a TCP connection to a server, sends a request, and waits for a response. In delay-tolerant networks—where links are intermittent and round-trip times can be measured in minutes, hours, or days—this model breaks down completely.

To retrieve resources (such as documents, pages, or files) across a DTN, we need an asynchronous, batch-oriented request protocol. This is the purpose of the **DTN Basket Protocol** ([draft-f4jxq-dtn-basket-00](https://github.com/loic-fejoz/dtn-hdy-utils/blob/main/draft-f4jxq-dtn-basket-00.txt)).

---

## Protocol Architecture & Design

The Basket Protocol specifies a binary application schema based on **CBOR (RFC 8949)**. It operates over the Bundle Protocol v7 (BPv7), sending a `BasketRequest` bundle and eventually receiving a `BasketResponse` bundle.

A key design choice of the protocol is the separation of planes:
* **Control Plane:** The `BasketRequest` and `BasketResponse` objects containing metadata, request options, and **CoAP-mapped status codes** (e.g. 2.05 Content, 4.04 Not Found) serialized in CBOR.
* **Data Plane:** The actual raw resource contents (like an HTML page, a PDF document, or an image file) returned in distinct, correlated bundles to avoid bloating the control structure.

---

## Request Operations (Methods)

The protocol defines five core methods (operations) that a client can request:

### 1. GET (op=0) - Resource Retrieval
The primary command to fetch files or URLs. The client specifies a target URI (which can be a remote URL like `https://...` or `gemini://...`, or a local mapped resource like `urn:dtn:...`). The responder resolves the URI, fetches the content, and routes it back as a bundle payload.

### 2. CHECK (op=1) - Metadata Verification
Equivalent to an HTTP `HEAD` request. The client queries the responder for a resource's metadata (such as file size, MIME type, and cryptographic hash) without downloading the file itself. This is critical for saving radio bandwidth before deciding to download a massive file.

### 3. SEARCH (op=2) - Multi-Resource Discovery
Used to perform delta synchronization. The client supplies a path or directory and a regular expression. The responder searches its allowed paths and returns metadata lists for files matching the query. This is particularly useful to see what files are available on a remote node before requesting them.

### 4. CANCEL (op=3) - Pending Request Abort
Instructs a responder node to abort any queued, slow-running, or large transfer tasks that have not yet been transmitted back.

### 5. LIST (op=4) - Bibliographic Indexing
Enables listing the files within a directory or category exposed by the responder, allowing users to browse remote file systems over high-latency links.

---

## CBOR Representation

By utilizing CBOR, the protocol maintains a very low overhead. A standard GET request targeting multiple URIs can be packed into a few dozen bytes, preserving valuable RF bandwidth.

On the security side, the responder enforces strict boundaries:
* **Directory Traversal Protection:** Responders only serve files inside configured `allowed_dirs`.
* **SSRF Protection:** Outbound HTTP/HTTPS requests targeting loopback or private network IP ranges are blocked to prevent internal service abuse.

---

*In the final post, we will look at how we deploy this entire stack, connecting local nodes to the public amateur radio 44net and discussing future satellite deployments with the RADIANT project.*
