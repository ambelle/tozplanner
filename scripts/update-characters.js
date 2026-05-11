const fs = require("fs/promises");

const characters = [
  {
    "owner": "Belle",
    "name": "Thocky"
  },
  {
    "owner": "Belle",
    "name": "Tock"
  },
  {
    "owner": "Belle",
    "name": "Tocki"
  },
  {
    "owner": "Belle",
    "name": "Tork"
  },
  {
    "owner": "Belle",
    "name": "Tokk"
  },
  {
    "owner": "Belle",
    "name": "Hell"
  },
  {
    "owner": "Belle",
    "name": "Tocky"
  },
  {
    "owner": "Gillian",
    "name": "Gillian"
  },
  {
    "owner": "Gillian",
    "name": "ggil"
  },
  {
    "owner": "Gillian",
    "name": "ggill"
  },
  {
    "owner": "Gillian",
    "name": "Leaw"
  },
  {
    "owner": "Gillian",
    "name": "Gill"
  },
  {
    "owner": "Gillian",
    "name": "Kaiko"
  },
  {
    "owner": "Gillian",
    "name": "Arun"
  },
  {
    "owner": "Winst",
    "name": "Veggie"
  },
  {
    "owner": "Winst",
    "name": "Roomie"
  },
  {
    "owner": "Winst",
    "name": "Meanie"
  },
  {
    "owner": "Winst",
    "name": "Quackie"
  },
  {
    "owner": "Winst",
    "name": "Owie"
  },
  {
    "owner": "Winst",
    "name": "Caterpie"
  },
  {
    "owner": "Winst",
    "name": "Eerie"
  },
  {
    "owner": "Winst",
    "name": "Doorie"
  },
  {
    "owner": "Thom",
    "name": "oof"
  },
  {
    "owner": "Thom",
    "name": "Looted"
  },
  {
    "owner": "Thom",
    "name": "Cronut"
  },
  {
    "owner": "Thom",
    "name": "Churro"
  },
  {
    "owner": "Thom",
    "name": "Zooted"
  },
  {
    "owner": "Thom",
    "name": "Macaroon"
  },
  {
    "owner": "Thom",
    "name": "Sundaes"
  },
  {
    "owner": "Thom",
    "name": "Cruller"
  },
  {
    "owner": "Thom",
    "name": "Saltbread"
  },
  {
    "owner": "BK",
    "name": "Miffyy"
  },
  {
    "owner": "BK",
    "name": "54o88"
  },
  {
    "owner": "BK",
    "name": "Diuz"
  },
  {
    "owner": "BK",
    "name": "Chageee"
  },
  {
    "owner": "BK",
    "name": "Lormee"
  },
  {
    "owner": "KC",
    "name": "SEhoon"
  },
  {
    "owner": "KC",
    "name": "Ryoji"
  },
  {
    "owner": "KC",
    "name": "Voxous"
  },
  {
    "owner": "KC",
    "name": "n00n"
  },
  {
    "owner": "KC",
    "name": "Orien"
  },
  {
    "owner": "KC",
    "name": "Voxi"
  },
  {
    "owner": "KC",
    "name": "Sunshines"
  },
  {
    "owner": "KC",
    "name": "Grimstep"
  },
  {
    "owner": "KC",
    "name": "Nocti"
  },
  {
    "owner": "KC",
    "name": "Jegiee"
  },
  {
    "owner": "KC",
    "name": "Dimz"
  },
  {
    "owner": "Liss",
    "name": "Pinkberry"
  },
  {
    "owner": "Liss",
    "name": "Lisette"
  },
  {
    "owner": "Liss",
    "name": "Elissybeth"
  },
  {
    "owner": "Liss",
    "name": "Luminosa"
  },
  {
    "owner": "Liss",
    "name": "Lissie"
  },
  {
    "owner": "Liss",
    "name": "Hibana"
  },
  {
    "owner": "Liss",
    "name": "Lisseria"
  },
  {
    "owner": "Liss",
    "name": "Lissy"
  },
  {
    "owner": "Liss",
    "name": "Liselle"
  },
  {
    "owner": "Liss",
    "name": "Lissi"
  },
  {
    "owner": "Liss",
    "name": "Lissiel"
  },
  {
    "owner": "Liss",
    "name": "Lissea"
  },
  {
    "owner": "Unk",
    "name": "UnknownBM"
  },
  {
    "owner": "Unk",
    "name": "Lasting"
  },
  {
    "owner": "Unk",
    "name": "Bishophs"
  },
  {
    "owner": "Kerm",
    "name": "iKermy"
  },
  {
    "owner": "Kerm",
    "name": "xKermy"
  },
  {
    "owner": "Kerm",
    "name": "ImKerming"
  },
  {
    "owner": "Kerm",
    "name": "Pingsoo"
  },
  {
    "owner": "Kerm",
    "name": "KermySE"
  },
  {
    "owner": "Lucy",
    "name": "Rurni"
  },
  {
    "owner": "Lucy",
    "name": "iiLucy"
  },
  {
    "owner": "Lucy",
    "name": "iabu"
  },
  {
    "owner": "Lucy",
    "name": "LalaL00psy"
  },
  {
    "owner": "Juls",
    "name": "Motive"
  },
  {
    "owner": "Juls",
    "name": "Doubtful"
  },
  {
    "owner": "Juls",
    "name": "Resource"
  },
  {
    "owner": "Juls",
    "name": "Gracee"
  },
  {
    "owner": "DY",
    "name": "mellowdy"
  },
  {
    "owner": "DY",
    "name": "8lo8lo8lowme"
  },
  {
    "owner": "DY",
    "name": "sunbaedy"
  },
  {
    "owner": "DY",
    "name": "okdy"
  },
  {
    "owner": "DY",
    "name": "mabokdy"
  },
  {
    "owner": "DY",
    "name": "Afersie"
  },
  {
    "owner": "DY",
    "name": "Wookimo"
  },
  {
    "owner": "Andy",
    "name": "Shibe"
  },
  {
    "owner": "Andy",
    "name": "Shiba"
  },
  {
    "owner": "Andy",
    "name": "Shibah"
  },
  {
    "owner": "Andy",
    "name": "Shibao"
  },
  {
    "owner": "Andy",
    "name": "Krce"
  },
  {
    "owner": "Lior",
    "name": "Leal"
  },
  {
    "owner": "Lior",
    "name": "Ayala"
  },
  {
    "owner": "Lior",
    "name": "Blending"
  },
  {
    "owner": "Lior",
    "name": "Ayara"
  }
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}
function normalizeLabel(s) {
  return String(s || "").toLowerCase().replace(/[^a-z]/g, "");
}
function pickValue(items, label, fallbackIndex) {
  const wanted = normalizeLabel(label);
  for (const item of items) {
    const parts = item.split(":");
    if (parts.length >= 2 && normalizeLabel(parts[0]) === wanted) {
      return parts.slice(1).join(":").trim();
    }
  }
  return items[fallbackIndex] || "";
}
async function fetchCharacter(character) {
  const url = `https://dreamms.gg/index.php?stats=${encodeURIComponent(character.name)}`;
  const res = await fetch(url, { headers: { "user-agent": "DreamMS-ToZ-Planner-Level-Updater/1.0" } });
  if (!res.ok) throw new Error(`${character.name}: HTTP ${res.status}`);
  const html = await res.text();
  const lists = [...html.matchAll(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
  const chosenList = lists[2] || lists[0] || html;
  let items = [...chosenList.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripTags(m[1]));
  if (items.length < 3) {
    items = stripTags(chosenList).split(/\s{2,}|\n+/).map((x) => x.trim()).filter(Boolean);
  }
  const name = pickValue(items, "name", 0) || character.name;
  const job = pickValue(items, "job", 1);
  const levelText = pickValue(items, "level", 2);
  const level = Number(String(levelText).replace(/[^\d]/g, ""));
  return { owner: character.owner, name, job, level: Number.isFinite(level) && level > 0 ? level : null, source: url };
}
async function main() {
  const output = [];
  const failures = [];
  for (const character of characters) {
    try {
      const data = await fetchCharacter(character);
      output.push(data);
      console.log(`OK ${character.name}: Lv ${data.level || "?"} ${data.job || ""}`);
    } catch (err) {
      failures.push({ owner: character.owner, name: character.name, error: String(err.message || err) });
      output.push({ owner: character.owner, name: character.name, level: null, job: "", error: String(err.message || err) });
      console.warn(`FAIL ${character.name}: ${err.message || err}`);
    }
    await sleep(350);
  }
  await fs.writeFile("characters.json", JSON.stringify({ updatedAt: new Date().toISOString(), characters: output, failures }, null, 2));
}
main().catch((err) => { console.error(err); process.exit(1); });
