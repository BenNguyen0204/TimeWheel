(function () {
    // Theme toggle functionality
    const themeToggle = document.getElementById("theme-toggle");
    const THEME_KEY = "dayClockTheme";

    function loadTheme() {
        try {
            var theme = localStorage.getItem(THEME_KEY);
            if (theme === "light") {
                document.body.classList.add("light");
                themeToggle.textContent = "Dark Mode";
            }
        } catch (e) {
            console.error("Error loading theme:", e);
        }
    }
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        var isLight = document.body.classList.contains("light");
        themeToggle.textContent = isLight ? "Dark Mode" : "Light Mode";
        try {
            localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
        } catch (e) {
            console.error("Error saving theme:", e);
        }
    });

    const colorPicker = document.getElementById("swatches");
    var selectedColor = colorPicker.querySelector(".selected").getAttribute("data-color");

    function setupColorPicker() {
        colorPicker.addEventListener("click", function (event) {
            var button = event.target.closest(".swatch-btn");
            if (!button) {
                return;
            }
            selectedColor = button.getAttribute("data-color");
            var buttons = colorPicker.querySelectorAll(".swatch-btn");
            buttons.forEach(function(removeSelected) {
                removeSelected.classList.remove("selected");
            });
            button.classList.add("selected");
        });
    }

    // Time block state
    const BLOCKS_KEY = "dayClockBlocks";
    const form = document.getElementById("form");
    const startInput = document.getElementById("start");
    const endInput = document.getElementById("end");
    const labelInput = document.getElementById("label");
    const blocksList = document.getElementById("blocks");
    const clock = document.getElementById("clock");
    const hand = document.getElementById("hand");
    const nowLabel = document.getElementById("now-label");

    var blocks = [];

    function loadBlocks() {
        try {
            var stored = localStorage.getItem(BLOCKS_KEY);
            blocks = stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error("Error loading blocks:", e);
            blocks = [];
        }
    }

    function saveBlocks() {
        try {
            localStorage.setItem(BLOCKS_KEY, JSON.stringify(blocks));
        } catch (e) {
            console.error("Error saving blocks:", e);
        }
    }

    // Accepts "H:MM" or "HH:MM" in 24-hour time, returns minutes since midnight or null.
    function parseTimeToMinutes(value) {
        var match = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/.exec((value || "").trim());
        if (!match) {
            return null;
        }
        return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    }

    function formatMinutes(minutes) {
        var h = Math.floor(minutes / 60);
        var m = minutes % 60;
        return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
    }

    function pctFor(minutes) {
        return (minutes / 1440) * 100;
    }

    // Builds one conic-gradient layer per block so overlapping blocks stay
    // independently visible (later blocks are layered on top).
    function gradientForBlock(block) {
        var startPct = pctFor(block.start);
        var endPct = pctFor(block.end);
        var color = block.color;

        if (block.end > block.start) {
            return "conic-gradient(" +
                "transparent 0%, transparent " + startPct + "%, " +
                color + " " + startPct + "%, " + color + " " + endPct + "%, " +
                "transparent " + endPct + "%, transparent 100%)";
        }

        // Block crosses midnight: color both the tail end and the start of the circle.
        return "conic-gradient(" +
            color + " 0%, " + color + " " + endPct + "%, " +
            "transparent " + endPct + "%, transparent " + startPct + "%, " +
            color + " " + startPct + "%, " + color + " 100%)";
    }

    function renderClockFace() {
        if (blocks.length === 0) {
            clock.style.backgroundImage = "none";
            return;
        }
        // Most recently added block is drawn on top of earlier ones.
        var layers = blocks.slice().reverse().map(gradientForBlock);
        clock.style.backgroundImage = layers.join(", ");
    }

    function renderBlocksList() {
        blocksList.innerHTML = "";

        if (blocks.length === 0) {
            var empty = document.createElement("li");
            empty.textContent = "No time blocks yet.";
            empty.style.border = "none";
            empty.style.color = "var(--muted)";
            blocksList.appendChild(empty);
            return;
        }

        blocks.forEach(function (block) {
            var li = document.createElement("li");

            var swatch = document.createElement("span");
            swatch.className = "swatch";
            swatch.style.background = block.color;

            var text = document.createElement("span");
            text.style.flex = "1";
            text.textContent = formatMinutes(block.start) + "\u2013" + formatMinutes(block.end) + "  " + block.label;

            var removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.textContent = "Remove";
            removeBtn.style.marginLeft = "auto";
            removeBtn.style.background = "transparent";
            removeBtn.style.border = "1px solid var(--panel-edge)";
            removeBtn.style.color = "var(--muted)";
            removeBtn.style.borderRadius = "6px";
            removeBtn.style.padding = "6px 10px";
            removeBtn.style.fontSize = "12px";
            removeBtn.style.cursor = "pointer";
            removeBtn.addEventListener("click", function () {
                blocks = blocks.filter(function (b) {
                    return b.id !== block.id;
                });
                saveBlocks();
                renderBlocksList();
                renderClockFace();
            });

            li.appendChild(swatch);
            li.appendChild(text);
            li.appendChild(removeBtn);
            blocksList.appendChild(li);
        });
    }

    function addBlock(start, end, label, color) {
        blocks.push({
            id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
            start: start,
            end: end,
            label: label,
            color: color
        });
        saveBlocks();
        renderBlocksList();
        renderClockFace();
    }

    function setupForm() {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            var start = parseTimeToMinutes(startInput.value);
            var end = parseTimeToMinutes(endInput.value);
            var label = labelInput.value.trim();

            if (start === null || end === null || start === end || !label) {
                return;
            }

            addBlock(start, end, label, selectedColor);
            form.reset();
        });
    }

    // Moves the hour hand and updates the current-time label. The hand's
    // resting rotate(0deg) points straight down (6 o'clock), so midnight
    // (top of the dial) needs an extra 180deg offset.
    function updateNow() {
        var now = new Date();
        var minutes = now.getHours() * 60 + now.getMinutes();
        var rotation = (pctFor(minutes) / 100) * 360 + 180;
        hand.style.transform = "translate(-50%, 0) rotate(" + rotation + "deg)";
        nowLabel.textContent = "current time: " + formatMinutes(minutes);
    }

    setupColorPicker();
    loadTheme();

    loadBlocks();
    renderBlocksList();
    renderClockFace();
    setupForm();

    updateNow();
    setInterval(updateNow, 15000);
})();