use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Task {
    pub id: String,
    pub role: String,
    pub title: String,
    pub priority: String,
    pub estado: String,
    pub depende_de: Vec<String>,
    pub habilita: Vec<String>,
    pub file: String,
    pub log: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AgentSnapshot {
    pub role: String,
    pub ubicacion: String,
    pub ultima_senal: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StateSnapshot {
    pub updated: String,
    pub agents: Vec<AgentSnapshot>,
    pub modo_master_active: bool,
}

pub fn parse_task(content: &str, filename: &str, path_str: &str) -> Task {
    let title = extract_h1(content)
        .map(|t| t.trim_start_matches("Tarea:").trim().to_string())
        .unwrap_or_else(|| filename.to_string());

    let role = extract_field(content, "Rol")
        .unwrap_or_default()
        .to_lowercase();
    let priority = extract_field(content, "Prioridad")
        .unwrap_or_else(|| "media".into())
        .to_lowercase();
    let created_at = extract_field(content, "Creada").unwrap_or_default();
    let estado = derive_estado(path_str);
    let depende_de = parse_bullet_section(content, "Depende de:");
    let habilita = parse_bullet_section(content, "Habilita");
    let log = extract_log(content);

    let id = filename.trim_end_matches(".md").to_string();

    Task {
        id,
        role,
        title,
        priority,
        estado,
        depende_de,
        habilita,
        file: filename.to_string(),
        log,
        created_at,
    }
}

fn extract_h1(content: &str) -> Option<String> {
    content
        .lines()
        .find(|l| l.starts_with("# "))
        .map(|l| l.trim_start_matches("# ").trim().to_string())
}

fn extract_field(content: &str, field: &str) -> Option<String> {
    let pattern = format!("**{}:**", field);
    content.lines().find(|l| l.contains(&pattern)).map(|l| {
        l.splitn(2, &pattern)
            .nth(1)
            .unwrap_or("")
            .trim()
            .to_string()
    })
}

fn derive_estado(path: &str) -> String {
    if path.contains("completado") {
        "completado".into()
    } else if path.contains("en-curso") {
        "en-curso".into()
    } else {
        "pendiente".into()
    }
}

fn parse_bullet_section(content: &str, section: &str) -> Vec<String> {
    let mut in_section = false;
    let mut results = Vec::new();
    for line in content.lines() {
        if line.contains(section) {
            in_section = true;
            continue;
        }
        if in_section {
            if line.starts_with("##") {
                break;
            }
            let trimmed = line
                .trim()
                .trim_start_matches('-')
                .trim()
                .trim_start_matches('*')
                .trim();
            if trimmed.is_empty() || trimmed == "(ninguna)" || trimmed.starts_with('(') {
                continue;
            }
            if let Some(file) = trimmed.split_whitespace().next() {
                if file.ends_with(".md") {
                    results.push(file.to_string());
                }
            }
        }
    }
    results
}

fn extract_log(content: &str) -> Option<String> {
    let marker = "## Log del agente";
    if let Some(pos) = content.find(marker) {
        let after = &content[pos + marker.len()..];
        let log = after.trim();
        if log.is_empty() || log == "(vacío hasta completar)" {
            None
        } else {
            Some(log.to_string())
        }
    } else {
        None
    }
}

pub fn parse_state(content: &str) -> StateSnapshot {
    let mut agents = Vec::new();
    let mut in_table = false;
    let mut modo_master = false;
    let mut updated = String::new();

    for line in content.lines() {
        if line.contains("MODO MASTER") && line.contains("activo") {
            modo_master = true;
        }
        if line.contains("**Última actualización:**") {
            updated = line
                .split("**Última actualización:**")
                .nth(1)
                .unwrap_or("")
                .trim()
                .to_string();
        }
        if line.contains("| Rol |") {
            in_table = true;
            continue;
        }
        if in_table && line.starts_with('|') && !line.contains("---") {
            let cols: Vec<&str> = line.split('|').filter(|c| !c.trim().is_empty()).collect();
            if cols.len() >= 3 {
                let role = cols[0].trim().to_lowercase().replace(' ', "-");
                let ubicacion = cols[1].trim().to_string();
                let ultima_senal = cols[2].trim().to_string();
                if !role.is_empty() && role != "rol" {
                    agents.push(AgentSnapshot {
                        role,
                        ubicacion,
                        ultima_senal,
                    });
                }
            }
        }
    }

    StateSnapshot {
        updated,
        agents,
        modo_master_active: modo_master,
    }
}
