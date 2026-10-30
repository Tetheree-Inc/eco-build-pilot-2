(function () {
  var main = document.getElementById("status-main");
  if (!main) return;

  var contentUrl = new URL("./content.json", document.baseURI).href;

  function renderBlocks(blocks) {
    main.innerHTML = "";
    var list = document.createElement("div");
    list.className = "status-blocks";
    list.setAttribute("role", "list");

    blocks.forEach(function (block) {
      var item = document.createElement("article");
      item.className = "status-block";
      item.setAttribute("role", "listitem");
      if (block.state) item.setAttribute("data-state", block.state);

      var label = document.createElement("h2");
      label.className = "status-block__label";
      label.textContent = block.label || "Status";

      var value = document.createElement("p");
      value.className = "status-block__value";
      value.textContent = block.value || "—";

      item.appendChild(label);
      item.appendChild(value);

      if (block.detail) {
        var detail = document.createElement("p");
        detail.className = "status-block__detail";
        detail.textContent = block.detail;
        item.appendChild(detail);
      }

      list.appendChild(item);
    });

    main.appendChild(list);
  }

  function showError(message) {
    main.innerHTML =
      '<p class="site-main__error" role="alert">' + message + "</p>";
  }

  fetch(contentUrl)
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(function (data) {
      var blocks = data && Array.isArray(data.blocks) ? data.blocks : [];
      if (!blocks.length) {
        showError("No status blocks in content.json.");
        return;
      }
      renderBlocks(blocks);
    })
    .catch(function () {
      showError("Could not load status content.");
    });
})();
