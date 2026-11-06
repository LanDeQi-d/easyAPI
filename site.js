(() => {
  "use strict";
  const config = window.EASY_SITE || {};
  function inferRepository(location) {
    const match = location.hostname.match(/^([a-z0-9-]+)\.github\.io$/i);
    if (!match) return "";
    const segment = location.pathname.split("/").filter(Boolean)[0];
    const repo = segment && !segment.includes(".") ? segment : `${match[1]}.github.io`;
    return `${match[1]}/${repo}`;
  }
  const repository = (config.repository || inferRepository(window.location)).trim();
  const valid = /^[a-z0-9-]+\/[a-z0-9_.-]+$/i.test(repository);
  const tag = String(config.releaseTag || "v2026.10.31");
  const base = valid ? `https://github.com/${repository}/releases` : "";
  const release = base ? `${base}/tag/${encodeURIComponent(tag)}` : "";
  const help = document.getElementById("download-help");
  for (const link of document.querySelectorAll("[data-asset]")) {
    if (base) {
      link.href = `${base}/download/${encodeURIComponent(link.dataset.release || tag)}/${encodeURIComponent(link.dataset.asset)}`;
    } else {
      link.addEventListener("click", () => { help.hidden = false; });
    }
  }
  const releaseLink = document.getElementById("release-link");
  if (release) {
    releaseLink.href = releaseLink.dataset?.release ? `${base}/tag/${encodeURIComponent(releaseLink.dataset?.release)}` : release;
    releaseLink.target = "_blank";
    releaseLink.rel = "noopener noreferrer";
  } else {
    releaseLink.addEventListener("click", () => { help.hidden = false; });
  }
})();
