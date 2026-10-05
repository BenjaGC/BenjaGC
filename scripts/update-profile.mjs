import { mkdir, writeFile, readFile } from "node:fs/promises";

const username = "BenjaGC";
const headers = { Accept: "application/vnd.github+json", "User-Agent": "BenjaGC-profile" };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
async function api(path) {
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${path}`);
  return response.json();
}
let repos = [];
for (let page = 1; ; page++) {
  const part = await api(`/users/${username}/repos?per_page=100&page=${page}`);
  repos.push(...part);
  if (part.length < 100) break;
}
const own = repos.filter(r => !r.fork && !r.private && r.name.toLowerCase() !== username.toLowerCase());
const languages = new Map();
for (const repo of own) {
  const data = await api(`/repos/${username}/${repo.name}/languages`);
  for (const [name, bytes] of Object.entries(data)) languages.set(name, (languages.get(name) || 0) + bytes);
}
const sorted = [...languages].sort((a,b)=>b[1]-a[1]);
const total = sorted.reduce((n,[,bytes])=>n+bytes,0);
const top = sorted.slice(0,4);
if (sorted.length>4) top.push(["Otros", sorted.slice(4).reduce((n,[,bytes])=>n+bytes,0)]);
const stars = own.reduce((n,r)=>n+r.stargazers_count,0);
const escape = s => String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll('"',"&quot;");
const colors = ["#a78bfa", "#6ee6ce", "#ff9a7b", "#80bfff", "#dac766"];
const date = new Intl.DateTimeFormat("es-CL", {timeZone:"America/Santiago", year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
await mkdir("assets",{recursive:true});
for (const mode of ["dark","light"]) {
  const dark = mode === "dark";
  const bg = dark ? "#101c2b" : "#f2f6fb";
  const fg = dark ? "#edf3fc" : "#14273b";
  const muted = dark ? "#a7bdd3" : "#4a6178";
  const line = dark ? "#2c4158" : "#cedbe8";
  let offset = 400;
  const bars = top.map(([,bytes],i)=>{
    const width = total ? bytes/total*375 : 0;
    const rect = `<rect x="${offset}" y="78" width="${width}" height="12" fill="${colors[i]}"/>`;
    offset += width; return rect;
  }).join("");
  const legend = top.map(([name,bytes],i)=>{
    const x=400+(i%2)*195, y=120+Math.floor(i/2)*30;
    return `<circle cx="${x+4}" cy="${y-4}" r="4" fill="${colors[i]}"/><text x="${x+16}" y="${y}" font-size="14">${escape(name)} <tspan fill="${muted}">${(bytes/total*100).toFixed(1)}%</tspan></text>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="235" viewBox="0 0 820 235" role="img" aria-labelledby="title desc"><title id="title">Actividad pública de ${username}</title><desc id="desc">${own.length} repositorios públicos propios, ${stars} estrellas recibidas. Lenguajes por tamaño de código. Actualizado ${date}.</desc><rect x=".5" y=".5" width="819" height="234" rx="14" fill="${bg}" stroke="${line}"/><g font-family="Arial,Helvetica,sans-serif" fill="${fg}"><text x="30" y="40" font-size="18" font-weight="700">Construyendo en público</text><text x="30" y="111" font-size="46" font-weight="700">${own.length}</text><text x="30" y="140" font-size="14" fill="${muted}">Repositorios propios</text><text x="232" y="111" font-size="46" font-weight="700">${stars}</text><text x="232" y="140" font-size="14" fill="${muted}">Estrellas</text><path d="M370 28V185" stroke="${line}"/><text x="400" y="40" font-size="18" font-weight="700">Lenguajes en mis repos</text><clipPath id="bar"><rect x="400" y="78" width="375" height="12" rx="6"/></clipPath><g clip-path="url(#bar)">${bars}</g>${legend}<text x="30" y="211" font-size="11" fill="${muted}">API de GitHub · Sin forks ni repositorio de perfil · ${date}</text></g></svg>`;
  await writeFile(`assets/stats-${mode}.svg`,svg);
}

// Static alternative for people whose device requests reduced motion.
for (const suffix of ["", "-dark"]) {
  try {
    const snake = await readFile(`assets/github-snake${suffix}.svg`,"utf8");
    const staticSvg = snake.replace("</svg>", "<style>*{animation:none!important}.s,.u{display:none}</style></svg>");
    await writeFile(`assets/activity-static${suffix}.svg`, staticSvg);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}
console.log(`Profile graphics updated: ${own.length} public repositories, ${languages.size} languages.`);
