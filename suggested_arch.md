# Suggested Architecture: Async Pipeline

## Current Flow (as-is)

```
POST /agencies/:agencyId/start
  |
  v
tipsterQueue ("tipster.start")
  -> pestelWorkflow()
       -> tipster() x N factors        ... fetches RSS, writes Signals to DB
       -> emptySignals()               ... DELETES ALL signals (bug)
       -> emptySummaries()             ... DELETES ALL summaries (bug)
       -> correspondentWorkflow()
            -> correspondentQueue ("correspondent.summerize") x N signals
                 -> correspondent()    ... AI-summarizes each signal
                 -> Summaries.write()
                 -> artDirectorQueue ("artdirector.image.summary")
                      -> artDirector() ... generates image per summary
                      -> checkAndTriggerEditor()
                           ... polls DB until all summaries have images
                           -> editorQueue ("editor.summary")
                                -> editorWorkflow()
                                     -> summaryEditor()  ... synthesizes report
                                     -> Reports.write()
                                     -> artDirectorQueue ("artdirector.image.report")
                                          -> artDirector() ... generates report image
```

### Problems

1. **Naming is inconsistent.** The first queue is called `tipsterQueue` but it runs `pestelWorkflow`, which orchestrates far more than the tipster agent. Job names mix verbs and nouns (`tipster.start` vs `correspondent.summerize` vs `artdirector.image.summary` vs `editor.summary`). "summerize" is a typo.

2. **Responsibilities are blurred.** `pestelWorkflow` both runs the tipster agent *and* triggers the correspondent stage. The correspondent "workflow" is just a loop that enqueues jobs. The editor "workflow" does agent work + DB writes + enqueues the next stage. There's no consistent boundary between "workflow" (orchestration) and "agent" (single AI task).

3. **The completion gate is fragile.** `checkAndTriggerEditor` polls the DB after every single art-director job to see if all summaries have images. This can fire the editor multiple times in a race, or never fire if a correspondent returns `void` for a signal (summary count < signal count forever).

4. **`emptySignals()` / `emptySummaries()` nuke all agencies.** They delete every row in the table, not just the current agency's data. This breaks multi-tenancy.

5. **The scheduler name is shared.** `upsertJobScheduler("agency-interval-schema", ...)` uses the same key for every agency, so only the last-started agency actually recurs.

6. **No error handling or dead-letter strategy.** Failed jobs silently retry with BullMQ defaults. There's no logging, no alerting, no poison-queue.

---

## Suggested Architecture

### Design Principles

- **One queue = one concern.** A queue processes exactly one type of work.
- **Jobs are named `<noun>.<verb>`.** The noun is what's being acted on, the verb is what happens.
- **Workflows orchestrate. Agents execute.** Workflows decide *what* to run next. Agents do *one* AI/IO task and return a result. Workflows never call AI directly; agents never enqueue jobs.
- **Completion is tracked explicitly**, not by polling DB state.
- **Every destructive operation is agency-scoped.**

### Pipeline Stages

```
Stage 1 — SCAN        Fetch raw signals from RSS sources
Stage 2 — SUMMARIZE   AI-summarize each signal into a summary
Stage 3 — ILLUSTRATE  Generate an image for each summary
Stage 4 — COMPILE     Synthesize all summaries into a report
Stage 5 — ILLUSTRATE  Generate an image for the report (reuses stage 3 queue)
```

### Queue & Job Naming

| Queue            | Job Name              | Triggered By     | Worker Calls             |
|------------------|-----------------------|------------------|--------------------------|
| `scan`           | `pipeline.run`        | HTTP endpoint    | `scanWorkflow()`         |
| `summarize`      | `signal.summarize`    | scanWorkflow     | `correspondentAgent()`   |
| `illustrate`     | `summary.illustrate`  | summarize worker | `artDirectorAgent()`     |
| `illustrate`     | `report.illustrate`   | compile worker   | `artDirectorAgent()`     |
| `compile`        | `report.compile`      | completion gate  | `editorAgent()`          |
| `agent-setup`    | `agents.create`       | agency creation  | `createDefaultAgents()`  |

### File Structure

```
src/
  agents/               # Pure AI/IO tasks. No queue awareness.
    correspondent.agent.ts    -> correspondentAgent(agencyId, signal): Summary
    artdirector.agent.ts      -> artDirectorAgent(agencyId, content, type): string (url)
    editor.agent.ts           -> editorAgent(summaries): ReportInput
    tipster.agent.ts          -> tipsterAgent(agencyId, factor, limit): Signal[]

  workflows/            # Orchestration. Reads DB, enqueues next stage.
    scan.workflow.ts          -> scanWorkflow(agencyId, input)
    compile.workflow.ts       -> compileWorkflow(agencyId, summaries, input)

  queues/               # Queue definitions, workers, and completion logic.
    connection.ts             -> shared Redis connection config
    scan.queue.ts             -> queue + worker for stage 1
    summarize.queue.ts        -> queue + worker for stage 2
    illustrate.queue.ts       -> queue + worker for stage 3 & 5
    compile.queue.ts          -> queue + worker for stage 4
    agent-setup.queue.ts      -> queue + worker for default agent creation
    completion.ts             -> trackCompletion() helper
```

