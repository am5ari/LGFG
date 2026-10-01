import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// =========================
// MOBILE NAVIGATION
// =========================

const hamburger =
    document.querySelector(".hamburger");

const nav =
    document.querySelector(".nav");

const aboutDropdown =
    document.querySelector(".nav-dropdown");

const aboutParent =
    document.querySelector(".nav-parent");


// =========================
// OPEN / CLOSE MOBILE MENU
// =========================

if (hamburger && nav) {

    hamburger.addEventListener("click", () => {

        const isOpen =
            nav.classList.toggle("open");

        hamburger.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });

}




// ==================================================
// NAVIGATION DROPDOWNS
// ==================================================

document.addEventListener("DOMContentLoaded", () => {

    const nav = document.querySelector(".nav");
    const hamburger = document.querySelector(".hamburger");

    const dropdowns =
        document.querySelectorAll(".nav-dropdown");


    // ==================================================
    // SET UP DROPDOWNS
    // ==================================================

    dropdowns.forEach((dropdownContainer) => {

        const button =
            dropdownContainer.querySelector(".nav-parent");

        const menu =
            dropdownContainer.querySelector(".dropdown-menu");


        if (!button || !menu) {
            return;
        }


        // ==================================================
        // OPEN / CLOSE DROPDOWN
        // ==================================================

        button.addEventListener("click", (event) => {

            event.preventDefault();
            event.stopPropagation();


            const isOpen =
                dropdownContainer.classList.contains("active");


            // ------------------------------------------
            // CLOSE OTHER DROPDOWNS
            // ------------------------------------------

            dropdowns.forEach((otherDropdown) => {

                if (otherDropdown !== dropdownContainer) {

                    otherDropdown.classList.remove("active");


                    const otherButton =
                        otherDropdown.querySelector(".nav-parent");


                    if (otherButton) {

                        otherButton.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                }

            });


            // ------------------------------------------
            // TOGGLE CURRENT DROPDOWN
            // ------------------------------------------

            if (isOpen) {

                dropdownContainer.classList.remove("active");

                button.setAttribute(
                    "aria-expanded",
                    "false"
                );

            } else {

                dropdownContainer.classList.add("active");

                button.setAttribute(
                    "aria-expanded",
                    "true"
                );

            }

        });


        // ==================================================
        // DROPDOWN LINKS
        // ==================================================

        const links =
            menu.querySelectorAll("a");


        links.forEach((link) => {

            link.addEventListener("click", (event) => {

                // Prevent the click from bubbling
                // back to the dropdown button
                event.stopPropagation();


                // Close dropdown
                dropdownContainer.classList.remove("active");


                button.setAttribute(
                    "aria-expanded",
                    "false"
                );


                // Close mobile menu
                if (nav) {

                    nav.classList.remove("open");

                }


                if (hamburger) {

                    hamburger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }


                // DO NOT preventDefault()
                //
                // The browser will follow the
                // link normally.

            });

        });

    });


    // ==================================================
    // NORMAL NAVIGATION LINKS
    // ==================================================

    if (nav) {

        const normalNavLinks =
            nav.querySelectorAll(":scope > a");


        normalNavLinks.forEach((link) => {

            link.addEventListener("click", () => {

                nav.classList.remove("open");


                if (hamburger) {

                    hamburger.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });

        });

    }


    // ==================================================
    // CLICK OUTSIDE DROPDOWN
    // ==================================================

    document.addEventListener("click", (event) => {

        if (!event.target.closest(".nav-dropdown")) {

            dropdowns.forEach((dropdownContainer) => {

                dropdownContainer.classList.remove("active");


                const button =
                    dropdownContainer.querySelector(".nav-parent");


                if (button) {

                    button.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            });

        }

    });

});







// =========================
// LOAD COMMUNITY EVENTS
// =========================

async function loadPublicEvents() {

    const eventSection =
        document.getElementById(
            "communityEvents"
        );

    const title =
        document.getElementById(
            "publicEventTitle"
        );

    const date =
        document.getElementById(
            "publicEventDate"
        );

    const location =
        document.getElementById(
            "publicEventLocation"
        );

    const description =
        document.getElementById(
            "publicEventDescription"
        );

    const button =
        document.getElementById(
            "publicEventButton"
        );


    if (!eventSection) {

        console.error(
            "Community Events section not found."
        );

        return;

    }


    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "events"
                )
            );


        const events = [];


        snapshot.forEach((document) => {

            events.push({

                id: document.id,

                ...document.data()

            });

        });


        // =========================
        // ONLY SHOW UPCOMING EVENTS
        // =========================

        const today =
            new Date();


        today.setHours(
            0,
            0,
            0,
            0
        );


        const upcomingEvents =
            events.filter((event) => {

                if (!event.date) {

                    return true;

                }


                const eventDate =
                    new Date(
                        `${event.date}T12:00:00`
                    );


                return eventDate >= today;

            });


        // =========================
        // SORT BY DATE
        // =========================

        upcomingEvents.sort(
            (a, b) => {

                if (!a.date) return 1;

                if (!b.date) return -1;


                const dateA =
                    new Date(
                        `${a.date}T12:00:00`
                    );


                const dateB =
                    new Date(
                        `${b.date}T12:00:00`
                    );


                return dateA - dateB;

            }
        );


        // =========================
        // FEATURED EVENT FIRST
        // =========================

        let selectedEvent =
            upcomingEvents.find(
                event =>
                    event.featured === true
            );


        if (!selectedEvent) {

            selectedEvent =
                upcomingEvents[0];

        }


        // =========================
        // NO EVENTS
        // =========================

        if (!selectedEvent) {

            eventSection.style.display =
                "none";

            return;

        }


        // =========================
        // EVENT TITLE
        // =========================

        title.textContent =
            selectedEvent.title ||
            "Community Event";


        // =========================
        // EVENT DATE + TIME
        // =========================

        let dateText =
            formatEventDate(
                selectedEvent.date
            );


        if (selectedEvent.time) {

            dateText +=
                ` • ${selectedEvent.time}`;

        }


        date.textContent =
            dateText;


        // =========================
        // EVENT LOCATION
        // =========================

        location.innerHTML =
            "";


        if (selectedEvent.location) {

            const locationName =
                document.createElement(
                    "strong"
                );


            locationName.textContent =
                selectedEvent.location;


            location.appendChild(
                locationName
            );

        }


        if (selectedEvent.address) {

            const address =
                document.createElement(
                    "span"
                );


            address.textContent =
                selectedEvent.address;


            address.style.display =
                "block";


            location.appendChild(
                address
            );

        }


        // =========================
        // DESCRIPTION
        // =========================

        description.textContent =
            selectedEvent.description ||
            "";


        // =========================
        // BUTTON
        // =========================

        button.textContent =
            selectedEvent.buttonText ||
            "Get Involved";


        if (
            selectedEvent.buttonLink &&
            selectedEvent.buttonLink.trim()
        ) {

            button.href =
                selectedEvent.buttonLink;


            button.target =
                "_blank";


            button.rel =
                "noopener noreferrer";

        } else {

            button.href =
                "#contact";


            button.removeAttribute(
                "target"
            );


            button.removeAttribute(
                "rel"
            );

        }


        // =========================
        // SHOW EVENT
        // =========================

        eventSection.style.display =
            "block";

    } catch (error) {

        console.error(
            "Error loading events:",
            error
        );


        title.textContent =
            "Community Events";


        date.textContent =
            "Check back soon";


        location.textContent =
            "Look Good Feel Good Lexington";


        description.textContent =
            "Visit us again soon for upcoming community events.";


        button.style.display =
            "none";

    }

}


