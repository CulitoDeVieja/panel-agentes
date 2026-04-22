import { describe, it, expect } from "vitest";
import { parseTaskMarkdown } from "./parseTaskMarkdown";

const FULL_TASK = `# Tarea: Implementar login

**Rol:** builder
**Prioridad:** alta
**Creada:** 2026-04-10

## Descripción
Implementar pantalla de login.

## Depende de:
- builder-001-setup.md

## Habilita
- builder-003-dashboard.md

## Log del agente
Completado el 2026-04-11.
`;

describe("parseTaskMarkdown", () => {
  it("tarea completa: extrae todos los campos", () => {
    const t = parseTaskMarkdown(FULL_TASK, "builder-002-login.md", "completado");
    expect(t.id).toBe("builder-002-login");
    expect(t.title).toBe("Implementar login");
    expect(t.role).toBe("builder");
    expect(t.priority).toBe("alta");
    expect(t.createdAt).toBe("2026-04-10");
    expect(t.estado).toBe("completado");
    expect(t.dependeDe).toEqual(["builder-001-setup.md"]);
    expect(t.habilita).toEqual(["builder-003-dashboard.md"]);
    expect(t.log).toBe("Completado el 2026-04-11.");
  });

  it("usa el estado pasado por argumento (no lo deriva del path)", () => {
    const pendiente = parseTaskMarkdown(FULL_TASK, "x.md", "pendiente");
    const enCurso = parseTaskMarkdown(FULL_TASK, "x.md", "en-curso");
    expect(pendiente.estado).toBe("pendiente");
    expect(enCurso.estado).toBe("en-curso");
  });

  it("sin log: devuelve log = null", () => {
    const sinLog = `# Tarea: Sin log\n**Rol:** builder\n**Prioridad:** media\n`;
    const t = parseTaskMarkdown(sinLog, "x.md", "pendiente");
    expect(t.log).toBeNull();
  });

  it("log con placeholder '(vacío hasta completar)' → log = null", () => {
    const placeholder = FULL_TASK.replace(
      "Completado el 2026-04-11.",
      "(vacío hasta completar)",
    );
    const t = parseTaskMarkdown(placeholder, "x.md", "en-curso");
    expect(t.log).toBeNull();
  });

  it("sin depende de: devuelve array vacío", () => {
    const sinDep = `# Tarea: X\n**Rol:** auditor-ops\n## Habilita\n- y.md\n`;
    const t = parseTaskMarkdown(sinDep, "x.md", "pendiente");
    expect(t.dependeDe).toEqual([]);
    expect(t.habilita).toEqual(["y.md"]);
  });

  it("'Depende de: (ninguna)' → array vacío", () => {
    const ninguna = `# Tarea: X\n**Rol:** builder\n## Depende de:\n- (ninguna)\n`;
    const t = parseTaskMarkdown(ninguna, "x.md", "pendiente");
    expect(t.dependeDe).toEqual([]);
  });

  it("sin habilita: devuelve array vacío", () => {
    const sinHab = `# Tarea: X\n**Rol:** builder\n## Depende de:\n- a.md\n`;
    const t = parseTaskMarkdown(sinHab, "x.md", "pendiente");
    expect(t.habilita).toEqual([]);
    expect(t.dependeDe).toEqual(["a.md"]);
  });

  it("tarea vacía: devuelve defaults razonables", () => {
    const t = parseTaskMarkdown("", "vacia.md", "pendiente");
    expect(t.id).toBe("vacia");
    expect(t.title).toBe("vacia");
    expect(t.role).toBe("");
    expect(t.priority).toBe("media");
    expect(t.createdAt).toBe("");
    expect(t.dependeDe).toEqual([]);
    expect(t.habilita).toEqual([]);
    expect(t.log).toBeNull();
    expect(t.estado).toBe("pendiente");
  });

  it("prioridad inválida cae a 'media'", () => {
    const c = `# Tarea: X\n**Rol:** builder\n**Prioridad:** urgentísima\n`;
    const t = parseTaskMarkdown(c, "x.md", "pendiente");
    expect(t.priority).toBe("media");
  });

  it("trim del prefijo 'Tarea:' del título y normaliza role a lowercase", () => {
    const c = `# Tarea:    Mi Tarea\n**Rol:**   BUILDER\n`;
    const t = parseTaskMarkdown(c, "z.md", "pendiente");
    expect(t.title).toBe("Mi Tarea");
    expect(t.role).toBe("builder");
  });

  it("bullet con .md: extrae solo el filename; sin .md: preserva texto completo", () => {
    const c = `# Tarea: X\n**Rol:** builder\n## Habilita\n- slot-0003 (hook que combina fetch + parse)\n- slot-0004-feat-data.md descripción\n`;
    const t = parseTaskMarkdown(c, "x.md", "pendiente");
    expect(t.habilita).toEqual([
      "slot-0003 (hook que combina fetch + parse)",
      "slot-0004-feat-data.md",
    ]);
  });
});
