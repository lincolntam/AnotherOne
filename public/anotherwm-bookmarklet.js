(function () {
  var APP = "https://anotherone-2hs.pages.dev/secret/anotherwm/import";
  var labels = ["Title", "標題", "Actress", "Actresses", "女優", "Genre", "Genres", "類型", "Release date", "Release Date", "發行日期", "Code", "番號", "系列", "發行商", "標籤", "導演"];

  function text(value) {
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
    return match ? (match[1].toUpperCase() + "-" + match[2]) : "";
  }

  function scoreNode(node) {
    var value = text(node.innerText || node.textContent || "");
    if (value.length < 40 || value.length > 5000) return -1;
    var score = 0;
    if (/發行日期|Release date/i.test(value)) score += 3;
    if (/番號|Code/i.test(value)) score += 3;
    if (/類型|Genre/i.test(value)) score += 3;
    if (/女優|Actress/i.test(value)) score += 2;
    if (codeFrom(value)) score += 1;
    if (/login|sign|vip|搜尋|繁體中文|English|日本語/i.test(value)) score -= 2;
    return score;
  }

  function detailRoot() {
    var nodes = Array.prototype.slice.call(document.querySelectorAll("main,article,section,div"));
    return nodes
      .map(function (node) {
        return { node: node, score: scoreNode(node), length: text(node.innerText || node.textContent || "").length };
      })
      .filter(function (item) {
        return item.score >= 6;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.length - b.length;
      })[0]?.node || document.body;
  }

  function stopPattern(label) {
    return labels
      .filter(function (item) {
        return item.toLowerCase() !== label.toLowerCase();
      })
      .map(function (item) {
        return item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      })
      .join("|");
  }

  function rowElement(root, label) {
    var escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var direct = Array.prototype.slice.call(root.querySelectorAll("div,p,li"))
      .map(function (node) {
        return { node: node, value: text(node.innerText || node.textContent || "") };
      })
      .filter(function (item) {
        return new RegExp(escaped + "\\s*[:：]", "i").test(item.value) && item.value.length < 900;
      })
      .sort(function (a, b) {
        return a.value.length - b.value.length;
      })[0];
    if (direct) return direct.node;

    var labelNode = Array.prototype.slice.call(root.querySelectorAll("span,b,strong,dt"))
      .find(function (node) {
        return new RegExp("^\\s*" + escaped + "\\s*[:：]?\\s*$", "i").test(text(node.innerText || node.textContent || ""));
      });
    return labelNode ? labelNode.closest("div,p,li,dl") : null;
  }

  function labelText(root, names) {
    for (var i = 0; i < names.length; i += 1) {
      var label = names[i];
      var row = rowElement(root, label);
      var value = row ? text(row.innerText || row.textContent || "") : text(root.innerText || root.textContent || "");
      var escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      var match = value.match(new RegExp(escaped + "\\s*[:：]\\s*([\\s\\S]*?)(?=\\s+(?:" + stopPattern(label) + ")\\s*[:：]|$)", "i"));
      if (match && text(match[1])) return text(match[1]);
    }
    return "";
  }

  function linksFor(root, names, path) {
    for (var i = 0; i < names.length; i += 1) {
      var row = rowElement(root, names[i]);
      if (!row) continue;
      var links = Array.prototype.slice.call(row.querySelectorAll("a"))
        .map(function (anchor) {
          return { name: text(anchor.innerText || anchor.textContent || ""), url: absolute(anchor.getAttribute("href") || "") };
        })
        .filter(function (item) {
          return item.name && item.url.toLowerCase().indexOf(path) >= 0 && !/ranking|排行/i.test(item.name + " " + item.url);
        });
      if (links.length) return links;
    }

    return labelText(root, names)
      .split(/[,，、/]/)
      .map(function (name) {
        return { name: text(name) };
      })
      .filter(function (item) {
        return item.name;
      });
  }

  var root = detailRoot();
  var rootText = text(root.innerText || root.textContent || document.body.innerText || "");
  var pageTitle = text((document.querySelector("h1") || {}).innerText || document.title);
  var code = codeFrom(location.href + " " + pageTitle + " " + rootText);
  var releaseText = labelText(root, ["Release date", "Release Date", "發行日期"]);
  var dateMatch = releaseText.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  var releaseDate = dateMatch ? (dateMatch[1] + "-" + dateMatch[2].padStart(2, "0") + "-" + dateMatch[3].padStart(2, "0")) : "";
  var missavCover = code && /missav/i.test(location.hostname) ? "https://fourhoi.com/" + code.toLowerCase() + "/cover-n.jpg" : "";
  var cover = missavCover || meta("og:image") || (document.querySelector("video") || {}).poster || "";
  var payload = {
    url: location.href,
    title: pageTitle,
    code: code || labelText(root, ["Code", "番號"]),
    coverUrl: cover,
    rawText: rootText,
    releaseDate: releaseDate,
    actresses: linksFor(root, ["Actress", "Actresses", "女優"], "/actresses/"),
    genres: linksFor(root, ["Genre", "Genres", "類型"], "/genres/")
  };

  console.log("AnotherWM import payload", payload);
  location.href = APP + "#b64=" + b64(JSON.stringify(payload));
})();
