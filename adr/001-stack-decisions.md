# ADR-001 — Decisiones de stack en el backend Rust

**Fecha:** 2026-04-19
**Autor:** builder (consolidado por Lupa)
**Estado:** aceptado

## Contexto
Lupa detectó 2 decisiones que diferían del "camino estándar":
1. Llamar a git via `Command::new("git")` en vez de `git2` crate.
2. Parser markdown manual en Rust en vez de `pulldown-cmark`.

## Decisión

### 1. `Command::new("git")`

**Elegido** sobre `git2` crate.

**Razones:**
- `git.exe` ya está presente en cualquier máquina donde corra este panel (asume repo git local).
- `git2` agrega ~2MB al binario final (compila libgit2).
- Comandos que usamos son triviales (pull, log, status): shell alcanza.
- Target <15MB bundle — cada MB cuenta.

**Costo:** dependencia implícita de `git` en PATH. Documentado en README.

### 2. Parser markdown manual

**Elegido** sobre `pulldown-cmark`.

**Razones:**
- Nuestro markdown tiene estructura predecible (frontmatter YAML + secciones `##`).
- No necesitamos HTML output, solo extraer campos + listar ítems.
- `pulldown-cmark` pesa ~300KB + event-based API requiere wrapping.
- Parser manual <80 líneas cubre el 100% del formato de tareas.

**Costo:** si cambia el formato, hay que tocar el parser. Mitigación: schema fijo documentado en `skills/tareas-markdown.md`.

## Alternativas rechazadas

- `git2` + `pulldown-cmark` → bundle ~18MB, sobre target.
- Híbrido (git via Command + markdown con pulldown-cmark) → inconsistente, pesado.

## Consecuencias

- Builder puede iterar rápido en ambos sin lidiar con APIs complejas.
- Auditor debe verificar en cada release que `git.exe` esté disponible (check agregado a test-plan).
- Si en v0.2 necesitamos features avanzadas (markdown con HTML render para tooltips, git submodules) → reevaluar.
