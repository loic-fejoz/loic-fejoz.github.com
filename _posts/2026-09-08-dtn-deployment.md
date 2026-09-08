---
layout: post
title: "6. Public 44net DTN node, Satellites, and the RADIANT Project"
date: 2026-09-08 07:50:00 +0200
author: Loïc
tags : [radio, DTN, 44net, satellite, space]
lang: en
categories: radio
summary: Deploying a persistent DTN node on the amateur radio 44net, configuring peers, and looking ahead to QO-100 geostationary satellite meshes with the RADIANT project.
---

*This is the sixth and final post in a series exploring [Delay-Tolerant Networking (DTN)](/tags/#dtn) and resilient communication stacks built for amateur radio, space payloads, and emergency networks.*

---

## Expanding from local tests to global mesh

I wanted to test delay-tolerant networks in my daily life, moving past offline loopback simulations and phone-to-phone tests. So I setup a persistent backbone infrastructure that peers can connect to, exchange bundles, and fetch asynchronous resources.

To address this, I have deployed a public instance of the **Hardy** BPA server on the amateur radio IP network (AMPRNet / 44net).

---

## The Network Architecture

My current testing infrastructure bridges mobile field clients with local desktop machines through this public backbone node.

![](/images/dtn-deployment.png)

In this model:
* Field operators use **`dtn-android-messenger`** to chat, share files, and collect SenML weather telemetry.
* Devices synchronize opportunistically via Bluetooth.
* Once a gateway node gets connectivity to the 44net backbone via Internet IP address, it connects to the public Hardy node at **`44.27.131.233`** using the TCPCLv4 convergence layer.
* The public node acts as a persistent mailbox, routing bundles back to home stations or local desktop setups.

---

## Peering Configuration

*Note: Hardy uses YAML for its server configuration, alongside a custom line-by-line configuration for static routing rules.*

To peer your local Hardy node with the public gateway, add the connection under the `clas` section of your configuration file:

```yaml
# In /etc/hardy/my-config.yaml
clas:
  - name: tcpcl-44net-gateway
    type: tcpclv4
    address: "[::]:4556" # local listening port
    require-tls: false   # disabled for amateur radio compliance in case one connect over hamnet
    peers:
      - "44.27.131.233:4556" # outbound connection to my public node
```

Then, configure a static route rule to send any bundle matching a destination EID pattern through the gateway:

```text
# In /etc/hardy/static_routes
# Route all dtn:// traffic via my 44net gateway EID
dtn://*/** via dtn://f4jxq/
```

To check that it is properly configured, you can either try a ping to `dtn://f4jxq/echo`
or requests some statistics to see who else is using it by sending anything to `dtn://f4jxq/stats`.
You will receive back a log.

If you are using it, please, send me a simple text message to `dtn://f4jxq/chat`.

---

## The Next Step: QO-100 and the RADIANT Project

While internet-backed tunnels on 44net are excellent for testing the network layer, the ultimate goal of amateur radio is autonomous RF routing. 

Thanks to the [**RADIANT project**](https://radiant.amsat-uk.org/) (sponsored by AMSAT-UK, AMSAT-DL, Goonhilly Earth Station), as they are working to extend this DTN infrastructure to satellite links. The geostationary satellite **QO-100** (Qatar-OSCAR 100) provides a continuous amateur radio transponder spanning Europe, Africa, and parts of Asia. I am currently QRV for SSB voice, I still need a bit of work to transmit data on it.

So tomorrow, instead of relying on terrestrial routes:
* I will broadcast DTN bundles over HQFBP from my FOSM-1 satellite payload.  
* I will exchange DTN bundles via LickLider protocol directly up to **QO-100**.
* This will form a earth-based, low orbit, and geostationnary orbit delay-tolerant mesh network, providing delay/disruption tolerant network connectivity to remote stations.

---

## Conclusion

Over this six-part series, I have built a complete, open-source, delay-tolerant stack for the ham radio operator:
1. **Link Layer:** Optimizing file transfers with **HQFBP** and simulating bit error rates.
2. **Network Layer:** Running the high-performance Rust **Hardy** BPA daemon.
3. **CLI Utilities:** Automating actions on incoming bundles with `dtntrigger` and `dtn-hdy-utils`.
4. **Mobile Clients:** Taking DTN into the field with a native **Kotlin Android Messenger** featuring SenML telemetry dashboard.
5. **Application Protocol:** Requesting resources asynchronously with the **Basket Protocol**.
6. **Community Deployment:** Peering over **44net** and look ahead to satellite missions.

The code is open, the public gateway is live, and the mesh is waiting for your packets. 73!
