(function () {
  "use strict";

  var SUPPORTED_BLOCK_TYPES = { "status-badge": true, team: true };
  var VALID_VARIANTS = { ok: true, warn: true, neutral: true };

  var FRIENDLY_ERROR =
    "We couldn't load status content right now. The content file may be missing, invalid, or empty. Please try again later.";

  function contentJsonUrl() {
    return new URL("./content.json", document.baseURI).href;
  }

  function showMainError(main, message) {
    main.replaceChildren();
    var alert = document.createElement("p");
    alert.className = "site-main__error";
    alert.setAttribute("role", "alert");
    alert.textContent = message;
    main.appendChild(alert);
  }

  function normalizeVariant(block) {
    var raw = block.variant != null ? block.variant : block.state;
    if (raw == null || raw === "") {
      return "neutral";
    }
    var key = String(raw).toLowerCase();
    return VALID_VARIANTS[key] ? key : "neutral";
  }

  function nonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function renderStatusBadge(block) {
    var label = nonEmptyString(block.label) ? block.label.trim() : "";
    var text = nonEmptyString(block.text)
      ? block.text.trim()
      : nonEmptyString(block.value)
        ? block.value.trim()
        : "";

    if (!label && !text) {
      return null;
    }

    var article = document.createElement("article");
    article.className =
      "status-badge status-badge--" + normalizeVariant(block);

    if (label) {
      var labelEl = document.createElement("p");
      labelEl.className = "status-badge__label";
      labelEl.textContent = label;
      article.appendChild(labelEl);
    }

    if (text) {
      var textEl = document.createElement("p");
      textEl.className = "status-badge__text";
      textEl.textContent = text;
      article.appendChild(textEl);
    }

    if (nonEmptyString(block.detail)) {
      var detailEl = document.createElement("p");
      detailEl.className = "status-badge__detail";
      detailEl.textContent = block.detail.trim();
      article.appendChild(detailEl);
    }

    return article;
  }

  function isValidTeamMember(entry) {
    return (
      entry &&
      typeof entry === "object" &&
      nonEmptyString(entry.name) &&
      nonEmptyString(entry.role)
    );
  }

  function renderTeam(block) {
    var rawMembers = Array.isArray(block.members) ? block.members : [];
    var members = rawMembers.filter(isValidTeamMember);
    if (members.length === 0) {
      return null;
    }

    var section = document.createElement("section");
    section.className = "team-block";
    section.setAttribute("aria-label", nonEmptyString(block.title) ? block.title.trim() : "Team");

    if (nonEmptyString(block.title)) {
      var heading = document.createElement("h2");
      heading.className = "team-block__title";
      heading.textContent = block.title.trim();
      section.appendChild(heading);
    }

    var list = document.createElement("ul");
    list.className = "team-block__list";

    members.forEach(function (member) {
      var item = document.createElement("li");
      item.className = "team-block__member";

      var nameText = member.name.trim();
      var nameEl;
      if (nonEmptyString(member.url)) {
        nameEl = document.createElement("a");
        nameEl.className = "team-block__name team-block__name--link";
        nameEl.href = member.url.trim();
        nameEl.textContent = nameText;
        nameEl.rel = "noopener noreferrer";
      } else {
        nameEl = document.createElement("span");
        nameEl.className = "team-block__name";
        nameEl.textContent = nameText;
      }
      item.appendChild(nameEl);

      var roleEl = document.createElement("span");
      roleEl.className = "team-block__role";
      roleEl.textContent = member.role.trim();
      item.appendChild(roleEl);

      if (nonEmptyString(member.detail)) {
        var detailEl = document.createElement("p");
        detailEl.className = "team-block__detail";
        detailEl.textContent = member.detail.trim();
        item.appendChild(detailEl);
      }

      list.appendChild(item);
    });

    section.appendChild(list);
    return section;
  }

  function renderBlock(block) {
    if (!block || typeof block !== "object" || typeof block.type !== "string") {
      return null;
    }
    if (block.type === "status-badge") {
      return renderStatusBadge(block);
    }
    if (block.type === "team") {
      return renderTeam(block);
    }
    return null;
  }

  function parseContentPayload(data) {
    if (!data || typeof data !== "object" || !Array.isArray(data.blocks)) {
      return null;
    }
    return data.blocks;
  }

  function renderBlocks(main, blocks) {
    var fragment = document.createDocumentFragment();
    var rendered = 0;

    blocks.forEach(function (block) {
      if (!block || typeof block.type !== "string" || !SUPPORTED_BLOCK_TYPES[block.type]) {
        return;
      }
      var node = renderBlock(block);
      if (node) {
        fragment.appendChild(node);
        rendered += 1;
      }
    });

    if (rendered === 0) {
      showMainError(main, FRIENDLY_ERROR);
      return;
    }

    main.replaceChildren(fragment);
  }

  function loadStatusContent() {
    var main = document.getElementById("status-main");
    if (!main) {
      return;
    }

    fetch(contentJsonUrl())
      .then(function (response) {
        if (!response.ok) {
          throw new Error("content fetch failed");
        }
        return response.json();
      })
      .then(function (data) {
        var blocks = parseContentPayload(data);
        if (!blocks || blocks.length === 0) {
          throw new Error("invalid or empty blocks");
        }
        renderBlocks(main, blocks);
      })
      .catch(function () {
        showMainError(main, FRIENDLY_ERROR);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadStatusContent);
  } else {
    loadStatusContent();
  }
})();
