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

    // Color picker functionality
    const colorPicker = document.getElementById("swatches");
    var selectedColor = colorPicker.querySelector(".selected").getAttribute("data-color")

    function setupColorPicker() {
        colorPicker.addEventListener("click", function (event) {
            var button = event.target.closest(".swatch-btn");
            if (!button) {
                return;
            }
            selectedColor = button.getAttribute("data-color");
            var buttons = colorPicker.querySelectorAll(".swatch-btn");
            buttons.forEach(function (removeSelected) {
                removeSelected.classList.remove("selected");
            });
            button.classList.add("selected");
        });
    }

    setupColorPicker();
    loadTheme();
})();
