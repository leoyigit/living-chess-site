---
title: "Distributed Decision-Making in Human and AI Teams"
date: "2026-03-20"
category: "Research"
excerpt: "Chess has served as a laboratory for AI for over seventy years. Living Chess asks a different question: what happens when the move emerges from negotiation within a structured collective?"
author: "Azad Heydarov"
author_role: "CEO & Co-Founder"
---

For more than seventy years, chess has served as one of the central laboratories of artificial intelligence. From the early theoretical programs associated with Alan Turing to the celebrated match between IBM Deep Blue and Garry Kasparov, the game has repeatedly been used to measure the progress of machine reasoning. More recently, reinforcement learning systems such as AlphaZero have shown that high-level strategic play can emerge without relying on human-crafted evaluation rules.

Yet one assumption has remained remarkably stable through these technological shifts. Chess engines are built as centralised decision-makers. A single system evaluates the position, searches possible continuations, and outputs a move.

Living Chess starts from a different premise. It does not ask how a machine can calculate the best move. It asks what happens when a move must pass through a structured collective before it becomes action.

## Chess as an Experimental Medium

Living Chess is not intended to produce a stronger chess engine. Instead, the project uses chess as a stable environment for studying how decisions emerge when responsibility for action is distributed across multiple agents. Because the rules of the game are fixed and its strategic landscape is well understood, chess provides an unusually clear setting in which to observe the dynamics of collective reasoning.

The value of chess here is not only historical. It is methodological. A chess position gives participants a shared problem, but not a shared interpretation. Some players see material balance. Others see threats, tempo, sacrifice, risk, or the pressure of acting too early. In a conventional engine, these tensions are compressed into a single evaluation. In Living Chess, they become visible.

For most of the history of artificial intelligence in chess, the central challenge has been computational: how to calculate the best move. Living Chess explores a different question. What happens when the move is no longer determined by a single evaluating intelligence, but emerges from negotiation within a structured collective?

## The Architecture of Distributed Choice

In Living Chess each participant controls a specific piece. The process through which a move is selected unfolds in three stages.

During the **suggestion phase**, participants propose candidate moves for their team within a limited time window. Players are not restricted to suggesting moves for their own piece; any participant may introduce an idea. The platform performs only a minimal role at this stage, verifying that proposed moves are legal.

The second stage introduces the **King as curator**. The player assigned to the King does not vote on the final move. Instead, the King selects which proposals advance to the decisive round. If more than three candidate moves appear, the King must curate exactly three options. If the King fails to act within the allotted time, the system automatically advances the three most frequently suggested moves.

The final move is determined through **weighted voting**. All members of the team participate, but voting influence is distributed according to the rank of the piece each player controls. Pawns carry minimal weight, while stronger pieces contribute proportionally greater influence.

The platform itself functions strictly as an execution layer. It verifies legality, aggregates votes, and produces the resulting move. Unlike conventional engines, it does not evaluate positions or recommend lines of play. This architecture shifts the focus of the game. Before a vote occurs, players must persuade teammates that a proposal deserves support. Strategic reasoning becomes intertwined with argument, timing, trust, rank, and anticipation of how others will interpret the position.

A move can be strong and still fail socially. Another can survive because it is legible, persuasive, or simply better placed within the rhythm of the group. This is where Living Chess becomes more than a chess variant. It becomes a small laboratory for observing how uncertainty is translated into collective action.

## Current Experiments

Living Chess is already being played in several experimental formats. The first stage involved human teams playing against human teams within the distributed decision structure. These early sessions established the baseline dynamics of the system and allowed us to observe how collective deliberation shapes move selection.

What became visible in these sessions was not only strategy, but the social life of strategy: hesitation, improvised authority, humour, silence, frustration, confidence, and the uneven ways in which people enter a decision-making process.

We are currently conducting agent-versus-agent matches, in which autonomous agents occupy piece roles and operate within the same architecture of suggestions, curation, and weighted voting. These experiments are ongoing, and we are collecting decision logs and gameplay data.

This distinction matters. A conventional chess engine speaks as one voice. In Living Chess, algorithmic agents are placed inside a collective procedure. They must suggest, wait, compete for selection, and become part of a voting structure. The question is no longer only whether an agent can evaluate a position, but how its evaluations behave when inserted into a distributed decision system.

In the coming weeks we will begin publishing detailed records from these games on this blog, including video recordings, voting rounds, and commentary on how specific decisions emerged during play.

## Next Phase: Hybrid Teams

The next stage of the project will introduce hybrid teams composed of humans and agents. These teams will compete against other human-agent combinations while operating under the same distributed decision framework. This transition opens several questions that conventional chess environments rarely allow researchers to observe.

When algorithmic agents with different heuristics interact within a shared deliberative system, does the resulting play diverge from the patterns produced by centralised engines?

Does diversity among agents improve decision quality through complementary evaluations, or does it simply increase noise within the voting process?

How do human players adapt when their teammates include algorithmic participants with recognisable strategic tendencies?

And what kind of collective intelligence appears when neither humans nor machines hold the decision alone?

Living Chess treats these questions not as metaphors, but as design problems. The board is familiar. The rules are stable. The move is visible. But the intelligence behind the move is no longer singular.