### Detailed Flow

#### Stage 1 — Scan

```
POST /agencies/:agencyId/start  { factors, tipLimit, ... }
  |
  controller:
    Agencies.update({ state: "running" })
    scanQueue.add("pipeline.run", { agencyId, input })
    scanQueue.upsertJobScheduler(`scan:${agencyId}`, { every: ... })
                                   ^^^^^^^^^^^^^^^^^
                                   agency-scoped scheduler key
```

**scanWorkflow(agencyId, input):**
```
1. Signals.deleteByAgency(agencyId)       <-- scoped delete, not global
2. Summaries.deleteByAgency(agencyId)     <-- scoped delete, not global
3. for each factor in input.factors:
     signals = tipsterAgent(agencyId, factor, input.tipLimit)
     Signals.batchWrite(signals)
4. allSignals = Signals.list({ agencyId })
5. for each signal in allSignals:
     summarizeQueue.add("signal.summarize", {
       agencyId,
       signalId: signal.id,
       input,
       totalSignals: allSignals.length    <-- pass expected count for completion tracking
     })
```

Key change: the workflow enqueues the next stage directly, instead of delegating to a separate "correspondentWorkflow" file that only loops.

#### Stage 2 — Summarize

**summarize worker:**
```
job "signal.summarize":
  signal = Signals.get(job.data.signalId, agencyId)
  summary = correspondentAgent(agencyId, signal)
  if summary:
    written = Summaries.write(summary)
    illustrateQueue.add("summary.illustrate", {
      agencyId,
      summaryId: written.id,
      input,
      totalSignals
    })
  else:
    trackCompletion(agencyId, input, totalSignals)   <-- still count toward completion
```

#### Stage 3 — Illustrate (summaries)

**illustrate worker (summary.illustrate):**
```
job "summary.illustrate":
  summary = Summaries.get(summaryId, agencyId)
  posterUrl = artDirectorAgent(agencyId, summary, "summary")
  Summaries.update({ ...summary, posterUrl })
  trackCompletion(agencyId, input, totalSignals)
```

#### Completion Gate

Instead of polling the DB after every illustrate job, use an **atomic counter**.

**trackCompletion(agencyId, input, totalSignals):**
```
key = `pipeline:${agencyId}:completed`
count = await redis.incr(key)
if count === totalSignals:
  await redis.del(key)
  summaries = Summaries.list({ agencyId })
  compileQueue.add("report.compile", { agencyId, input })
```

This is O(1), race-free (Redis INCR is atomic), and works correctly even when some signals produce no summary (the summarize worker calls `trackCompletion` in both the success and no-summary branches).

#### Stage 4 — Compile

**compile worker:**
```
job "report.compile":
  summaries = Summaries.list({ agencyId })
  compileWorkflow(agencyId, summaries, input)
```

**compileWorkflow(agencyId, summaries, input):**
```
1. reportInput = editorAgent(summaries)
2. signals = Signals.list({ agencyId })
3. report = Reports.write({ ...reportInput, agencyId, sources: signals, ... })
4. illustrateQueue.add("report.illustrate", { agencyId, reportId: report.id })
```

#### Stage 5 — Illustrate (report)

**illustrate worker (report.illustrate):**
```
job "report.illustrate":
  report = Reports.get(reportId, agencyId)
  posterUrl = artDirectorAgent(agencyId, report, "report")
  Reports.update({ ...report, posterUrl })
  Agencies.update({ id: agencyId, state: "idle" })   <-- pipeline done
```

---

### Summary of Changes

| Problem | Current | Suggested |
|---------|---------|-----------|
| Inconsistent queue/job naming | `tipsterQueue` / `tipster.start`, `correspondent.summerize` | `scan` / `pipeline.run`, `signal.summarize` |
| Blurred workflow/agent boundary | `pestelWorkflow` calls agent + enqueues next stage + deletes data | Workflows orchestrate, agents are pure functions, workers bridge them |
| Fragile completion gate | Poll DB after every art-director job | Atomic Redis counter, O(1), race-free |
| Global deletes break multi-tenancy | `emptySignals()` deletes all rows | `Signals.deleteByAgency(agencyId)` |
| Shared scheduler key | `"agency-interval-schema"` for all agencies | `scan:${agencyId}` |
| No error handling | Silent retries | Add `attempts`, `backoff`, and a failed-job listener per queue |
| Workers in one 150-line file | Everything in `services/workers/index.ts` | One file per queue in `src/queues/` |
