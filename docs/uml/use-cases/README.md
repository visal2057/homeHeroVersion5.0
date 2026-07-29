# HomeHero — Use Case Diagrams

Per-module use case diagrams for the final viva. One diagram per team member, plus a
system-level overview showing how the five modules connect.

| File | Diagram | Owner |
|---|---|---|
| `00-system-overview.puml` | System-level use case diagram (all modules + integration points) | Whole team |
| `01-dinuka-authentication-invoicing.puml` | Module 1 — Authentication, Registration, SP Invoice Generation | Dinuka |
| `02-tharinsa-client-system.puml` | Module 2 — Client System | Tharinsa |
| `03-maheli-service-provider-system.puml` | Module 3 — Service Provider System | Maheli |
| `04-visal-payments-memberships.puml` | Module 4 — Payments and Memberships | Visal |
| `05-vihas-administration.puml` | Module 5 — Administration + shared notifications | Vihas |

Source of truth: *HomeHero System Flow — Updated v4* and *Team Responsibility — Updated v4*.
Each use case carries a `Ref:` comment at the top of the file pointing at the spec sections it
was derived from.

## Rendering

1. Download `plantuml.jar` from <https://github.com/plantuml/plantuml/releases> into this folder.
2. Run:

```bash
powershell -ExecutionPolicy Bypass -File docs/uml/use-cases/render.ps1
```

PNG and SVG output lands in `docs/uml/use-cases/out/`. Use the **SVG** files in the report —
they stay sharp when the panel zooms in. Use PNG for slides.

Graphviz is not needed. The script uses PlantUML's built-in layout engines, picked per diagram
after comparing the actual output:

- `00-system-overview` → **ELK** (`-Playout=elk`). It has five nested packages and many
  cross-module links; Smetana overlaps the title and clips a package.
- The five module diagrams → **Smetana** (`-Playout=smetana`). More compact and closer to a
  page aspect ratio; ELK stretches them to roughly 4:1, which is unreadable on a portrait page.

`plantuml.jar` is git-ignored — each team member downloads their own copy.

### Alternatives if you'd rather not install anything

- **VS Code**: install the *PlantUML* extension, open a `.puml` file, press `Alt+D` for a live preview.
- **Web**: paste the file contents into <https://www.plantuml.com/plantuml/uml/> — note this
  uploads the diagram text to a public server, so only do it for content you're happy to share.

## Notation used

| Notation | Meaning |
|---|---|
| `<<include>>` | The base use case **always** performs the included one. Also used to mark a call into another member's module. |
| `<<extend>>` | Optional or conditional behaviour that may extend the base use case. |
| `<<external>>` | An actor outside HomeHero (Payment Gateway, Email Service). |
| `<<system>>` | A non-human internal actor (the scheduler that expires memberships). |
| `<<shared>>` | A service owned by one module but called by all of them (personal notifications, audit log). |

## Integration points to be ready to explain in the viva

- **Client → Payments**: *Pay and Review* (Tharinsa) hands the booking to *Pay for Completed Job* (Visal).
- **Payments → Provider**: *Record Provider Earning* (Visal) feeds *Total Earnings via HomeHero* (Maheli).
- **Payments → Invoicing**: for Card jobs the invoice amount is read from Visal's earning record and is
  locked; for Cash jobs the provider types it manually.
- **Payments → Admin**: HomeHero's 5% commission and membership income feed Vihas's revenue chart
  and earnings report. Cash payments contribute nothing.
- **Membership → Availability**: Visal's expiry/grace/forced-offline state gates Maheli's *Go Online*.
- **All modules → Notifications**: every module writes through Vihas's shared personal notification service.
- **Admin → Auth**: admin-created accounts reuse Dinuka's registration path; providers still land in the
  Pending verification queue.
