import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { fetchTareasList } from "./fetchTareasGitHub";

const sample = (estado: string) => [
  { name: "builder-fix-001.md", path: `tareas/${estado}/builder-fix-001.md`, type: "file" },
  { name: ".gitkeep", path: `tareas/${estado}/.gitkeep`, type: "file" },
  { name: "README.md", path: `tareas/${estado}/README.md`, type: "file" },
];

describe("fetchTareasList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("devuelve tareas concatenadas de los 3 estados filtrando .gitkeep", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const estado = url.split("/tareas/")[1];
      return new Response(JSON.stringify(sample(estado)), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const tareas = await fetchTareasList("owner", "repo");

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const estados = new Set(tareas.map((t) => t.estado));
    expect(estados).toEqual(new Set(["pendiente", "en-curso", "completado"]));
    expect(tareas.every((t) => t.name.endsWith(".md") && t.name !== ".gitkeep")).toBe(true);
    expect(tareas.length).toBe(6);
  });

  it("devuelve array vacío si las 3 carpetas están vacías", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("[]", { status: 200 })),
    );
    const tareas = await fetchTareasList("owner", "repo");
    expect(tareas).toEqual([]);
  });

  it("lanza error claro si GitHub responde 403 (rate limit)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("rate limit", { status: 403 })),
    );
    await expect(fetchTareasList("owner", "repo")).rejects.toThrow(/rate limit|403/i);
  });
});
