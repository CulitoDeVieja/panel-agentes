# panel-agentes

App nativa Windows (Tauri 2 + React + TypeScript) que muestra el progreso de los agentes del sistema `CulitoDeVieja/agente` — cuántas tareas tiene cada uno y en qué estado están.

## Stack

- **Framework:** Tauri 2
- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS v4
- **Backend:** Rust embebido (filesystem + git2)
- **Build:** `cargo tauri build` → `.msi` + portable `.exe`

## Estado

v0.1.0 — en planificación detallada. Ver `CulitoDeVieja/agente/planificacion/panel-agentes/` para specs:
- `00-resumen.md` — objetivo y scope
- `01-arquitectura.md` — stack, componentes, tipos
- `02-skills.md` — skills del builder
- `03-implementacion.md` — plan de implementación
- `04-auditoria.md` — plan de auditoría y deploy

## Build

```
pnpm install --frozen-lockfile
pnpm build
cargo tauri build --target x86_64-pc-windows-msvc
```

## Licencia

Privado al owner del repo `CulitoDeVieja`.
