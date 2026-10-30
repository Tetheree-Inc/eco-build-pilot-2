(function () {
  var main = document.getElementById("status-main");
  if (!main) return;

  var contentUrl = new URL("./content.json", document.baseURI).href;

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function renderStatusBadge(block) {
    var label = block.label || "Status";
    var text = block.text != null && block.text !== "" ? block.text : "—";
    var variant = block.variant || block.state || "neutral";
    var allowed = { ok: true, warn: true, neutral: true };
    if (!allowed[variant]) variant = "neutral";

    var item = document.createElement("article");
    item.className = "status-badge";
    item.setAttribute("data-variant", variant);

    var labelEl = document.createElement("p");
    labelEl.className = "status-badge__label";
    labelEl.textContent = label;

    var badge = document.createElement("p");
    badge.className = "status-badge__text";
    badge.textContent = text;

    item.appendChild(labelEl);
    item.appendChild(badge);

    if (block.detail) {
      var detail = document.createElement("p");
      detail.className = "status-badge__detail";
      detail.textContent = block.detail;
      item.appendChild(detail);
    }

    return item;
  }

  function renderMilestones(block) {
    var items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return null;

    var section = document.createElement("section");
    section.className = "milestones";

    if (block.title) {
      var heading = document.createElement("h2");
      heading.className = "milestones__title";
      heading.textContent = block.title;
      section.appendChild(heading);
    }

    var list = document.createElement("ol");
    list.className = "milestones__list";

    items.forEach(function (entry) {
      var li = document.createElement("li");
      li.className = "milestones__item";

      var status = entry.status || "upcoming";
      var statusAllowed = { done: true, current: true, upcoming: true };
      if (!statusAllowed[status]) status = "upcoming";
      li.setAttribute("data-status", status);

      var title = document.createElement("p");
      title.className = "milestones__item-title";
      title.textContent = entry.title || entry.name || "Milestone";

      li.appendChild(title);

      if (entry.description) {
        var desc = document.createElement("p");
        desc.className = "milestones__item-desc";
        desc.textContent = entry.description;
        li.appendChild(desc);
      }

      list.appendChild(li);
    });

    section.appendChild(list);
    return section;
  }

  function renderBlocks(blocks) {
    main.innerHTML = "";
    var container = document.createElement("div");
    container.className = "content-blocks";

    blocks.forEach(function (block) {
      if (!block || typeof block !== "object") return;

      var type = block.type;
      var node = null;

      if (type === "status-badge") {
        node = renderStatusBadge(block);
      } else if (type === "milestones") {
        node = renderMilestones(block);
      }

      if (node) container.appendChild(node);
    });

    if (!container.childElementCount) {
      showError(
        "content.json has no supported blocks (status-badge or milestones)."
      );
      return;
    }

    main.appendChild(container);
  }

  function showError(message) {
    main.innerHTML =
      '<p class="site-main__error" role="alert">' + escapeHtml(message) + "</p>";
  }

  fetch(contentUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      if (!data || typeof data !== "object") {
        showError("content.json is not a valid JSON object.");
        return;
      }
      var blocks = Array.isArray(data.blocks) ? data.blocks : null;
      if (!blocks) {
        showError('content.json must include a "blocks" array.');
        return;
      }
      if (!blocks.length) {
        showError("content.json has an empty blocks array.");
        return;
      }
      renderBlocks(blocks);
    })
    .catch(function () {
      showError(
        "Could not load status content. Check that content.json is available and valid JSON."
      );
    });
})();
