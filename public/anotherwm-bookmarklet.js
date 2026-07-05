(function () {
  var APP = "https://anotherone-2hs.pages.dev/secret/anotherwm/import";
  var LABELS = {
    title: ["Title", "標題"],
    actress: ["Actress", "Actresses", "女優"],
    genre: ["Genre", "Genres", "類型"],
    releaseDate: ["Release date", "Release Date", "發行日期"],
    code: ["Code", "番號"]
  };
  var STOP_LABELS = []
    .concat(LABELS.title, LABELS.actress, LABELS.genre, LABELS.releaseDate, LABELS.code)
    .concat(["Series", "Maker", "Label", "Director", "系列", "發行商", "標籤", "導演"]);
  var debugMode = /[?&]debug=1(?:&|$)/.test((document.currentScript && document.currentScript.src) || "");

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function absolute(value) {
    try {
      return new URL(value, location.href).href;
    } catch {
      return value || "";
    }
  }

  function b64(value) {
    return btoa(unescape(encodeURIComponent(value))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function meta(name) {
    var node = document.querySelector('meta[property="' + name + '"],meta[name="' + name + '"]');
    return node ? node.content || "" : "";
  }

  function codeFrom(value) {
    var match = String(value || "").match(/([a-z]{2,8})[-_ ]?(\d{2,6})/i);
    return match ? match[1].toUpperCase() + "-" + match[2] : "";
  }

  function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function labelPattern(label) {
    return new RegExp("^\\s*" + escapeRegExp(label) + "\\s*[:：]?\\s*$", "i");
  }

  function rowFor(labels) {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("div,p,li,section,dl"));
    for (var i = 0; i < labels.length; i += 1) {
      var label = labels[i];
      var escaped = escapeRegExp(label);
      var inline = nodes
        .map(function (node) {
          return { node: node, value: clean(node.innerText || node.textContent || "") };
        })
        .filter(function (item) {
          return new RegExp(escaped + "\\s*[:：]", "i").test(item.value) && item.value.length < 1200;
        })
        .sort(function (a, b) {
          return a.value.length - b.value.length;
        })[0];
      if (inline) return { node: inline.node, label: label };

      var labelNode = Array.prototype.slice.call(document.querySelectorAll("span,b,strong,dt"))
        .find(function (node) {
          return labelPattern(label).test(clean(node.innerText || node.textContent || ""));
        });
      if (labelNode) return { node: labelNode.closest("div,p,li,dl") || labelNode.parentElement, label: label };
    }
    return null;
  }

  function stopPattern(label) {
    return STOP_LABELS
      .filter(function (item) {
        return item.toLowerCase() !== label.toLowerCase();
      })
      .map(escapeRegExp)
      .join("|");
  }

  function labelText(labels) {
    var row = rowFor(labels);
    if (!row) return "";
    var value = clean(row.node.innerText || row.node.textContent || "");
    var escaped = escapeRegExp(row.label);
    var match = value.match(new RegExp(escaped + "\\s*[:：]\\s*([\\s\\S]*?)(?=\\s+(?:" + stopPattern(row.label) + ")\\s*[:：]|$)", "i"));
    return clean(match && match[1] ? match[1] : value.replace(new RegExp("^\\s*" + escaped + "\\s*[:：]?\\s*", "i"), ""));
  }

  function isUsefulLink(item, paths) {
    var value = (item.name + " " + item.url).toLowerCase();
    var allowedPaths = Array.isArray(paths) ? paths : [paths].filter(Boolean);
    if (!item.name) return false;
    if (allowedPaths.length && !allowedPaths.some(function (path) { return item.url.toLowerCase().indexOf(path) >= 0; })) return false;
    if (/ranking|排行|login|sign|vip|search|telegram|official|menu/.test(value)) return false;
    return true;
  }

  function linksFor(labels, paths) {
    var row = rowFor(labels);
    if (row) {
      var links = Array.prototype.slice.call(row.node.querySelectorAll("a"))
        .map(function (anchor) {
          return { name: clean(anchor.innerText || anchor.textContent || ""), url: absolute(anchor.getAttribute("href") || "") };
        })
        .filter(function (item) {
          return isUsefulLink(item, paths);
        });
      if (links.length) return uniqueLinks(links);
    }

    return uniqueLinks(labelText(labels)
      .split(/[,，、/]/)
      .map(function (name) {
        return { name: clean(name) };
      })
      .filter(function (item) {
        return item.name;
      }));
  }

  function uniqueLinks(items) {
    var seen = {};
    return items.filter(function (item) {
      var key = item.name.toLowerCase();
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function findCover(code) {
    var missavCover = code && /missav/i.test(location.hostname) ? "https://fourhoi.com/" + code.toLowerCase() + "/cover-n.jpg" : "";
    var coverCandidate = document.querySelector('img[src*="cover"],img[data-src*="cover"],source[src*="cover"],source[data-src*="cover"]');
    return missavCover ||
      meta("og:image") ||
      (document.querySelector("video") || {}).poster ||
      (coverCandidate && (coverCandidate.getAttribute("src") || coverCandidate.getAttribute("data-src"))) ||
      "";
  }

  var rawText = clean(document.body.innerText || document.body.textContent || "");
  var pageTitle = clean((document.querySelector("h1") || {}).innerText || document.title);
  var code = codeFrom(location.href + " " + pageTitle + " " + rawText) || codeFrom(labelText(LABELS.code));
  var releaseRaw = labelText(LABELS.releaseDate);
  var releaseMatch = releaseRaw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  var releaseDate = releaseMatch ? releaseMatch[1] + "-" + releaseMatch[2].padStart(2, "0") + "-" + releaseMatch[3].padStart(2, "0") : "";
  var payload = {
    url: location.href,
    title: pageTitle,
    code: code,
    coverUrl: absolute(findCover(code)),
    previewUrl: absolute(meta("og:video") || meta("og:video:url") || meta("og:video:secure_url") || ""),
    rawText: rawText,
    selectedText: clean(String(window.getSelection && window.getSelection() || "")),
    releaseDate: releaseDate,
    actresses: linksFor(LABELS.actress, ["/actresses/"]),
    genres: linksFor(LABELS.genre, ["/genres/", "/chinese-subtitle"])
  };

  console.log("AnotherWM import payload", payload);
  if (debugMode) {
    var output = JSON.stringify(payload, null, 2);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(output).catch(function () {});
    }
    alert("AnotherWM payload copied to clipboard:\n\n" + output.slice(0, 1600));
    return;
  }

  location.href = APP + "#b64=" + b64(JSON.stringify(payload));
})();
