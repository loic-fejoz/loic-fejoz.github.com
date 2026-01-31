---
layout: post
title: "Hamradio Manifesto: From Utility to Creativity"
date: 2026-01-31 14:44:50
author: Loïc
tags : [radio]
lang: en
categories: radio
---

*Lire ce manifeste en [Français]({{ site.baseurl }}/radio/2026/01/31/manifeste-radio-XXI).*

The current approach to amateur radio, focused on communication and disaster relief, is no longer sufficient to attract today's technical profiles. This manifesto defines a strategic transition: moving from passive use to the design of resilient and innovative communication systems. It must return to what it was at its origin: the avant-garde of wireless experimentation. This manifesto proposes a return to a logic of construction by transforming the radio spectrum into a global innovation laboratory.


## The Waves as a Creative Space

Public utility should no longer be our only selling point, but the result of our technical excellence.

* Development axis: **Prioritize the design of experimental digital protocols**, signal processing optimized by the modern techniques available (MCU, CPU, DSP, GPU, FPGA, NPU, etc.).
* Target: **Captivate Makers, Hackers**, and engineers by offering a prototyping environment.
* The Vision: One no longer joins amateur radio to wait for a network failure, but to **build what industry cannot, or is not interested in, inventing**.


## For an "Open Stack" and Modular RF Pile

The current market relies on closed proprietary equipment (black boxes). The priority is now the opening of all hardware and software layers.

* Hardware/Software Decoupling: Separate the physical "Muscle" (amplifiers, filters) from the "Brain" (DSP, software). The user must be able to **interchange their radio's intelligence** just as they change a Linux distribution.
* Standardization: Allow developers to interact directly with the hardware via **open APIs, standardize I/Q flows**, and other flows between layers.
* Accessibility: Encourage the development of fully open-source RF stacks to **lower the barrier to entry for experimenters**.


## Mesh Networks and Technological Resilience

Develop a decentralized data infrastructure, independent of cellular networks and the commercial Internet, tolerant of delays and intermittency. The goal is to complement traditional traffic for more experimentation and diversity.

* **Independent Backbone**: Create a **world-wide HF/VHF data network**, capable of carrying text and images without any dependence on critical infrastructure or the Internet.
* **Dynamic protocol negotiation -- Hailing**: Establish smart calling (hailing) channels. By dynamically announcing details, modulation, and application layers of the used protocol (through initiatives like [HQFBP](https://github.com/loic-fejoz/hqfbp) and [its announcements](https://github.com/loic-fejoz/hqfbp/blob/main/HAILING.md)), we enable unprecedented agility and diversity of modes, while maintaining interoperability.
* **Amateur Radio as a Service**: Democratize access to the waves for operators without the possibility of fixed antennas via networks of remote stations shared in the cloud.

## RF Hacking and STEM Education

Amateur radio must once again become the school of technical curiosity.

* Protocol Analysis: **Encourage reverse-engineering** of radio protocols (proprietary IoT, LoRa, Sigfox, Bluetooth, Wifi, etc.) and satellite links to understand, learn, optimize, and secure.
* STEAM 2.0 Kits: **Develop "turnkey" pedagogical tools** linking radio to popular or school education activities (Science, Technology, Engineering, Art, and Mathematics).
* Gamification: **Modernize engagement** through mobile applications like "POTA/SOTA/xOTA" as vectors for real-world hardware performance testing. These challenges must be designed to captivate 16-25 year olds as well as experienced professionals.

## Conclusion: Building to be Useful

By prioritizing **creativity and technical openness**, we form a community of experts capable of responding to many technical innovation and usage challenges. This community is the engine that keeps the tool ready for emergencies. Paradoxically, it is through this creative transformation that **amateur radio will find its full utility!**
