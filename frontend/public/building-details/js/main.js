/**
 * main.js
 * http://www.detail.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2016, detail
 * http://www.detail.com
 */
(function (window) {
  "use strict";

  // helper functions
  // from https://davidwalsh.name/vendor-prefix
  var prefix = (function () {
    var styles = window.getComputedStyle(document.documentElement, ""),
      pre = (Array.prototype.slice
        .call(styles)
        .join("")
        .match(/-(moz|webkit|ms)-/) ||
        (styles.OLink === "" && ["", "o"]))[1],
      dom = "WebKit|Moz|MS|O".match(new RegExp("(" + pre + ")", "i"))[1];

    return {
      dom: dom,
      lowercase: pre,
      css: "-" + pre + "-",
      js: pre[0].toUpperCase() + pre.substr(1),
    };
  })();

  // vars & stuff
  var support = { transitions: Modernizr.csstransitions },
    transEndEventNames = {
      WebkitTransition: "webkitTransitionEnd",
      MozTransition: "transitionend",
      OTransition: "oTransitionEnd",
      msTransition: "MSTransitionEnd",
      transition: "transitionend",
    },
    transEndEventName = transEndEventNames[Modernizr.prefixed("transition")],
    onEndTransition = function (el, callback, propTest) {
      var onEndCallbackFn = function (ev) {
        if (support.transitions) {
          if (
            ev.target != this ||
            (propTest &&
              ev.propertyName !== propTest &&
              ev.propertyName !== prefix.css + propTest)
          )
            return;
          this.removeEventListener(transEndEventName, onEndCallbackFn);
        }
        if (callback && typeof callback === "function") {
          callback.call(this);
        }
      };
      if (support.transitions) {
        el.addEventListener(transEndEventName, onEndCallbackFn);
      } else {
        onEndCallbackFn();
      }
    },
    // the building element
    building,
    // building´s levels wrapper
    buildingLevelsEl,
    // building´s levels
    buildingLevels,
    // total levels
    buildingLevelsTotal,
    // surroundings elems
    buildingSurroundings,
    // selected level position
    selectedLevel,
    // navigation element wrapper
    buildingNav,
    // show all building´s levels ctrl
    allLevelsCtrl,
    // levels navigation up/down ctrls
    levelUpCtrl,
    levelDownCtrl,
    // pins
    pins,
    // content element
    contentEl,
    // content close ctrl
    contentCloseCtrl,
    // check if a content item is opened
    isOpenContentArea,
    // check if currently animating/navigating
    isNavigating,
    // check if all levels are shown or if one level is shown (expanded)
    isExpanded,
    // spaces list element
    spacesListEl,
    // spaces list ul
    spacesEl,
    // all the spaces listed
    spaces,
    // reference to the current shows space (name set in the data-name attr of both the listed spaces and the pins on the map)
    spaceref,
    // listjs initiliazation (all building´s spaces)
    spacesList,
    // sbuildinger screens:
    // open search ctrl
    openSearchCtrl,
    // main container
    containerEl,
    // close search ctrl
    closeSearchCtrl;

  function init() {
    // Re-initialize DOM elements after dynamic content is loaded
    building = document.querySelector(".building");
    buildingLevelsEl = building.querySelector(".levels");
    buildingLevels = [].slice.call(buildingLevelsEl.querySelectorAll(".level"));
    buildingLevelsTotal = buildingLevels.length;
    buildingSurroundings = [].slice.call(
      building.querySelectorAll(".surroundings")
    );
    buildingNav = document.querySelector(".buildingnav");
    allLevelsCtrl = buildingNav.querySelector(
      ".buildingnav__button--all-levels"
    );
    levelUpCtrl = buildingNav.querySelector(".buildingnav__button--up");
    levelDownCtrl = buildingNav.querySelector(".buildingnav__button--down");
    pins = [].slice.call(buildingLevelsEl.querySelectorAll(".pin"));
    contentEl = document.querySelector(".buildingdetails-content");
    contentCloseCtrl = contentEl.querySelector("button.content__button");
    spacesListEl = document.getElementById("spaces-list");
    spacesEl = spacesListEl.querySelector("ul.buildingdetails-list");
    spaces = [].slice.call(
      spacesEl.querySelectorAll(".list__item > a.list__link")
    );
    openSearchCtrl = document.querySelector("button.open-search");
    containerEl = document.querySelector(".container");
    closeSearchCtrl = spacesListEl.querySelector("button.close-search");

    // Re-initialize List.js
    if (spacesListEl) {
      spacesList = new List("spaces-list", {
        valueNames: ["list__link", { data: ["level"] }],
      });
    }

    // init/bind events
    initEvents();

    // Add level titles for all levels on initial load
    setTimeout(function () {
      addAllLevelTitles();
    }, 100);
  }

  /**
   * Set opacity for pins based on active state
   */
  function setPinsOpacity() {
    var pinsContainer = buildingLevelsEl.querySelector(".level__pins--active");
    if (pinsContainer) {
      if (isOpenContentArea) {
        // When content is open, add class to make other pins 25% opacity
        classie.add(pinsContainer, "level__pins--has-active");
      } else {
        // When content is closed, remove class to make all pins 100% opacity
        classie.remove(pinsContainer, "level__pins--has-active");
      }
    }
  }

  /**
   * Initialize/Bind events fn.
   */
  function initEvents() {
    // click on a building´s level
    buildingLevels.forEach(function (level, pos) {
      level.addEventListener("click", function () {
        // shows this level
        showLevel(pos + 1);
      });
    });

    // click on the show building´s levels ctrl
    allLevelsCtrl.addEventListener("click", function () {
      // shows all levels
      showAllLevels();
    });

    // navigating through the levels
    levelUpCtrl.addEventListener("click", function () {
      navigate("Down");
    });
    levelDownCtrl.addEventListener("click", function () {
      navigate("Up");
    });

    // hovering a pin / clicking a pin
    pins.forEach(function (pin) {
      var contentItem = contentEl.querySelector(
        '.content__item[data-space="' + pin.getAttribute("data-space") + '"]'
      );

      pin.addEventListener("mouseenter", function () {
        if (!isOpenContentArea) {
          classie.add(contentItem, "content__item--hover");
        }
      });
      pin.addEventListener("mouseleave", function () {
        if (!isOpenContentArea) {
          classie.remove(contentItem, "content__item--hover");
        }
      });
      pin.addEventListener("click", function (ev) {
        ev.preventDefault();
        // open content for this pin
        openContent(pin.getAttribute("data-space"));
        // remove hover class (showing the title)
        classie.remove(contentItem, "content__item--hover");
        // set pins opacity
        setPinsOpacity();
      });
    });

    // closing the content area
    contentCloseCtrl.addEventListener("click", function () {
      closeContentArea();
      // set pins opacity after closing
      setTimeout(function () {
        setPinsOpacity();
      }, 100);
    });

    // clicking on a listed space: open level - shows space
    spaces.forEach(function (space) {
      var spaceItem = space.parentNode,
        level = spaceItem.getAttribute("data-level"),
        spacerefval = spaceItem.getAttribute("data-space");

      space.addEventListener("click", function (ev) {
        ev.preventDefault();
        // for sbuildinger screens: close search bar
        closeSearch();
        // open level
        showLevel(level);
        // open content for this space
        openContent(spacerefval);
        // set pins opacity after a short delay to ensure content is loaded
        setTimeout(function () {
          setPinsOpacity();
        }, 100);
      });
    });

    // sbuildinger screens: open the search bar
    openSearchCtrl.addEventListener("click", function () {
      openSearch();
    });

    // sbuildinger screens: close the search bar
    closeSearchCtrl.addEventListener("click", function () {
      closeSearch();
    });

    // Handle search input to remove level titles during search
    var searchInput = document.querySelector(".search__input");
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        if (this.value.trim() !== "") {
          // Remove level titles when searching
          var existingTitles = spacesEl.querySelectorAll(".list__level-title");
          existingTitles.forEach(function (title) {
            title.remove();
          });
        } else {
          // If search is cleared, add appropriate level titles back
          if (isExpanded && selectedLevel) {
            // If we're in a specific level, add level title back
            addLevelTitleAfterFilter();
          } else {
            // If we're showing all levels, add all level titles back
            addAllLevelTitles();
          }
        }
      });
    }
  }

  /**
   * Opens a level. The current level moves to the center while the other ones move away.
   */
  function showLevel(level) {
    if (isExpanded) {
      return false;
    }

    // update selected level val
    selectedLevel = level;

    // control navigation controls state
    setNavigationState();

    classie.add(buildingLevelsEl, "levels--selected-" + selectedLevel);

    // the level element
    var levelEl = buildingLevels[selectedLevel - 1];
    classie.add(levelEl, "level--current");

    onEndTransition(
      levelEl,
      function () {
        classie.add(buildingLevelsEl, "levels--open");

        // show level pins
        showPins();

        isExpanded = true;
      },
      "transform"
    );

    // hide surroundings element
    hideSurroundings();

    // show building nav ctrls
    showbuildingNav();

    // filter the spaces for this level
    showLevelSpaces();

    // Remove any active pin state when changing levels
    var pinsContainer = buildingLevelsEl.querySelector(".level__pins--active");
    if (pinsContainer) {
      classie.remove(pinsContainer, "level__pins--has-active");
    }

    // set pins opacity after level change
    setTimeout(function () {
      setPinsOpacity();
    }, 100);
  }

  /**
   * Shows all building´s levels
   */
  function showAllLevels() {
    if (isNavigating || !isExpanded) {
      return false;
    }
    isExpanded = false;

    classie.remove(buildingLevels[selectedLevel - 1], "level--current");
    classie.remove(buildingLevelsEl, "levels--selected-" + selectedLevel);
    classie.remove(buildingLevelsEl, "levels--open");

    // hide level pins
    removePins();

    // shows surrounding element
    showSurroundings();

    // hide building nav ctrls
    hidebuildingNav();

    // show back the complete list of spaces
    spacesList.filter();

    // Add level titles for all levels
    addAllLevelTitles();

    // close content area if it is open
    if (isOpenContentArea) {
      closeContentArea();
    }

    // set pins opacity after showing all levels
    setTimeout(function () {
      setPinsOpacity();
    }, 100);
  }

  /**
   * Shows all spaces for current level
   */
  function showLevelSpaces() {
    spacesList.filter(function (item) {
      return item.values().level === selectedLevel.toString();
    });

    // Add level title after filtering
    addLevelTitleAfterFilter();
  }

  /**
   * Shows the level´s pins
   */
  function showPins(levelEl) {
    var levelEl = levelEl || buildingLevels[selectedLevel - 1];
    classie.add(levelEl.querySelector(".level__pins"), "level__pins--active");

    // set pins opacity after pins are shown
    setTimeout(function () {
      setPinsOpacity();
    }, 100);
  }

  /**
   * Removes the level´s pins
   */
  function removePins(levelEl) {
    var levelEl = levelEl || buildingLevels[selectedLevel - 1];
    classie.remove(
      levelEl.querySelector(".level__pins"),
      "level__pins--active"
    );

    // set pins opacity after pins are removed
    setTimeout(function () {
      setPinsOpacity();
    }, 100);
  }

  /**
   * Show the navigation ctrls
   */
  function showbuildingNav() {
    classie.remove(buildingNav, "buildingnav--hidden");
  }

  /**
   * Hide the navigation ctrls
   */
  function hidebuildingNav() {
    classie.add(buildingNav, "buildingnav--hidden");
  }

  /**
   * Show the surroundings level
   */
  function showSurroundings() {
    buildingSurroundings.forEach(function (el) {
      classie.remove(el, "surroundings--hidden");
    });
  }

  /**
   * Hide the surroundings level
   */
  function hideSurroundings() {
    buildingSurroundings.forEach(function (el) {
      classie.add(el, "surroundings--hidden");
    });
  }

  /**
   * Navigate through the building´s levels
   */
  function navigate(direction) {
    if (isNavigating || !isExpanded || isOpenContentArea) {
      return false;
    }
    isNavigating = true;

    var prevSelectedLevel = selectedLevel;

    // current level
    var currentLevel = buildingLevels[prevSelectedLevel - 1];

    if (direction === "Up" && prevSelectedLevel > 1) {
      --selectedLevel;
    } else if (
      direction === "Down" &&
      prevSelectedLevel < buildingLevelsTotal
    ) {
      ++selectedLevel;
    } else {
      isNavigating = false;
      return false;
    }

    // control navigation controls state (enabled/disabled)
    setNavigationState();
    // transition direction class
    classie.add(currentLevel, "level--moveOut" + direction);
    // next level element
    var nextLevel = buildingLevels[selectedLevel - 1];
    // ..becomes the current one
    classie.add(nextLevel, "level--current");

    // when the transition ends..
    onEndTransition(currentLevel, function () {
      classie.remove(currentLevel, "level--moveOut" + direction);
      // solves rendering bug for the SVG opacity-fill property
      setTimeout(function () {
        classie.remove(currentLevel, "level--current");
      }, 60);

      classie.remove(buildingLevelsEl, "levels--selected-" + prevSelectedLevel);
      classie.add(buildingLevelsEl, "levels--selected-" + selectedLevel);

      // show the current level´s pins
      showPins();

      isNavigating = false;
    });

    // filter the spaces for this level
    showLevelSpaces();

    // hide the previous level´s pins
    removePins(currentLevel);

    // Remove any active pin state when navigating between levels
    var pinsContainer = buildingLevelsEl.querySelector(".level__pins--active");
    if (pinsContainer) {
      classie.remove(pinsContainer, "level__pins--has-active");
    }

    // set pins opacity after navigation
    setTimeout(function () {
      setPinsOpacity();
    }, 100);
  }

  /**
   * Control navigation ctrls state. Add disable class to the respective ctrl when the current level is either the first or the last.
   */
  function setNavigationState() {
    if (selectedLevel == 1) {
      classie.add(levelDownCtrl, "boxbutton--disabled");
    } else {
      classie.remove(levelDownCtrl, "boxbutton--disabled");
    }

    if (selectedLevel == buildingLevelsTotal) {
      classie.add(levelUpCtrl, "boxbutton--disabled");
    } else {
      classie.remove(levelUpCtrl, "boxbutton--disabled");
    }
  }

  /**
   * Opens/Reveals a content item.
   */
  function openContent(spacerefval) {
    // if one already shown:
    if (isOpenContentArea) {
      hideSpace();
      spaceref = spacerefval;
      showSpace();
    } else {
      spaceref = spacerefval;
      openContentArea();
    }

    // remove class active (if any) from current list item
    var activeItem = spacesEl.querySelector("li.list__item--active");
    if (activeItem) {
      classie.remove(activeItem, "list__item--active");
    }
    // list item gets class active (if the list item is currently shown in the list)
    var listItem = spacesEl.querySelector(
      'li[data-space="' + spacerefval + '"]'
    );
    if (listItem) {
      classie.add(listItem, "list__item--active");
    }

    // set pins opacity after content is opened
    setTimeout(function () {
      setPinsOpacity();
    }, 100);
  }

  /**
   * Opens the content area.
   */
  function openContentArea() {
    isOpenContentArea = true;
    // shows space
    showSpace(true);
    // show close ctrl
    classie.remove(contentCloseCtrl, "content__button--hidden");
    // resize building area
    classie.add(building, "building--content-open");
    // disable building nav ctrls
    classie.add(levelDownCtrl, "boxbutton--disabled");
    classie.add(levelUpCtrl, "boxbutton--disabled");
  }

  /**
   * Shows a space.
   */
  function showSpace(sliding) {
    // the content item
    var contentItem = contentEl.querySelector(
      '.content__item[data-space="' + spaceref + '"]'
    );

    // Cek apakah ada konten yang sedang aktif dan berbeda dengan konten baru
    var currentContentItem = contentEl.querySelector(".content__item--current");
    var isNewContent = currentContentItem && currentContentItem !== contentItem;

    if (isNewContent) {
      // Jika ada konten yang berbeda, lakukan transisi
      var title = currentContentItem.querySelector(".content__item-title");
      var image = currentContentItem.querySelector(".content__image");
      var meta = currentContentItem.querySelector(".content__meta");

      // Reset class untuk memastikan animasi berjalan
      if (title) {
        title.classList.remove("fade-in");
        title.classList.add("fade-out");
      }
      if (image) {
        image.classList.remove("fade-in");
        image.classList.add("fade-out");
      }
      if (meta) {
        meta.classList.remove("fade-in");
        meta.classList.add("fade-out");
      }

      // Tunggu animasi fade-out selesai
      setTimeout(function () {
        // Remove current class dari item sebelumnya
        classie.remove(currentContentItem, "content__item--current");

        // Reset class fade-out dari item sebelumnya
        if (title) title.classList.remove("fade-out");
        if (image) image.classList.remove("fade-out");
        if (meta) meta.classList.remove("fade-out");

        // show content baru
        classie.add(contentItem, "content__item--current");

        // Reset class untuk konten baru dan langsung terlihat
        var newTitle = contentItem.querySelector(".content__item-title");
        var newImage = contentItem.querySelector(".content__image");
        var newMeta = contentItem.querySelector(".content__meta");

        if (newTitle) {
          newTitle.classList.remove("fade-out", "fade-in");
        }
        if (newImage) {
          newImage.classList.remove("fade-out", "fade-in");
        }
        if (newMeta) {
          newMeta.classList.remove("fade-out", "fade-in");
        }

        // Konten baru langsung terlihat tanpa animasi fade-in

        // Lanjutkan dengan logika normal
        if (sliding) {
          onEndTransition(contentItem, function () {
            classie.add(contentEl, "content--open");
            // Add class to pins container after content is fully open
            var pinsContainer = buildingLevelsEl.querySelector(
              ".level__pins--active"
            );
            if (pinsContainer) {
              classie.add(pinsContainer, "level__pins--has-active");
            }
          });
        } else {
          // If not sliding, add class immediately
          var pinsContainer = buildingLevelsEl.querySelector(
            ".level__pins--active"
          );
          if (pinsContainer) {
            classie.add(pinsContainer, "level__pins--has-active");
          }
        }
        // map pin gets selected
        classie.add(
          buildingLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'),
          "pin--active"
        );
      }, 300); // Tambah waktu untuk animasi fade-out
    } else {
      // Jika tidak ada konten yang aktif atau konten yang sama, langsung tampilkan tanpa transisi
      classie.add(contentItem, "content__item--current");

      if (sliding) {
        onEndTransition(contentItem, function () {
          classie.add(contentEl, "content--open");
          // Add class to pins container after content is fully open
          var pinsContainer = buildingLevelsEl.querySelector(
            ".level__pins--active"
          );
          if (pinsContainer) {
            classie.add(pinsContainer, "level__pins--has-active");
          }
        });
      } else {
        // If not sliding, add class immediately
        var pinsContainer = buildingLevelsEl.querySelector(
          ".level__pins--active"
        );
        if (pinsContainer) {
          classie.add(pinsContainer, "level__pins--has-active");
        }
      }
      // map pin gets selected
      classie.add(
        buildingLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'),
        "pin--active"
      );
    }
  }

  /**
   * Closes the content area.
   */
  function closeContentArea() {
    classie.remove(contentEl, "content--open");
    // close current space
    hideSpace();
    // hide close ctrl
    classie.add(contentCloseCtrl, "content__button--hidden");
    // resize building area
    classie.remove(building, "building--content-open");
    // enable building nav ctrls
    if (isExpanded) {
      setNavigationState();
    }
    isOpenContentArea = false;

    // Remove class from pins container when content is closed
    var pinsContainer = buildingLevelsEl.querySelector(".level__pins--active");
    if (pinsContainer) {
      classie.remove(pinsContainer, "level__pins--has-active");
    }
  }

  /**
   * Hides a space.
   */
  function hideSpace() {
    // the content item
    var contentItem = contentEl.querySelector(
      '.content__item[data-space="' + spaceref + '"]'
    );
    // hide content
    classie.remove(contentItem, "content__item--current");
    // map pin gets unselected
    classie.remove(
      buildingLevelsEl.querySelector('.pin[data-space="' + spaceref + '"]'),
      "pin--active"
    );

    // Remove class from pins container since no pin is active
    var pinsContainer = buildingLevelsEl.querySelector(".level__pins--active");
    if (pinsContainer) {
      classie.remove(pinsContainer, "level__pins--has-active");
    }

    // remove class active (if any) from current list item
    var activeItem = spacesEl.querySelector("li.list__item--active");
    if (activeItem) {
      classie.remove(activeItem, "list__item--active");
    }
  }

  /**
   * for sbuildinger screens: open search bar
   */
  function openSearch() {
    // shows all levels - we want to show all the spaces for sbuildinger screens
    showAllLevels();

    classie.add(spacesListEl, "spaces-list--open");
    classie.add(containerEl, "container--overflow");
  }

  /**
   * for sbuildinger screens: close search bar
   */
  function closeSearch() {
    classie.remove(spacesListEl, "spaces-list--open");
    classie.remove(containerEl, "container--overflow");
  }

  /**
   * Add level title after filtering
   */
  function addLevelTitleAfterFilter() {
    // Remove any existing level titles first
    var existingTitles = spacesEl.querySelectorAll(".list__level-title");
    existingTitles.forEach(function (title) {
      title.remove();
    });

    // Add level title at the beginning of the filtered list
    var firstItem = spacesEl.querySelector("li.list__item");
    if (firstItem) {
      var levelTitle = document.createElement("div");
      levelTitle.className = "list__level-title";
      levelTitle.textContent = "Lantai " + selectedLevel;
      spacesEl.insertBefore(levelTitle, firstItem);
    }
  }

  /**
   * Add level titles for all levels
   */
  function addAllLevelTitles() {
    // Remove any existing level titles first
    var existingTitles = spacesEl.querySelectorAll(".list__level-title");
    existingTitles.forEach(function (title) {
      title.remove();
    });

    // Get all list items
    var listItems = spacesEl.querySelectorAll("li.list__item");
    var currentLevel = null;

    listItems.forEach(function (item, index) {
      var itemLevel = item.getAttribute("data-level");

      // If this is a new level, add level title
      if (itemLevel !== currentLevel) {
        currentLevel = itemLevel;
        var levelTitle = document.createElement("div");
        levelTitle.className = "list__level-title";
        levelTitle.textContent = "Lantai " + itemLevel;
        spacesEl.insertBefore(levelTitle, item);
      }
    });
  }

  // Don't auto-init, wait for dynamic content to be loaded
  // init();

  // Make init function globally available
  window.buildingDetailsInit = init;

  // Listen for messages from parent window
  window.addEventListener("message", function (event) {
    if (event.data.type === "highlight-ruangan") {
      console.log("Received highlight-ruangan message:", event.data);

      // Find the ruangan by name (since ID format is different)
      var ruanganNama = event.data.ruanganNama;
      var ruanganLantai = event.data.ruanganLantai;

      // Try to find ruangan by name in pins
      var targetRuangan = null;

      // Search in pins by matching the aria-label or finding by name
      pins.forEach(function (pin) {
        var pinAriaLabel = pin.getAttribute("aria-label");
        if (pinAriaLabel && pinAriaLabel.includes(ruanganNama)) {
          targetRuangan = pin;
        }
      });

      // If not found in pins, try to find in spaces list
      if (!targetRuangan) {
        var spacesList = document.querySelectorAll(".list__link");
        spacesList.forEach(function (spaceLink) {
          if (spaceLink.textContent.trim() === ruanganNama) {
            var listItem = spaceLink.closest(".list__item");
            if (listItem) {
              var spaceRef = listItem.getAttribute("data-space");
              // Find the corresponding pin
              pins.forEach(function (pin) {
                if (pin.getAttribute("data-space") === spaceRef) {
                  targetRuangan = pin;
                }
              });
            }
          }
        });
      }

      if (targetRuangan) {
        // Get the space reference
        var spaceRef = targetRuangan.getAttribute("data-space");

        // Show the level where the ruangan is located
        var levelElement = targetRuangan.closest(".level");
        if (levelElement) {
          var levelIndex = buildingLevels.indexOf(levelElement);
          if (levelIndex !== -1) {
            showLevel(levelIndex + 1);
          }
        }

        // Open the ruangan content
        setTimeout(function () {
          openContent(spaceRef);
          // set pins opacity after highlighting ruangan
          setTimeout(function () {
            setPinsOpacity();
          }, 600);
        }, 500);

        console.log("Highlighted ruangan:", spaceRef);
      } else {
        console.warn("Ruangan not found:", ruanganNama);

        // Fallback: try to show the level if we know the lantai
        if (ruanganLantai) {
          var levelIndex = parseInt(ruanganLantai) - 1;
          if (levelIndex >= 0 && levelIndex < buildingLevels.length) {
            showLevel(parseInt(ruanganLantai));
            // set pins opacity after fallback level show
            setTimeout(function () {
              setPinsOpacity();
            }, 100);
            console.log(
              "Showed level:",
              ruanganLantai,
              "but ruangan not found"
            );
          }
        }
      }
    }
  });
})(window);
