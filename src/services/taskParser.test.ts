import { describe, it, expect } from "vitest";
import { parseTask, parseTaskList } from "./taskParser";

const SAMPLE_TASK = `# Tarea: Implementar login

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

describe("parseTask", () => {
  it("extrae id, title, rol y prioridad correctamente", () => {
    const task = parseTask(SAMPLE_TASK, "builder-002-login.md", "tareas/en-curso/builder-002-login.md");
    expect(task.id).toBe("builder-002-login");
    expect(task.title).toBe("Implementar login");
    expect(task.role).toBe("builder");
    expect(task.priority).toBe("alta");
  });

  it("deriva estado desde el path", () => {
    const pendiente = parseTask(SAMPLE_TASK, "t.md", "tareas/pendiente/t.md");
    expect(pendiente.estado).toBe("pendiente");

    const enCurso = parseTask(SAMPLE_TASK, "t.md", "tareas/en-curso/t.md");
    expect(enCurso.estado).toBe("en-curso");

    const completado = parseTask(SAMPLE_TASK, "t.md", "tareas/completado/t.md");
    expect(completado.estado).toBe("completado");
  });

  it("parsea dependencias y habilita correctamente", () => {
    const task = parseTask(SAMPLE_TASK, "builder-002-login.md", "tareas/pendiente/");
    expect(task.dependeDe).toContain("builder-001-setup.md");
    expect(task.habilita).toContain("builder-003-dashboard.md");
  });

  it("extrae log del agente cuando existe", () => {
    const task = parseTask(SAMPLE_TASK, "t.md", "tareas/completado/t.md");
    expect(task.log).toBe("Completado el 2026-04-11.");
  });

  it("retorna null para log vacío o placeholder", () => {
    const noLog = SAMPLE_TASK.replace("Completado el 2026-04-11.", "(vacío hasta completar)");
    const task = parseTask(noLog, "t.md", "tareas/pendiente/t.md");
    expect(task.log).toBeNull();
  });

  it("usa defaults razonables para campos faltantes", () => {
    const minimal = "# Tarea: Mínima\n";
    const task = parseTask(minimal, "x.md", "tareas/pendiente/x.md");
    expect(task.priority).toBe("media");
    expect(task.dependeDe).toEqual([]);
    expect(task.habilita).toEqual([]);
    expect(task.log).toBeNull();
  });
});

describe("parseTaskList", () => {
  it("procesa múltiples archivos en batch", () => {
    const files = [
      { content: SAMPLE_TASK, filename: "builder-001.md", path: "tareas/pendiente/builder-001.md" },
      { content: SAMPLE_TASK, filename: "builder-002.md", path: "tareas/completado/builder-002.md" },
    ];
    const tasks = parseTaskList(files);
    expect(tasks).toHaveLength(2);
    expect(tasks[0].estado).toBe("pendiente");
    expect(tasks[1].estado).toBe("completado");
  });
});
