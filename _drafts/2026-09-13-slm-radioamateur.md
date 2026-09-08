---
layout: post
title: "Un SLM pourrait-il devenir radioamateur ?"
date: 2026-09-13 00:30:00
author: Loïc
tags : [SLM, LLM, GenAI, radioamateur, radio]
lang: fr
categories: radio
summary: Evaluation de SLM fonctionnant sur 8Go de vRAM sur les questions de l'examen radioamateur Français
---

_TLDR: vraissemblablement oui, même sur une machine avec uniquement 8Go de vRAM ...à condition d'avoir accès à une calculatrice !_

## Examen Radioamateur

Je suis radioamateur. Pour cela, il faut passer [un examen organisé par l'ANFR](https://www.anfr.fr/gerer/radioamateurs/presentation-des-epreuves-dexamen). Il consiste en un QCM comportant 20 questions de réglementation et 20 questions de type technique. Une seule réponse est exacte. La calculatrice est autorisé mais pas les notes ou livres. Il faut donc connaitre les limites des bandes de radiofréquences, mais aussi le code couleur des résistances, etc.

_NB : Je ne peux que vous recommender de passer cet examen pour qui veut expérimenter et comprendre les radiofréquences, communiquer à travers le monde, ou entre machines. C'est un vrai terrain de jeu avec pleins de hobbys dans le hobby._

## SLM

D'un autre côté, en tant que passionné d'informatique, je ne peux que suivre les évolutions de l'IA générative (GenAI / LLM) et plus particulièrement son déploiement en local. Quand on dit en local, cela veut dire que le modèle est utilisé sur ma machine sans dépendance à Internet et au grand fournisseur d'IA bien connu. Ceux-ci "exécutent" (on parle d'inférences) des grands modèles, d'où le "L" de LLM pour "Large Language Model". N'ayant pas un datacenter sous la main mais uniquement une carte graphique Nvidia RTX 2080 avec 8Go de vRAM, je ne pourrais utiliser que des petits modèles: Small Language Model (SLM). Ces modèles existent en différentes versions basés sur la taille des paramètres. C'est ce que l'on appelle la quantisation.

Ceci sera donc le fils conducteur de mes tests à venir. Certains pourraient dire que je compare des choses différentes à cause des quantization différentes mais mon objectif est d'obtenir le meilleur score pour MA machine. Les experts noteront d'ailleurs que 8Go de vRAM c'est vraiment peu malgré les progrès des SLMs.

## Questions d'examen

Revenons en à la question de cet article : un SLM peut-il devenir radioamateur ?
Pour cela, il nous faudrait les questions de l'examen mais elles ne sont pas publiques. Par contre, un groupe de radioamateurs rassemble depuis des années les souvenirs des questions que les nouveaux radioamateurs ont eu lors de leurs passages. Elle sert notamment dans la merveilleuse [suite d'outils pour réviser appeler _Exam'1_](https://exam1.r-e-f.org/accueil). Personnellement j'avais utilisé la version Android. Bref, nous avons donc sous la main une base de données d'environ 2900 questions parfaitement exploitables ! Mais de nombreuses questions se basent sur des schémas, soit de circuits électroniques, soit de synoptiques de transceivers. Une sélection doit être faite sur des modèles multi-modaux, c'est à dire capable d'interpréter les images nativement.

## Llama-server et modèles multimodaux

Passons dans le concret maintenant. J'utilise `llama-server` pour exposer localement une API d'inférence. C'est lui qui déploie et exécute le modèle. Mais comme vous allez le voir après, utiliser un agent, ce n'est pas que juste envoyer du texte et recevoir du texte en réponse. Il y a certains formats à respecter pour que SLM puisse appeller des outils (fonctions) comme python par exemple. Cela fait partie des nombreuses options de `llama-server` auxquelles il faut faire attention, comme le fait aussi de ne gérer qu'une session à la fois (`--parallel 1`). Voici au final, les modèles, leurs quantisations, et les templates que j'ai utilisé :

| Modèle | Quantification | Fichier Poids GGUF | Template de Chat (Jinja) | Format d'Appel d'Outils |
| :--- | :---: | :--- | :--- | :--- |
| **Gemma-4-E4B-it** | `Q4_K_M` | `gemma-4-e4b-it-q4_k_m.gguf` | `NousResearch-Hermes-2-Pro-Llama-3-8B-tool_use.jinja` | ChatML / Hermes Tool-Use |
| **Ornith-1.5-9B** | `Q3_K_M` | `ornith-1.5-9b-q3_k_m.gguf` | `NousResearch-Hermes-2-Pro-Llama-3-8B-tool_use.jinja` | ChatML / Hermes Tool-Use |
| **Ministral-3-8B-Instruct** | `Q4_K_M` | `ministral-3-8b-instruct-q4_k_m.gguf` | `mistral_official_chat_template.jinja` | Officiel Mistral `[TOOL_CALLS]` |
| **Qwen3-VL-8B-Instruct** | `Q3_K_M` | `Qwen_Qwen3-VL-8B-Instruct-Q3_K_M.gguf` | `froggeric_qwen_chat_template.jinja` | ChatML (Ajusté sans pré-injection `<think>`) |
| **Qwen2.5-VL-7B-Instruct** | `Q4_K_M` | `qwen2.5-vl-7b-instruct-q4_k_m.gguf` | `froggeric_qwen_chat_template.jinja` | ChatML / Qwen Native |
| **Phi-4-Multimodal-Instruct** | `Q4_K_M` | `phi4-mm-Q4_K_M.gguf` | `phi4_official_chat_template.jinja` | Phi-4 Native (`<|end|>`) |
| **Pixtral-12B** | `Q3_K_M` | `mistral-community_pixtral-12b-Q3_K_M.gguf` | `mistral_official_chat_template.jinja` | Officiel Mistral `[TOOL_CALLS]` |
| **Qwen3.6-35B-A3B (MoE)** | `UD-IQ2_M` | `Qwen3.6-35B-A3B-UD-IQ2_M.gguf` | `froggeric_qwen_chat_template.jinja` | ChatML / Qwen Native |


## Préparation du benchmark & Inspect AI

Cette liste est définie a posteriori car j'ai utilisé tout d'abord un script développé à façon sur la base de 20 questions pour voir ce que cela donnait. Et cela m'a permis d'affiner certains critères déjà mentionnés comme l'aspect multimodal ou encore le fait d'être full GPU (option `-ng` de `llama-server`).

Par exemple, à un moment, j'avais ces **(faux et insignifiants) résultats mais véritables indices sur la direction** à prendre:

![](/images/preliminary_benchmark_local_accuracy_vs_vram.png)
![](/images/preliminary_benchmark_local_global.png)

On voit par exemple qu'Ornith en Q4 était bien plus lent car j'avais mal configuré et qu'il tournait partiellement sur mon CPU. On voit aussi que j'ai testé un pipeline de traduction d'une image en texte puis utilisation d'un autre SLM pour répondre à la question (sans trop de succès). Bref j'ai aussi beaucoup crashé `llama-server` avant d'arriver à un benchmark stable. Dans le lot, j'ai aussi vu des raisonnements corrects mais des résultats numériques faux. Il est bien connu que les LLMs sont mauvais de ce point de vue.

Dans la base de questions, j'ai trouvé aussi que les images étaient systématiquement liées aux questions alors même que certaines étaient déjà exactement traduite dans la partie textuelle. De même certains résultats de reconnaissance de caractères étaient imparfait (par exemple `Ension` au lieu de `Tension`). J'ai donc fait un petit nettoyage pour garder l'essentiel dans le prompt fournit aux SLMs.

Une fois ces préliminaires faits, je suis passé à Inspect AI. C'est un framework de tests dédiés à l'IA. Il permet facilement d'exprimer un benchmark, son harnais, et de traquer les résultats des executions. C'est essentiel pour passer d'un script dans un coin de table à un benchmark reproductible. Il permet de définir le prompt system, le prompt utilisateur, les timeouts, les outils auxquels le LLM a accès, etc. Or, après un rapide test sur un sous-ensemble de questions, on voit qu'il y a une grande diversité dans les capacités des SLMs.

## Prompt système et utilisateur

J'en suis donc venu à définir 4 configurations différentes :

1. one-shot : le SLM n'a accès à rien d'autres que lui-même. Cela permet de tester la connaissance en propre du modèle.
2. python uniquement : le SLM peut executer du code python et donc s'en servir comme calculatrice.
3. python + feuille de triche : Le SLM a toujours accès à Python mais aussi peut appeler 2 outils, un qui lui donne les limites de bandes applicables en France, et un autre outil qui lui donne un rappel des principales formules (loi d'ohm, etc).
4. tous les outils précedents + limites dans le prompt système : comme précédemment mais en plus on indique explicitement les limites dans le prompt.

A posteriori, on pourrait se demander pourquoi cette configuration n°4. Mais en fait, les petites SLMs se font vite distraire et ne vont pas  forcément faire appel à l'outil leur donnant les limites de bandes, alors que s'ils l'ont dans leur contexte, ils seraient plus à même de répondre correctement.
Oui c'est forcément un peu tricher mais il ne faut pas oublié que le contexte; c'est un peu comme la mémoire à court terme. Certains d'entre nous relisent leur fiches de révisions juste avant de rentrer dans le centre d'exament. Et puis intellectuellement, c'est intéressant de comprendre les limites des SLMs...

Le prompt utilisateur est assez simple :

```
Question : [Texte de la question]
[Image si présente]

Propositions :
A. [Option A]
B. [Option B]
C. [Option C]
D. [Option D]

INSTRUCTION IMPÉRATIVE :
Examine attentivement le schéma ou l'image fournie (si présente), utilise tes connaissances et tes outils pour vérifier la bonne réponse.
Indique ta réponse finale sur la DERNIÈRE LIGNE de ta réponse au format exact :
Réponse : X (où X est la lettre A, B, C ou D).
```

Le prompt système est lui configurable sur 4 niveaux pour aller de minimaliste, puis introduit la calculatrice via Python, puis des feuilles de triches, voire carrément contenir les informations de bases. En fonction des résultats, cela devrait me permettre de comprendre quels modèles utiliser plus tard et comment bien les utiliser. A ce stade, je m'attends à une amélioration entre la configuration 1 et 2 sur la partie technique, une amélioration entre la 1 et la 3 sur la partie réglementation, une amélioration entre la 1 et la 4 à condition que le prompt ne consomme pas trop de contexte...

Après quelques tests, il s'avère que le prompt peut subtilement perturber le taux d'appels inutiles aux fonctions. Par exemple, le modèle appelle python sur des questions réglementaires. A l'inverse, avoir les outils à disposition lui mets parfois le doute et le pousse de nouveau à faire des appels.
Il a donc fallu essayer de suivre les bonnes pratiques de prompt incitatif neutre (ou _neutral nudge prompt_). C'est loin d'être simple !

### 📌 Configuration 1

Zero-Shot Baseline : prompt_mode='agent_only', tools_mode='none'

Cette configuration teste la connaissance intrinsèque du modèle.

```
Tu es un expert diplômé radioamateur français (F4).
Tu réponds aux questions de l'examen avec rigueur et précision.
```

### 📌 Configuration 2

Python Seul : prompt_mode='agent_only', tools_mode='python-only'

Cette configuration met la calculatrice à disposition mais teste encore la connaissance intrinsèque du modèle.
    
```
Tu es un expert diplômé radioamateur français (F4).
Tu réponds aux questions de l'examen avec rigueur et précision

Tu as accès à `python` si besoin.
1. `python` : pour exécuter des calculs numériques exacts

Directives :
- Si tu connais la réponse avec certitude, réponds directement sans appeler d'outil.
- Pour les calculs mathématiques, utilise l'outil `python`.
IMPORTANT: Lorsque tu utilises l'outil `python`, donne UNIQUEMENT le code brut sans balises markdown (ne mets JAMAIS ```py ou ```).
```

### 📌 Configuration 3

Fiches à la demande : prompt_mode='agent_only', tools_mode='full'

Cette configuration apporte la calculatrice et les feuilles de triches.
Elle permet de voir si avec les connaissances, le modèle peut se sortir des pièges des spécificités françaises.

```
Tu es un expert diplômé radioamateur français (F4).
Tu réponds aux questions de l'examen avec rigueur et précision

Tu as accès aux outils `lookup_bandplan`, `get_essential_formulas` et `python` si besoin.
1. `lookup_bandplan` : pour vérifier les limites officielles des bandes ARCEP.
2. `get_essential_formulas` : pour consulter les formules de radioélectricité et résonance.
3. `python` : pour exécuter des calculs numériques exacts
4. 
Directives :
- Si tu connais la réponse avec certitude, réponds directement sans appeler d'outil.
- Si tu as un doute sur une valeur ou une formule, consulte l'outil approprié (`lookup_bandplan` ou `get_essential_formulas`).
- Pour les calculs mathématiques, utilise l'outil `python`.
IMPORTANT: Lorsque tu utilises l'outil `python`, donne UNIQUEMENT le code brut sans balises markdown (ne mets JAMAIS ```py ou ```).
```

### 📌 Configuration 4

Prompt In-Context Complet + Outils : prompt_mode='full', tools_mode='full'

Cette configuration est un coup de pouce apporter aux tout petits modèles qui ne font pas appel aux outils malgré leurs mises à disposition.
Elle agit comme quelqu'un qui relirai ses fiches juste avant d'entrer dans le centre d'examen.

Au passage, elle vous donne le contenu renvoyé par les outils sus-nommés.

```
Tu es un expert diplômé radioamateur français (F4).
Tu réponds aux questions de l'examen avec rigueur et précision.

Tableau officiel des bandes et limites de fréquences radioamateurs (France métropolitaine - ARCEP) :
- Bande 160m : 1,810 MHz à 1,850 MHz (Limites : 1,810 MHz et 1,850 MHz)
- Bande 80m : 3,500 MHz à 3,800 MHz (Limites : 3,500 MHz et 3,800 MHz)
- Bande 40m : 7,000 MHz à 7,200 MHz (Limites : 7,000 MHz et 7,200 MHz)
- Bande 30m : 10,100 MHz à 10,150 MHz (Limites : 10,100 MHz et 10,150 MHz)
- Bande 20m : 14,000 MHz à 14,350 MHz (Limites : 14,000 MHz et 14,350 MHz)
- Bande 17m : 18,068 MHz à 18,168 MHz (Limites : 18,068 MHz et 18,168 MHz)
- Bande 15m : 21,000 MHz à 21,450 MHz (Limites : 21,000 MHz et 21,450 MHz)
- Bande 12m : 24,890 MHz à 24,990 MHz (Limites : 24,890 MHz et 24,990 MHz)
- Bande 10m : 28,000 MHz à 29,700 MHz (Limites : 28,000 MHz et 29,700 MHz)
- Bande 6m : 50,000 MHz à 52,000 MHz (Limites : 50,000 MHz et 52,000 MHz)
- Bande 2m : 144,000 MHz à 146,000 MHz (Limites : 144,000 MHz et 146,000 MHz)
- Bande 70cm : 430,000 MHz à 440,000 MHz (Limites : 430,000 MHz et 440,000 MHz)
- Bande 23cm : 1240,000 MHz à 1300,000 MHz (Limites : 1240,000 MHz et 1300,000 MHz)

Fréquences limites notables :
- 14,350 MHz (borne supérieure de la bande 20m)
- 24,990 MHz (borne supérieure de la bande 12m)
- 50,000 MHz (borne inférieure de la bande 6m)
- 144,000 MHz (borne inférieure de la bande 2m)
- 430,000 MHz (borne inférieure de la bande 70cm)
- 1240,000 MHz et 1300,000 MHz (bornes de la bande 23cm)

Formules essentielles F4 (Électricité & RF) :
- Loi d'Ohm : U = R × I
- Puissance : P = U × I = I² × R = U² / R
- Énergie / Charge : Q = I × t | W = P × t
- Transformateur parfait : Np / Ns = Up / Us = Is / Ip  (Rapport de transformation : m = Ns / Np)
- Impédance caractéristique ligne : Coaxial Z₀ ≈ 138 × log₁₀(D / d) Ω | Ligne bifilaire Z₀ ≈ 276 × log₁₀(2D / d) Ω
- Fréquence & Longueur d'onde : λ (m) ≈ 300 / f (MHz) | f (MHz) ≈ 300 / λ (m)
- Antenne dipôle λ/2 : Longueur totale (m) ≈ 142 / f (MHz)
- Fréquence de résonance : f₀ = 1 / (2π √(L × C))
- Réactances : XL = 2π f L | XC = 1 / (2π f C)
- Décibels : Gain Puissance = 10 × log₁₀(P₂ / P₁) | Gain Tension = 20 × log₁₀(U₂ / U₁)
- Rappels dB : +3 dB = Puissance × 2 | +6 dB = Tension × 2

Tu as accès aux outils `lookup_bandplan`, `get_essential_formulas` et `python` si besoin.
1. `lookup_bandplan` : pour vérifier les limites officielles des bandes ARCEP.
2. `get_essential_formulas` : pour consulter les formules de radioélectricité et résonance.
3. `python` : pour exécuter des calculs numériques exacts.

Directives :
- Si tu connais la réponse avec certitude, réponds directement sans appeler d'outil.
- Si tu as un doute sur une valeur ou une formule, consulte l'outil approprié (`lookup_bandplan` ou `get_essential_formulas`).
- Pour les calculs mathématiques, utilise l'outil `python`.
IMPORTANT: Lorsque tu utilises l'outil `python`, donne UNIQUEMENT le code brut sans balises markdown (ne mets JAMAIS ```py ou ```).
```
## Résulats