// =========================
// FORMAT DATE
// =========================

function formatEventDate(dateString) {

    if (!dateString) {

        return "";

    }


    const date =
        new Date(
            `${dateString}T12:00:00`
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    ).toUpperCase();

}


// =========================
// START
// =========================

loadPublicEvents();


// ==================================================
// HERO PHOTO SLIDESHOW
// ==================================================

document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll(".hero-slide");
    const dots = document.querySelectorAll(".hero-dot");
    const previousButton = document.querySelector(".hero-slide-prev");
    const nextButton = document.querySelector(".hero-slide-next");

    if (!slides.length) return;

    let currentSlide = 0;
    let slideshowTimer;

    function showSlide(index) {
        if (index >= slides.length) {
            index = 0;
        }

        if (index < 0) {
            index = slides.length - 1;
        }

        currentSlide = index;

        slides.forEach((slide) => {
            slide.classList.remove("active");
        });

        dots.forEach((dot) => {
            dot.classList.remove("active");
        });

        slides[currentSlide].classList.add("active");

        if (dots[currentSlide]) {
            dots[currentSlide].classList.add("active");
        }
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
        restartTimer();
    }

    function previousSlide() {
        showSlide(currentSlide - 1);
        restartTimer();
    }

    if (nextButton) {
        nextButton.addEventListener("click", nextSlide);
    }

    if (previousButton) {
        previousButton.addEventListener("click", previousSlide);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
            restartTimer();
        });
    });

    function startTimer() {
        slideshowTimer = setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    function restartTimer() {
        clearInterval(slideshowTimer);
        startTimer();
    }

    showSlide(0);
    startTimer();
});

/* =========================
   FEATURED VIDEO CAROUSEL
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const featuredVideo = document.getElementById("featuredVideo");
    const featuredVideoSource = document.getElementById("featuredVideoSource");

    const thumbnails = document.querySelectorAll(".video-thumbnail");

    const leftButton = document.querySelector(".video-scroll-left");
    const rightButton = document.querySelector(".video-scroll-right");

    const thumbnailContainer = document.getElementById("videoThumbnails");


    if (!featuredVideo || !featuredVideoSource || !thumbnails.length) {
        return;
    }


    /* =========================
       CHANGE FEATURED VIDEO
    ========================= */

    thumbnails.forEach((thumbnail) => {

        thumbnail.addEventListener("click", () => {

            const videoPath = thumbnail.dataset.video;

            if (!videoPath) {
                return;
            }


            /* Stop current video */

            featuredVideo.pause();


            /* Fade out */

            featuredVideo.style.opacity = "0";


            setTimeout(() => {

                featuredVideoSource.src = videoPath;

                featuredVideo.load();

                featuredVideo.style.opacity = "1";

            }, 300);


            /* Update active thumbnail */

            thumbnails.forEach((item) => {
                item.classList.remove("active");
            });

            thumbnail.classList.add("active");

        });

    });


    /* =========================
       THUMBNAIL SCROLLING
    ========================= */

    if (leftButton) {

        leftButton.addEventListener("click", () => {

            thumbnailContainer.scrollBy({
                left: -300,
                behavior: "smooth"
            });

        });

    }


    if (rightButton) {

        rightButton.addEventListener("click", () => {

            thumbnailContainer.scrollBy({
                left: 300,
                behavior: "smooth"
            });

        });

    }

});