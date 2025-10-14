# Redaktionen API

**Redaktionen är ett API-experiment av Göteborgs regionens innovationsarena. Här försöker vi nyttja AI för att omvärldsspana, bearbeta och tillgängligöra information relevant för vår verksamhet.**

## Workflow

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

    N{<h3>Forsight Team</h3>}
    O{<h3>The Utopian</h3>}
    P{<h3>The Dystopian</h3>}
    Q{<h3>The Reformist</h3>}
    R{<h3>The Systems Thinker</h3>}
    S{<h3>The Speculator</h3>}
    T{<h3>The Historian</h3>}

    U{<h3>Forsight Editor</h3>}

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

    U -- forsight raport summary --> V
```
