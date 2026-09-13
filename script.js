import { db } from "./firebase-config.js";

import {
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

// =========================
// MOBILE NAVIGATION
// =========================

const hamburger = document.querySelector(".hamburger");
const nav = document.querySelector(".nav");

if (hamburger && nav) {
    hamburger.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");

        hamburger.setAttribute(
            "aria-expanded",
            isOpen
        );
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");

            hamburger.setAttribute(
                "aria-expanded",
                "false"
            );
        });
    });
}


// =========================
// LOAD COMMUNITY EVENTS
// =========================

async function loadPublicEvents() {

    const eventSection =
        document.getElementById("communityEvents");

    const title =
        document.getElementById("publicEventTitle");

    const date =
        document.getElementById("publicEventDate");

    const location =
        document.getElementById("publicEventLocation");

    const description =
        document.getElementById("publicEventDescription");

    const button =
        document.getElementById("publicEventButton");

    if (!eventSection) {
        console.error(
            "Community Events section not found."
        );
        return;
    }

    try {

        const snapshot =
            await getDocs(
                collection(db, "events")
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

        const today = new Date();

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

        upcomingEvents.sort((a, b) => {

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

        });


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

        location.innerHTML = "";


        if (selectedEvent.location) {

            const locationName =
                document.createElement("strong");

            locationName.textContent =
                selectedEvent.location;

            location.appendChild(
                locationName
            );

        }


        if (selectedEvent.address) {

            const address =
                document.createElement("span");

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