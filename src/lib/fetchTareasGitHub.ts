export type TareaEstado = "pendiente" | "en-curso" | "completado";

export type TareaFile = {
  name: string;
  path: string;
  estado: TareaEstado;
};

const ESTADOS: TareaEstado[] = ["pendiente", "en-curso", "completado"];

type GitHubContentEntry = {
  name: string;
  path: string;
  type?: string;
};

async function listarCarpeta(
  owner: string,
  repo: string,
  estado: TareaEstado,
): Promise<TareaFile[]> {
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/tareas/${estado}`;
  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!res.ok) {
    if (res.status === 403) {
      throw new Error(
        `GitHub rate limit o permiso denegado al listar tareas/${estado} (HTTP 403).`,
      );
    }
    if (res.status === 404) {
      throw new Error(
        `Carpeta tareas/${estado} no encontrada en ${owner}/${repo} (HTTP 404).`,
      );
    }
    throw new Error(
      `Error HTTP ${res.status} listando tareas/${estado} en ${owner}/${repo}.`,
    );
  }

  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) {
    throw new Error(`Respuesta inesperada listando tareas/${estado}.`);
  }

  return (data as GitHubContentEntry[])
    .filter((f) => f.name.endsWith(".md") && f.name !== ".gitkeep")
    .map((f) => ({ name: f.name, path: f.path, estado }));
}

export async function fetchTareasList(
  owner = "CulitoDeVieja",
  repo = "agente",
): Promise<TareaFile[]> {
  const batches = await Promise.all(
    ESTADOS.map((estado) => listarCarpeta(owner, repo, estado)),
  );
  return batches.flat();
}
