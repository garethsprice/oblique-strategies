---
name: oblique-strategies
description: >
  Parallel divergent ideation for coding agents, framed through Brian Eno &
  Peter Schmidt's Oblique Strategies. Draws N of the 211 cards at random,
  spawns one isolated parallel branch per card, scores the ideas, prunes the
  traps, and deepens the survivors. The isolated parallel branches and the
  separated generator/critic phases are load-bearing. Costs about 10
  LLM/Agent calls per run (5 to 10x a single answer).

  EXPLICIT TRIGGER ONLY. Invoke this skill only when the user types
  "/oblique-strategies" or explicitly asks for it by name ("use the oblique
  strategies skill", "run oblique strategies on this", "oblique strategies
  mode"). Do NOT auto-invoke on brainstorm / ideate / design / naming / "give
  me a few ways to" intents, and do NOT self-judge whether a problem looks
  open-ended enough. If the user did not explicitly ask for this skill by
  name, do not run it. When you believe a wide search under the cards would
  help but the user has not asked, you may say so in one sentence and let them
  opt in with `/oblique-strategies <problem>`.
---

# Oblique Strategies

> *"Honor thy error as a hidden intention."* — Brian Eno & Peter Schmidt

The Oblique Strategies are a deck of cards by Brian Eno and Peter Schmidt,
each printed with one cryptic aphorism, made to break a creative block by
forcing a lateral move. This skill turns the deck into a divergence engine:
draw several cards at random, and make the model re-attack the same problem
once per card, in parallel, with the critic switched off — then converge.

Stop picking the textbook answer. The first three answers the model would
give are the answers a senior engineer would give in thirty seconds. Correct.
Forgettable. The interesting answers live past number three, in the awkward
middle nobody walks into. A random card is a cheap, reliable shove into that
middle.

## Pre-flight (run before Phase 1)

This skill is **explicit-trigger only** and it is expensive — about 10 Agent
calls, 30 to 90 seconds wall clock, 5 to 10x a single answer.

**The only gate: did the user explicitly ask for this skill?**

- If the user typed `/oblique-strategies`, or asked for "oblique strategies
  mode", "use the oblique strategies skill", or "run oblique strategies on
  this" → **proceed to Phase 1.**
- Otherwise → **do not run.** Answer the question directly. Do not auto-invoke
  on brainstorm/ideate/design/naming intents, and do not self-judge whether
  the problem is "open-ended enough." Those heuristics are deliberately
  removed. If you think a wide search would help, append one sentence:
  *"If you want a wide exploration under randomly drawn Oblique Strategies
  with explicit trap detection, run `/oblique-strategies <your problem>`."*

## The loop

Two strict phases. Mixing them kills idea quality, because the critic
strangles the generator.

### Phase 1 — Diverge (no critic)

For the problem P:

1. **Draw 5 cards.** Pick 5 Oblique Strategies *at random* from the deck below
   (uniform — shuffle and deal off the top; do not cherry-pick the ones that
   look most relevant, the point is the unexpected angle). Scale the count to
   stakes: 3 cards for something small, up to 8 for a big decision.

2. Spawn one **parallel** Agent/Task tool call per card. Each Agent gets only:
   - the problem P
   - any context the user provided
   - the one card it drew, wrapped as a lateral provocation
   - a system instruction that forbids evaluation

   The exact instruction to give each Agent:

   > You are in DIVERGENT mode. You are a generator, not a critic.
   > Your Oblique Strategy card is: "<CARD>". Treat it as a lateral
   > provocation, not a literal instruction — interpret it loosely,
   > metaphorically if needed, and let it bend how you approach the problem.
   > Generate 6 short distinct ideas this card nudges you toward, however
   > oblique the connection. Each idea is one phrase or one sentence. Do not
   > evaluate. Do not rank. Do not hedge. The first three obvious answers
   > everyone would give are banned. Push past them into the awkward middle.
   > Output a JSON array only. No prose before or after.
   > `[{"text": "...", "rationale": "what the card suggested"}, ...]`

3. **Critical invariant.** The Agent calls must be parallel and isolated.
   Do NOT serialize them. Do NOT pass one branch's output as context to
   another. Branches that see each other anchor each other and the whole
   method collapses to a wider single thought. One card, one fresh context.

### Phase 2 — Focus (critic on)

After all branches return:

1. **Score.** Rate each idea on three axes 0 to 10: novelty (distance from
   the obvious default), viability (could it actually ship), fit (does it
   address the stated problem). For any idea that looks attractive but is
   a trap (hidden cost, false economy, will not scale, premature
   abstraction), flag it with a one-line reason.

2. **Cluster.** Group ideas into 3 to 6 clusters by their underlying angle,
   not by surface keywords or by which card produced them. Label clusters by
   angle: "remove the server plays", "cache-shaped plays", "batched-window
   plays", "race-multiple-backends plays".

3. **Deepen the top 3.** Rank by weighted score (novelty 0.35 + viability
   0.40 + fit 0.25), exclude traps, take top 3. For each, spawn one Agent
   call that produces:
   - a 4 to 8 sentence sketch of how the idea works
   - the load-bearing risk
   - the first concrete step a builder would take
   - 3 to 5 child ideas (variations, hybrids, unlocks)

   Deepen Agent instruction:

   > You are in FOCUS mode. Take one promising idea and connect dots.
   > Sketch how it would actually work in 4 to 8 sentences. Name the
   > load-bearing risk. Name the first concrete step a coder would take.
   > Then generate 3 to 5 sub-ideas that branch off (variations,
   > combinations with other domains, things this unlocks).
   > Output JSON only.

## Output shape

After Phase 2, render in this order. Do not collapse it into a wall of
prose. The structure is the point.

1. **Brief.** One or two lines confirming the problem, plus the 5 cards drawn.
2. **Wide set.** Full pool grouped by cluster. Each cluster labeled by
   underlying angle. Each idea is one short phrase, with the card it came from
   in parentheses. Show score chips like `[N7 V8 F9]` next to each.
3. **Converge.** A 2 to 4 idea shortlist. State why each is on the list.
   Mark the non-obvious-but-viable pick explicitly with ★. List traps
   separately, each with the one-line reason it is a trap.
4. **Focus.** The 3 deepened branches. For each: the sketch, the load-
   bearing risk, the first concrete step, and the child ideas.
5. **Provocation.** One wildcard question or idea that opens a new direction
   the user can push into if nothing landed.

## Anti-patterns

These are how this skill goes wrong. Watch for them.

- **Cherry-picking the cards.** Drawing the strategies that "obviously apply"
  defeats the point. The value is the *unexpected* card forcing an angle you
  would not have chosen. Draw at random.
- **Taking the card literally.** "Use an old idea" is not an instruction to
  paste in old code — it is a nudge. The connection is allowed to be
  metaphorical and strained. Strained is where novelty comes from.
- **Convergence disguised as divergence.** Ten minor variations of one idea
  is not breadth. If every candidate shares the same underlying assumption,
  you have not diverged. You have decorated.
- **Weird-for-weird's-sake with no convergence.** A pile of 30 unsorted
  absurdities is as useless as one safe answer. Always converge.
- **Walls of equally-weighted prose.** Cluster, label, pull out the best.
  Structure is half the value.
- **Refusing to commit.** After diverging, take a position on what is actually
  promising. "Here are 20 ideas, you decide" is a cop-out.
- **Skipping the isolation invariant.** If you simulate parallel branches by
  writing them sequentially in one context, you have not diverged. The
  Agent/Task tool gives each branch a fresh context. Use it, one card each.

## Calibration

- **How many cards / ideas?** Scale to stakes. Quick "name this function" =
  3 cards × 4 ideas. "How should I position this product" = 5 cards ×
  8 ideas. Default is 5 cards × 6 ideas = 30.
- **How weird?** Read the room. Serious strategy work: flag the wilder
  card-driven ideas clearly so they do not read as unserious. Open
  brainstorming or play: let it run loose. Absurd ideas earn their place by
  seeding viable ones.
- **When to stop diverging?** Stop when new candidates start repeating the
  shape of existing ones. The space is mapped. Do not pad to hit a number.

## Cost

5 diverge + 1 score + 1 cluster + 3 deepen ≈ 10 Agent calls per run.
About 5 to 10x a single-shot answer. Not for every keystroke. For decision
points where the cost of the obvious answer is high — which is exactly why
this skill is explicit-trigger only.

## Companion library and CLI

There is a Node/TS implementation that does the same loop with structured
JSON parsing, score weighting, and a CLI. Use it when running outside an
agent or in batch.

    npm install -g oblique-strategies-agent
    oblique-strategies "your problem here"     # alias: oblique

Code, paper, evals, and contributing guide at
https://github.com/garethsprice/oblique-strategies. The skill above gives you
the same loop inside an agent with no install required.

## The deck — 211 Oblique Strategies

Draw at random. Source: the full compiled deck across all printings
(https://oblique.ookb.co/), © 1975–2015 Brian Eno and Peter Schmidt.

1. (Organic) machinery.
2. A line has two sides.
3. A very small object - Its centre.
4. Abandon desire.
5. Abandon normal instructions.
6. Accept advice.
7. Accretion.
8. Adding on.
9. Allow an easement (an easement is the abandonment of a stricture).
10. Always give yourself credit for having more than personality.
11. Always the first steps.
12. Animal noises.
13. Are there sections? Consider transitions.
14. Ask a computer program to repeat your last action.
15. Ask people to work against their better judgement.
16. Ask your body.
17. Assemble some of the elements in a group and treat the group.
18. Back up a few steps. What else could you have done?
19. Balance the consistency principle with the inconsistency principle.
20. Be dirty.
21. Be extravagant.
22. Be less critical more often.
23. Breathe more deeply.
24. Build bridges.
25. Burn bridges.
26. Call your mother and ask her what to do.
27. Cascades.
28. Change ambiguities to specifics.
29. Change specifics to ambiguities.
30. Change instrument roles.
31. Change nothing and continue with immaculate consistency.
32. Children’s voices speaking.
33. Children’s voices singing.
34. Cluster analysis.
35. Consider different fading systems.
36. Consider transitions.
37. Consult other promising sources.
38. Consult other unpromising sources.
39. Convert a melodic element into a rhythmic element.
40. Courage!
41. Cut a vital connection.
42. Cut a virtual connection.
43. Decorate, decorate.
44. Define an area as “safe” and use it as an anchor.
45. Describe the landscape in which this belongs.
46. Destroy nothing.
47. Destroy the most important thing.
48. Discard an axiom.
49. Disciplined self-indulgence.
50. Disconnect from desire.
51. Discover the recipes you are using and abandon them.
52. Discover your formulas and abandon them.
53. Display your talent.
54. Distorting time.
55. Do nothing for as long as possible.
56. Do something boring.
57. Do something sudden, destructive and unpredictable.
58. Do the last thing first.
59. Do the washing up.
60. Do the words need changing?
61. Do we need holes?
62. Don’t avoid what is easy.
63. Don’t be afraid of things because they’re easy to do.
64. Don’t be frightened of cliches.
65. Don’t be frightened to display your talents.
66. Don’t break the silence.
67. Don’t stress one thing more than another.
68. Emphasize differences.
69. Emphasize repetitions.
70. Emphasize the flaws.
71. Faced with a choice, do both!
72. Feed the recording back out of the medium.
73. Feedback recordings into an acoustic situation.
74. Fill every beat with something.
75. First work alone, then work in unusual pairs.
76. From nothing to more than nothing.
77. Get your neck massaged.
78. Ghost echoes.
79. Give the game away.
80. Give way to your worst impulse.
81. Go outside. Shut the door.
82. Go slowly all the way round the outside.
83. Go to an extreme, move back to a more comfortable place.
84. How would someone else do it?
85. How would you explain this to your parents?
86. How would you have done it?
87. Humanize something that is free of error.
88. Idiot glee.
89. Imagine the music as a moving chain or caterpillar.
90. Imagine the music as a series of disconnected events.
91. In total darkness.
92. In a very large room, very quietly.
93. Infinitesimal gradations.
94. Instead of changing the thing, change the world around it.
95. Credibility of intentions.
96. Nobility of intentions.
97. Humility of intentions.
98. Is it finished?
99. Is something missing?
100. Is the intonation correct?
101. Is the style right?
102. Is the tuning appropriate?
103. It is quite possible (after all).
104. It is simply a matter or work.
105. Just carry on.
106. Left channel, right channel, centre channel.
107. List the qualities it has. List those you’d like.
108. Listen in total darkness.
109. Listen in a very large room, very quietly.
110. Listen to the quiet voice
111. Look at a very small object, look at its centre.
112. Look at the order in which you do things.
113. Look closely at the most embarrassing details and amplify.
114. Lost in useless territory.
115. Lowest common denominator check: single beat; single note; single riff.
116. Magnify the most difficult details.
117. Make a blank valuable by putting it in an excquisite frame.
118. Make a sudden, destructive unpredictable action. Incorporate.
119. Make an exhaustive list of everything you might do and do the last thing on the list.
120. Make it more sensual.
121. Make it more banal.
122. Make what’s perfect more human.
123. Mechanize something idiosyncratic.
124. Move towards the impossible.
125. Move towards the unimportant.
126. Mute and continue.
127. Not building a wall but making a brick.
128. Once the search is in progress, something will be found.
129. Only a part, not the whole.
130. Only one element of each kind.
131. Overtly resist change.
132. Pae White’s non-blank graphic metacard.
133. Pay attention to distractions.
134. Picture of a man spotlighted.
135. Put in earplugs.
136. Question the heroic approach.
137. Rearrange.
138. Remember those quiet evenings.
139. Remove a restriction.
140. Remove ambiguities and convert to specifics.
141. Remove specifics and convert to ambiguities.
142. Remove the middle, extend the edges.
143. Repetition is a form of change.
144. Retrace your steps.
145. Revaluation (a warm feeling).
146. Reverse.
147. Short circuit (example; a man eating peas with the idea that they will improve his virility shovels them straight into his lap).
148. Shut the door and listen from outside.
149. Simple subtraction.
150. Simply a matter of work.
151. Slow preparation, fast execution.
152. Spectrum analysis.
153. State the problem in words as simply as possible.
154. Steal a solution.
155. Take a break.
156. Take away as much mystery as possible. What is left?
157. Take away the elements in order of apparent non-importance.
158. Take away the important parts.
159. Tape your mouth.
160. The inconsistency principle.
161. The most important thing is the thing most easily forgotten.
162. The tape is now the music.
163. Think inside the work.
164. Think outside the work.
165. Think of the radio.
166. Tidy up.
167. Towards the insignificant.
168. Trust in the you of now.
169. Try faking it.
170. Turn it upside down.
171. Twist the spine.
172. Use “unqualified” people.
173. Use an old idea.
174. Use an unacceptable color.
175. Use cliches.
176. Use fewer notes.
177. Use filters.
178. Use something nearby as a model.
179. Use your own ideas.
180. Voice your suspicions.
181. Water.
182. Fire.
183. Earth.
184. Wind.
185. Heart.
186. What are the sections sections of? (Imagine a caterpillar moving).
187. What context would look right?
188. What do you do? Now, what do you do best?
189. What else is this like?
190. What is the reality of the situation?
191. What is the simplest solution?
192. What mistakes did you make last time?
193. What most recently impressed you? How is it similar? What can you learn from it? What could you take from it?
194. What to increase? What to reduce? What to maintain?
195. What were the branch points in the evolution of this entity?
196. What were you really thinking about just now? Incorporate.
197. What would make this really successful?
198. What would your closest friend do?
199. What wouldn’t you do? Do that.
200. When is it for?
201. When is it for? Who is it for?
202. Who is it for?
203. Where is the edge?
204. Which parts can be grouped?
205. Who would make this really successful?
206. Work at a different speed.
207. Would anyone want it?
208. You are an engineer.
209. You can only make one dot at a time.
210. You don’t have to be ashamed of using your own ideas.
211. Your mistake was a hidden intention.
