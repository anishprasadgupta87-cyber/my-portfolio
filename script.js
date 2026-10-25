// ========================================
// 1. PAGE SCROLL RESTORATION
// ========================================

// Prevent browser from restoring the previous scroll position
if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
}

// Remove the section hash from the URL
if (window.location.hash) {
    history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search
    );
}

// Start at the top of the page
window.addEventListener("load", function () {
    setTimeout(function () {
        window.scrollTo(0, 0);
    }, 100);
});


// ========================================
// 2. TYPING ANIMATION
// ========================================

const typingText = document.getElementById("typing-text");

const words = [
    "Web Developer",
    "Frontend Developer",
    "PHP Developer",
    "Creative Developer"
];

let wordIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeEffect() {

    if (!typingText || words.length === 0) {
        return;
    }

    const currentWord = words[wordIndex];

    if (isDeleting) {
        charIndex--;
    } else {
        charIndex++;
    }

    typingText.textContent = currentWord.substring(0, charIndex);

    let speed = isDeleting ? 50 : 100;

    if (!isDeleting && charIndex === currentWord.length) {
        speed = 1500;
        isDeleting = true;

    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        speed = 400;
    }

    setTimeout(typeEffect, speed);
}

if (typingText) {
    typeEffect();
}


// ========================================
// 3. DARK / LIGHT MODE
// ========================================

const themeToggle = document.getElementById("theme-toggle");
const body = document.body;


// Apply selected theme
function applyTheme(theme) {

    const selectedTheme = theme === "light" ? "light" : "dark";

    if (selectedTheme === "light") {

        body.classList.add("light-mode");

        if (themeToggle) {
            themeToggle.textContent = "🌙 Dark Mode";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to dark mode"
            );
        }

    } else {

        body.classList.remove("light-mode");

        if (themeToggle) {
            themeToggle.textContent = "☀️ Light Mode";

            themeToggle.setAttribute(
                "aria-label",
                "Switch to light mode"
            );
        }
    }

    try {
        localStorage.setItem("portfolio-theme", selectedTheme);
    } catch (error) {
        console.warn("Could not save theme preference.", error);
    }
}


// Load saved theme
let savedTheme = "dark";

try {
    savedTheme = localStorage.getItem("portfolio-theme") || "dark";
} catch (error) {
    console.warn("Could not read saved theme.", error);
}

applyTheme(savedTheme);


// Toggle theme
if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        if (body.classList.contains("light-mode")) {
            applyTheme("dark");
        } else {
            applyTheme("light");
        }

    });
}


// ========================================
// 4. GALLERY IMAGE NAVIGATION
// ========================================

const galleryImages = Array.from(
    document.querySelectorAll(".gallery-img")
);

const galleryModal = document.getElementById("galleryModal");

const modalGalleryImage = document.getElementById(
    "modalGalleryImage"
);

const galleryPrev = document.getElementById("galleryPrev");
const galleryNext = document.getElementById("galleryNext");

const galleryCounter = document.getElementById("galleryCounter");

const galleryViewer = document.querySelector(
    "#galleryModal .gallery-viewer"
);

let currentGalleryIndex = 0;


// Show selected gallery image
function showGalleryImage(index) {

    if (galleryImages.length === 0 || !modalGalleryImage) {
        return;
    }

    // Loop from last image to first and vice versa
    currentGalleryIndex =
        (index + galleryImages.length) % galleryImages.length;

    const selectedImage = galleryImages[currentGalleryIndex];

    const imageSrc =
        selectedImage.dataset.fullImage || selectedImage.src;

    // Update image counter
    if (galleryCounter) {
        galleryCounter.textContent =
            `${currentGalleryIndex + 1} / ${galleryImages.length}`;
    }

    // Fade out current image
    modalGalleryImage.style.opacity = "0";

    // Load the next image before displaying it
    const preloader = new Image();

    preloader.onload = function () {

        modalGalleryImage.src = imageSrc;

        modalGalleryImage.alt =
            selectedImage.alt || "Gallery image";

        requestAnimationFrame(function () {
            modalGalleryImage.style.opacity = "1";
        });

    };

    preloader.onerror = function () {

        console.error("Could not load image:", imageSrc);

        modalGalleryImage.src = imageSrc;

        modalGalleryImage.alt =
            selectedImage.alt || "Gallery image";

        modalGalleryImage.style.opacity = "1";
    };

    preloader.src = imageSrc;

    // Handle cached images
    if (preloader.complete) {

        if (preloader.naturalWidth > 0) {

            modalGalleryImage.src = imageSrc;

            modalGalleryImage.alt =
                selectedImage.alt || "Gallery image";

            modalGalleryImage.style.opacity = "1";

        }
    }
}


// Open the clicked image
galleryImages.forEach(function (image, index) {

    image.addEventListener("click", function () {
        showGalleryImage(index);
    });

});


// Next image button
if (galleryNext) {

    galleryNext.addEventListener("click", function () {
        showGalleryImage(currentGalleryIndex + 1);
    });

}


// Previous image button
if (galleryPrev) {

    galleryPrev.addEventListener("click", function () {
        showGalleryImage(currentGalleryIndex - 1);
    });

}


// ========================================
// 5. KEYBOARD NAVIGATION
// ========================================

document.addEventListener("keydown", function (event) {

    if (!galleryModal || !galleryModal.classList.contains("show")) {
        return;
    }

    if (event.key === "ArrowRight") {

        event.preventDefault();

        showGalleryImage(currentGalleryIndex + 1);

    } else if (event.key === "ArrowLeft") {

        event.preventDefault();

        showGalleryImage(currentGalleryIndex - 1);

    }

});


// ========================================
// 6. MOBILE TOUCH SWIPE
// ========================================

let touchStartX = 0;
let touchStartY = 0;


// Check whether gallery viewer exists
if (galleryViewer) {

    // Record starting touch position
    galleryViewer.addEventListener("touchstart", function (event) {

        const touch = event.changedTouches[0];

        touchStartX = touch.clientX;
        touchStartY = touch.clientY;

    }, { passive: true });


    // Detect swipe direction
    galleryViewer.addEventListener("touchend", function (event) {

        const touch = event.changedTouches[0];

        const differenceX = touch.clientX - touchStartX;
        const differenceY = touch.clientY - touchStartY;

        // Only respond to horizontal swipes
        if (
            Math.abs(differenceX) > 50 &&
            Math.abs(differenceX) > Math.abs(differenceY)
        ) {

            if (differenceX < 0) {

                // Swipe left: next image
                showGalleryImage(currentGalleryIndex + 1);

            } else {

                // Swipe right: previous image
                showGalleryImage(currentGalleryIndex - 1);

            }

        }

    }, { passive: true });

}




/* ========================================
PROJECT CATEGORY FILTER
======================================== */

const projectFilters = document.querySelectorAll(".project-filter");
const projectItems = document.querySelectorAll(".project-item");

projectFilters.forEach(function (button) {

```
button.addEventListener("click", function () {

    const selectedFilter = button.dataset.filter;

    // Update active button
    projectFilters.forEach(function (filterButton) {
        filterButton.classList.remove("active");
    });

    button.classList.add("active");

    // Show matching projects
    projectItems.forEach(function (project) {

        const projectCategory = project.dataset.category;

        const shouldShow =
            selectedFilter === "all" ||
            projectCategory === selectedFilter;

        project.classList.toggle("is-hidden", !shouldShow);

    });

});
```

});
