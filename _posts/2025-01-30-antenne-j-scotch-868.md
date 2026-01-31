---
layout: post
title: "Antenne J en scotch de cuivre pour Meshtastic (868MHz)"
date: 2025-01-30 14:00:00
author: Loïc
tags : [radio, antenne, meshtastic]
lang: fr
categories: radio
---

Cette étude documente la fabrication d'une antenne J-pole pour la fréquence **868MHz** (Meshtastic) en utilisant du ruban adhésif de cuivre sur un support isolant. Cette méthode est idéale pour le prototypage rapide mais comporte plusieurs points critiques.

![Plan de l'antenne J-pole 868MHz](/images/j-meshtastic-868/j-antenna-scotch.png)

### Les Écueils à Éviter (Hardware Hacking Rules)

La réalisation d'une telle antenne paraît simple, mais les performances dépendent de détails cruciaux :

1.  **Le Support (le piège de la couche diélectrique)** : Le choix du matériau support est vital. J'ai utilisé une plaque fine de PVC/Polypropylène. Évitez absolument le bois ou les cartons épais qui absorbent l'humidité, car cela désaccorde immédiatement l'antenne (detuning).
2.  **La Mesure bord-à-bord** : Les dimensions doivent être mesurées de bord à bord du ruban de cuivre, et non de centre à centre. Sur ces fréquences (λ ≈ 34cm), une erreur de quelques millimètres déplace significativement la résonance.
3.  **Les Effets de Bord (Corner Reflections)** : Les angles droits sur le ruban de cuivre peuvent créer des réflexions de signal indésirables. Il est fortement recommandé de **biseauter les angles à 45°** pour améliorer la circulation du courant RF.
4.  **La Conductivité de l'Adhésif** : Bien que l'adhésif conducteur facilite la vie, assurez-vous de la continuité électrique parfaite au point d'alimentation.

![Réalisation finale de l'antenne](/images/j-meshtastic-868/20240907_154013.jpg)

### Synthèse des Tests

L'antenne a été conçue selon la méthode [W6NBC](https://w6nbc.com/). Elle offre une solution extrêmement légère et facile à intégrer dans des boîtiers de nœuds Meshtastic.

**[Accéder au projet complet sur GitHub](https://github.com/loic-fejoz/antenna-carnival/tree/main/j-meshtastic-868)**
