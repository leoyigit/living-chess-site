---
title: "Distributed Decision-Making in Human and AI Teams"
date: "2026-03-20"
category: "Research"
excerpt: "Chess has served as a laboratory for AI for over seventy years. Living Chess asks a different question: what happens when the move emerges from negotiation within a structured collective?"
author: "Azad Heydarov"
author_role: "CEO & Co-Founder"
---

For more than seventy years, chess has served as one of the central laboratories of artificial intelligence. From the early theoretical programs proposed by Alan Turing to the celebrated match between IBM Deep Blue and Garry Kasparov, the game has repeatedly been used to measure the progress of machine reasoning. More recently, reinforcement learning systems such as AlphaZero have demonstrated that high-level strategic play can emerge without relying on human-crafted evaluation rules. Despite these technological shifts, one assumption has remained largely intact. Chess engines are built as centralised decision-makers. A single system evaluates positions, searches possible continuations, and outputs a move.

## Chess as an Experimental Medium

Living Chess is not intended to produce a stronger chess engine. Instead, the project uses chess as a stable environment for studying how decisions emerge when responsibility for action is distributed across multiple agents. Because the rules of the game are fixed and its strategic landscape is well understood, chess provides an unusually clear setting in which to observe the dynamics of collective reasoning.

For most of the history of artificial intelligence in chess, the central challenge has been computational: how to calculate the best move. Living Chess explores a different question. What happens when the move is no longer determined by a single evaluating intelligence, but emerges from negotiation within a structured collective?

## The Architecture of Distributed Choice

In Living Chess each participant controls a specific piece. The process through which a move is selected unfolds in three stages.

During the **suggestion phase**, participants propose candidate moves for their team within a limited time window. Players are not restricted to suggesting moves for their own piece; any participant may introduce an idea. The platform performs only a minimal role at this stage, verifying that proposed moves are legal.

The second stage introduces the **King as curator**. The player assigned to the King does not vote on the final move. Instead, the King selects which proposals advance to the decisive round. If more than three candidate moves appear, the King must curate exactly three options. If the King fails to act within the allotted time, the system automatically advances the three most frequently suggested moves.

The final move is determined through **weighted voting**. All members of the team participate, but voting influence is distributed according to the rank of the piece each player controls. Pawns carry minimal weight, while stronger pieces contribute proportionally greater influence.

The platform itself functions strictly as an execution layer. It verifies legality, aggregates votes, and produces the resulting move. Unlike conventional engines, it does not evaluate positions or recommend lines of play. This architecture shifts the focus of the game. Before a vote occurs, players must persuade teammates that a proposal deserves support. Strategic reasoning becomes intertwined with argument, timing, and anticipation of how others will interpret the position.

## Current Experiments

Living Chess is already being played in several experimental formats. The first stage involved human teams playing against human teams within the distributed decision structure. These early sessions established the baseline dynamics of the system and allowed us to observe how collective deliberation shapes move selection.

We are currently conducting agent-versus-agent matches, in which autonomous agents occupy piece roles and operate within the same architecture of suggestions, curation, and weighted voting. These experiments are ongoing, and we are collecting decision logs and gameplay data.

In the coming weeks we will begin publishing detailed records from these games on this blog, including video recordings, voting rounds, and commentary on how specific decisions emerged during play.

## Next Phase: Hybrid Teams

The next stage of the project will introduce hybrid teams composed of humans and agents. These teams will compete against other human–agent combinations while operating under the same distributed decision framework. This transition opens several questions that conventional chess environments rarely allow researchers to observe.

When algorithmic agents with different heuristics interact within a shared deliberative system, does the resulting play diverge from the patterns produced by centralised engines?

Does diversity among agents improve decision quality through complementary evaluations, or does it simply increase noise within the voting process?

And how do human players adapt when their teammates include algorithmic participants with recognisable strategic tendencies?
