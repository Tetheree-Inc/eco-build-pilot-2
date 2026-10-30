(function () {
  "use strict";

  var CHANGELOG_BATCH_SIZE = 5;

  var VALID_CHANGELOG_TYPES = {
    Feature: true,
    Fix: true,
    Improvement: true,
    "Security advisory": true,
  };

  var TYPE_SLUG = {
    Feature: "feature",
    Fix: "fix",
    Improvement: "improvement",
    "Security advisory": "security-advisory",
  };

  var CHANGELOG_EMPTY_MESSAGE =
    "No changelog entries yet. Check back after the next release.";
  var CHANGELOG_FILTER_EMPTY_MESSAGE =
    "No changelog entries match this filter. Try another type or show all entries.";
  var CHANGELOG_ERROR_MESSAGE =
    "We couldn't load the changelog right now. Please try again later.";

  var CHANGELOG_FILTER_TABS = [
    { filterType: null, slug: "all", label: "All" },
    { filterType: "Feature", slug: "feature", label: "Feature" },
    { filterType: "Fix", slug: "fix", label: "Fix" },
    { filterType: "Improvement", slug: "improvement", label: "Improvement" },
  ];

  function changelogJsonUrl() {
    return new URL("./changelog.json", document.baseURI).href;
  }

  function dismissStatusLoading() {
    var statusMain = document.getElementById("status-main");
    if (!statusMain) {
      return;
    }
    var loading = statusMain.querySelector(".site-main__loading");
    if (loading) {
      loading.remove();
    }
  }

  function parseChangelogDate(value) {
    if (value == null || value === "") {
      return null;
    }
    var parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }
    return parsed;
  }

  function formatEntryDate(date) {
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  function nonEmptyString(value) {
    return typeof value === "string" && value.trim() !== "";
  }

  function normalizeChangelogEntry(raw) {
    if (!raw || typeof raw !== "object") {
      return null;
    }

    var date = parseChangelogDate(raw.date);
    if (!date) {
      return null;
    }

    var type = raw.type;
    if (!VALID_CHANGELOG_TYPES[type]) {
      return null;
    }

    if (!nonEmptyString(raw.title)) {
      return null;
    }

    var summary = nonEmptyString(raw.summary)
      ? raw.summary.trim()
      : nonEmptyString(raw.body)
        ? raw.body.trim()
        : "";

    if (!summary) {
      return null;
    }

    return {
      date: date,
      type: type,
      title: raw.title.trim(),
      summary: summary,
    };
  }

  function sortChangelogEntries(entries) {
    return entries.slice().sort(function (a, b) {
      return b.date.getTime() - a.date.getTime();
    });
  }

  function showChangelogMessage(root, className, message) {
    root.replaceChildren();
    var paragraph = document.createElement("p");
    paragraph.className = className;
    paragraph.textContent = message;
    root.appendChild(paragraph);
  }

  function createEntryElement(entry) {
    var article = document.createElement("article");
    article.className = "changelog__entry";

    var slug = TYPE_SLUG[entry.type] || "neutral";
    article.setAttribute("data-type", slug);

    var header = document.createElement("header");
    header.className = "changelog__entry-header";

    var timeEl = document.createElement("time");
    timeEl.className = "changelog__entry-date";
    timeEl.dateTime = entry.date.toISOString().slice(0, 10);
    timeEl.textContent = formatEntryDate(entry.date);

    var typeEl = document.createElement("p");
    typeEl.className = "changelog__entry-type";
    typeEl.textContent = entry.type;

    header.appendChild(timeEl);
    header.appendChild(typeEl);

    var titleEl = document.createElement("h3");
    titleEl.className = "changelog__entry-title";
    titleEl.textContent = entry.title;

    var summaryEl = document.createElement("p");
    summaryEl.className = "changelog__entry-summary";
    summaryEl.textContent = entry.summary;

    article.appendChild(header);
    article.appendChild(titleEl);
    article.appendChild(summaryEl);

    return article;
  }

  function renderChangelog(root, entries) {
    root.replaceChildren();

    var activeFilterType = null;
    var visibleCount = CHANGELOG_BATCH_SIZE;

    var filters = document.createElement("div");
    filters.className = "changelog__filters";
    filters.setAttribute("role", "tablist");
    filters.setAttribute("aria-label", "Filter changelog by type");

    var filterTabs = CHANGELOG_FILTER_TABS.map(function (tabDef) {
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "changelog__filter-tab";
      tab.setAttribute("role", "tab");
      tab.id = "changelog-filter-" + tabDef.slug;
      tab.setAttribute("aria-controls", "changelog-entry-list");
      tab.textContent = tabDef.label;
      filters.appendChild(tab);
      return { button: tab, filterType: tabDef.filterType };
    });

    var filterEmpty = document.createElement("p");
    filterEmpty.className = "changelog__empty changelog__filter-empty";
    filterEmpty.hidden = true;
    filterEmpty.textContent = CHANGELOG_FILTER_EMPTY_MESSAGE;

    var list = document.createElement("div");
    list.className = "changelog__list";
    list.setAttribute("role", "list");
    list.id = "changelog-entry-list";

    entries.forEach(function (entry) {
      var item = createEntryElement(entry);
      item.setAttribute("role", "listitem");
      list.appendChild(item);
    });

    var controls = document.createElement("div");
    controls.className = "changelog__controls";
    controls.hidden = true;

    var status = document.createElement("p");
    status.className = "changelog__status";
    status.id = "changelog-show-more-status";

    var button = document.createElement("button");
    button.type = "button";
    button.className = "changelog__show-more";
    button.setAttribute("aria-controls", "changelog-entry-list");
    button.setAttribute("aria-describedby", "changelog-show-more-status");

    function entryMatchesFilter(entry) {
      if (activeFilterType === null) {
        return true;
      }
      return entry.type === activeFilterType;
    }

    function countFilteredEntries() {
      var count = 0;
      for (var i = 0; i < entries.length; i += 1) {
        if (entryMatchesFilter(entries[i])) {
          count += 1;
        }
      }
      return count;
    }

    function updateFilterTabs() {
      filterTabs.forEach(function (tab) {
        var selected = tab.filterType === activeFilterType;
        tab.button.setAttribute("aria-selected", selected ? "true" : "false");
        tab.button.tabIndex = selected ? 0 : -1;
      });
    }

    function updateShowMoreState(filteredCount) {
      if (filteredCount <= CHANGELOG_BATCH_SIZE) {
        return;
      }

      var remaining = filteredCount - visibleCount;
      if (remaining <= 0) {
        button.disabled = true;
        button.setAttribute("aria-disabled", "true");
        button.textContent = "All entries shown";
        status.textContent =
          "Showing all " + filteredCount + " changelog entries.";
        return;
      }

      button.disabled = false;
      button.removeAttribute("aria-disabled");
      var nextBatch = Math.min(CHANGELOG_BATCH_SIZE, remaining);
      button.textContent =
        "Show more (" + nextBatch + " more entr" + (nextBatch === 1 ? "y" : "ies") + ")";
      status.textContent =
        "Showing " + visibleCount + " of " + filteredCount + " changelog entries.";
    }

    function applyVisibility() {
      var filteredCount = 0;

      for (var i = 0; i < entries.length; i += 1) {
        var item = list.children[i];
        if (!entryMatchesFilter(entries[i])) {
          item.hidden = true;
          continue;
        }

        var batchIndex = filteredCount;
        filteredCount += 1;
        item.hidden = batchIndex >= visibleCount;
      }

      filterEmpty.hidden = filteredCount > 0;
      list.hidden = filteredCount === 0;

      if (filteredCount <= CHANGELOG_BATCH_SIZE) {
        controls.hidden = true;
      } else {
        controls.hidden = false;
        updateShowMoreState(filteredCount);
      }

      return filteredCount;
    }

    function setActiveFilter(filterType) {
      activeFilterType = filterType;
      visibleCount = CHANGELOG_BATCH_SIZE;
      updateFilterTabs();
      applyVisibility();
    }

    function selectedFilterIndex() {
      for (var i = 0; i < filterTabs.length; i += 1) {
        if (filterTabs[i].filterType === activeFilterType) {
          return i;
        }
      }
      return 0;
    }

    filterTabs.forEach(function (tab) {
      tab.button.addEventListener("click", function () {
        setActiveFilter(tab.filterType);
      });
    });

    filters.addEventListener("keydown", function (event) {
      var key = event.key;
      if (
        key !== "ArrowLeft" &&
        key !== "ArrowRight" &&
        key !== "Home" &&
        key !== "End"
      ) {
        return;
      }

      event.preventDefault();
      var index = selectedFilterIndex();
      if (key === "Home") {
        index = 0;
      } else if (key === "End") {
        index = filterTabs.length - 1;
      } else if (key === "ArrowRight") {
        index = (index + 1) % filterTabs.length;
      } else {
        index = (index - 1 + filterTabs.length) % filterTabs.length;
      }

      var nextTab = filterTabs[index];
      setActiveFilter(nextTab.filterType);
      nextTab.button.focus();
    });

    button.addEventListener("click", function () {
      var filteredCount = countFilteredEntries();
      visibleCount = Math.min(visibleCount + CHANGELOG_BATCH_SIZE, filteredCount);
      applyVisibility();
    });

    root.appendChild(filters);
    root.appendChild(filterEmpty);
    root.appendChild(list);
    controls.appendChild(button);
    controls.appendChild(status);
    root.appendChild(controls);

    updateFilterTabs();
    applyVisibility();
  }

  function loadChangelog() {
    var root = document.getElementById("changelog-root");
    if (!root) {
      return;
    }

    fetch(changelogJsonUrl())
      .then(function (response) {
        if (!response.ok) {
          throw new Error("changelog fetch failed");
        }
        return response.json();
      })
      .then(function (data) {
        if (!Array.isArray(data)) {
          throw new Error("invalid changelog payload");
        }

        var normalized = data
          .map(normalizeChangelogEntry)
          .filter(function (entry) {
            return entry !== null;
          });

        if (normalized.length === 0) {
          showChangelogMessage(
            root,
            "changelog__empty",
            CHANGELOG_EMPTY_MESSAGE
          );
          return;
        }

        renderChangelog(root, sortChangelogEntries(normalized));
      })
      .catch(function () {
        showChangelogMessage(root, "changelog__error", CHANGELOG_ERROR_MESSAGE);
      });
  }

  function init() {
    dismissStatusLoading();
    loadChangelog();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
