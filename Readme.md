# Redaktionen API

**Redaktionen är ett API-experiment av Göteborgs regionens innovationsarena. Här försöker vi nyttja AI för att omvärldsspana, bearbeta och tillgängligöra information relevant för vår verksamhet.**

> [!CAUTION]
> Detta projekt ska inte uppfattas som en färdig produkt eller lösning. Ni är välkomna att kopiera koden och testa själva, men vi ansvarar inte för eventuella konsekvenser och har begränsade möjligheter att erbjuda support.

## Workflow

### Overview

```mermaid
flowchart LR
    A[[<h1>Source</h1><p>RSS</p>]]

    B[<h1>Tipster</h1><p>PESTEL</p>]
    G(<h1>Correspondent</h1><p>PESTEL</p>)

    N{<h1>Report Editor</h1>}
    M{<h2>Integrated report</h2><p>ALL</p>}
    Z{<h2>Isolated report</h2><p>PESTEL</p>}

    O{<h1>Researcher Team</h1>}
    P{<h2>Integrated report</h2><p>ALL</p>}
    Q{<h2>Isolated report</h2><p>PESTEL</p>}

    U{<h1>Foresight Editor</h1>}

    R{<h1>Art department</h1>}

    V{<h1>Scenario Team</h1>}

    A ----> B
    B -- signal --> G
    G -- summaries --> N
    G <-- summary --> R
    N ----> M
    N ----> Z
    M <-- report --> R
    Z <-- report --> R

    G -- summaries --> O
    O -- summaries --> P
    O <-- summary --> Q
    P <-- report --> R
    Q <-- report --> R

    G -- summaries --> U
    U -- Report --> V

```

### Detailed

```mermaid
flowchart LR
    A[<h3>Tipster</h3><p>Politic</p>]
    B[<h3>Tipster</h3><p>Economic</p>]
    C[<h3>Tipster</h3><p>Social</p>]
    D[<h3>Tipster</h3><p>Tech</p>]
    E[<h3>Tipster</h3><p>Enviroment</p>]
    F[<h3>Tipster</h3><p>Legal</p>]

    G(<h3>Correspondent</h3><p>Politic</p>)
    H(<h3>Correspondent</h3><p>Economic</p>)
    I(<h3>Correspondent</h3><p>Social</p>)
    J(<h3>Correspondent</h3><p>Tech</p>)
    K(<h3>Correspondent</h3><p>Enviroment</p>)
    L(<h3>Correspondent</h3><p>Legal</p>)

    M{<h3>Summary Editor</h3>}
    X{<h3>Researcher Team</h3>}
    Y{<h3>Art department</h3>}

    N{<h3>Foresight Team</h3>}
    O{<h3>The Utopian</h3>}
    P{<h3>The Dystopian</h3>}
    Q{<h3>The Reformist</h3>}
    R{<h3>The Systems Thinker</h3>}
    S{<h3>The Speculator</h3>}
    T{<h3>The Historian</h3>}

    U{<h3>Foresight Editor</h3>}

    V{<h3>Scenario Team</h3>}

    A -- signal --> G
    B -- signal --> H
    C -- signal --> I
    D -- signal --> J
    E -- signal --> K
    F -- signal --> L

    G -- summary --> M
    H -- summary --> M
    I -- summary --> M
    J -- summary --> M
    K -- summary --> M
    L -- summary --> M

    M <-- summary --> Y
    V <-- report --> Y
    U <-- report --> Y

    G -- summary --> X
    H -- summary --> X
    I -- summary --> X
    J -- summary --> X
    K -- summary --> X
    L -- summary --> X

    G -- summary --> N
    H -- summary --> N
    I -- summary --> N
    J -- summary --> N
    K -- summary --> N
    L -- summary --> N

    N -- summary --> O
    N -- summary --> P
    N -- summary --> Q
    N -- summary --> R
    N -- summary --> S
    N -- summary --> T

    O -- fortsight raport --> U
    P -- fortsight raport --> U
    Q -- fortsight raport --> U
    R -- fortsight raport --> U
    S -- fortsight raport --> U
    T -- fortsight raport --> U

    U -- Foresight raport summary --> V
```

## Project structure

### Core

Core stuff that multiple (all?) services are using.

### Services

A service is a key component in Redaktionen. The folder concists of the following:

| file       | responsibility                                                                                  |
| ---------- | ----------------------------------------------------------------------------------------------- |
| agent      | Responsible for AI operations.                                                                  |
| operations | Responsible for logic flow of the service, ex. _db operations_, _data transformations_.         |
| worker     | Responsible for triggering the service on incoming event and communication with other services. |
