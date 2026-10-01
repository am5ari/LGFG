import {
    auth,
    db
} from "./firebase-config.js";

import {
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";


// ================================
// ELEMENTS
// ================================

const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");

const loginForm = document.getElementById("loginForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");

const addEventButton = document.getElementById("addEventButton");

const eventFormSection =
    document.getElementById("eventFormSection");

const eventForm =
    document.getElementById("eventForm");

const cancelEventButton =
    document.getElementById("cancelEventButton");

const cancelEventButton2 =
    document.getElementById("cancelEventButton2");

const formTitle =
    document.getElementById("formTitle");

const formMessage =
    document.getElementById("formMessage");

const eventsList =
    document.getElementById("eventsList");

const eventCount =
    document.getElementById("eventCount");


// Form fields

const eventId =
    document.getElementById("eventId");

const eventTitle =
    document.getElementById("eventTitle");

const eventDate =
    document.getElementById("eventDate");

const eventTime =
    document.getElementById("eventTime");

const eventLocation =
    document.getElementById("eventLocation");

const eventAddress =
    document.getElementById("eventAddress");

const eventDescription =
    document.getElementById("eventDescription");



const eventButtonText =
    document.getElementById("eventButtonText");

const eventButtonLink =
    document.getElementById("eventButtonLink");

const eventFeatured =
    document.getElementById("eventFeatured");


// ================================
// AUTHENTICATION
// ================================

onAuthStateChanged(auth, async (user) => {

    if (user) {

        console.log("Logged in:", user.email);

        loginScreen.classList.add("hidden");

        dashboard.classList.remove("hidden");

        await loadEvents();

    } else {

        loginScreen.classList.remove("hidden");

        dashboard.classList.add("hidden");

    }

});


// ================================
// LOGIN
// ================================

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    loginError.textContent = "";

    try {

        await signInWithEmailAndPassword(
            auth,
            loginEmail.value.trim(),
            loginPassword.value
        );

        loginForm.reset();

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Incorrect email or password.";

    }

});


// ================================
// LOGOUT
// ================================

logoutButton.addEventListener("click", async () => {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(error);

    }

});


// ================================
// OPEN ADD EVENT FORM
// ================================

addEventButton.addEventListener("click", () => {

    openNewEventForm();

});


// ================================
// CANCEL FORM
// ================================

cancelEventButton.addEventListener(
    "click",
    closeEventForm
);

cancelEventButton2.addEventListener(
    "click",
    closeEventForm
);


// ================================
// NEW EVENT
// ================================

function openNewEventForm() {

    eventForm.reset();

    eventId.value = "";

    formTitle.textContent =
        "Add New Event";

    formMessage.textContent = "";

    eventFormSection.classList.remove("hidden");

    window.scrollTo({
        top: eventFormSection.offsetTop - 20,
        behavior: "smooth"
    });

}


// ================================
// CLOSE FORM
// ================================

function closeEventForm() {

    eventFormSection.classList.add("hidden");

    eventForm.reset();

    eventId.value = "";

}


// ================================
// LOAD EVENTS
// ================================

async function loadEvents() {

    eventsList.innerHTML = `
        <div class="loading">
            Loading events...
        </div>
    `;

    try {

        const eventsRef =
            collection(db, "events");

        const snapshot =
            await getDocs(eventsRef);

        const events = [];

        snapshot.forEach((document) => {

            events.push({
                id: document.id,
                ...document.data()
            });

        });


        // Sort events by date
        events.sort((a, b) => {

            const dateA =
                new Date(a.date || "9999-12-31");

            const dateB =
                new Date(b.date || "9999-12-31");

            return dateA - dateB;

        });


        eventCount.textContent =
            `${events.length} ${
                events.length === 1 ? "Event" : "Events"
            }`;


        if (events.length === 0) {

            eventsList.innerHTML = `
                <div class="loading">
                    No events yet.
                    Click "Add New Event" to create one.
                </div>
            `;

            return;

        }


        eventsList.innerHTML = "";


        events.forEach((event) => {

            const card =
                document.createElement("div");

            card.className = "event-card";


            const formattedDate =
                formatDate(event.date);


            card.innerHTML = `

                <div class="event-info">

                    ${
                        event.featured
                        ? `
                            <span class="event-featured">
                                FEATURED EVENT
                            </span>
                        `
                        : ""
                    }

                    <h3>
                        ${escapeHTML(event.title || "Untitled Event")}
                    </h3>

                    <div class="event-date">
                        ${formattedDate}
                        ${event.time ? ` • ${escapeHTML(event.time)}` : ""}
                    </div>

                    <div class="event-location">

                        ${escapeHTML(event.location || "")}

                        ${
                            event.address
                            ? ` • ${escapeHTML(event.address)}`
                            : ""
                        }

                    </div>

                    <p class="event-description">
                        ${escapeHTML(event.description || "")}
                    </p>

                </div>


                <div class="event-actions">

                    <button
                        class="edit-button"
                        data-id="${event.id}"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-button"
                        data-id="${event.id}"
                    >
                        Delete
                    </button>

                </div>

            `;


            eventsList.appendChild(card);

        });


        // Add edit handlers
        document
            .querySelectorAll(".edit-button")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => editEvent(button.dataset.id)
                );

            });


        // Add delete handlers
        document
            .querySelectorAll(".delete-button")
            .forEach((button) => {

                button.addEventListener(
                    "click",
                    () => deleteEvent(button.dataset.id)
                );

            });


    } catch (error) {

        console.error(error);

        eventsList.innerHTML = `
            <div class="loading">
                Unable to load events.
                Check your Firebase Firestore setup.
            </div>
        `;

    }

}


// ================================
// SAVE EVENT
// ================================

eventForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    formMessage.textContent =
        "Saving event...";


    const eventData = {

        title: eventTitle.value.trim(),

        date: eventDate.value,

        time: eventTime.value.trim(),

        location: eventLocation.value.trim(),

        address: eventAddress.value.trim(),

        description: eventDescription.value.trim(),

        

        buttonText: eventButtonText.value.trim(),

        buttonLink: eventButtonLink.value.trim(),

        featured: eventFeatured.checked

    };


    try {

        // Editing existing event
        if (eventId.value) {

            const eventRef =
                doc(db, "events", eventId.value);

            await updateDoc(
                eventRef,
                eventData
            );

        }

        // Creating new event
        else {

            await addDoc(
                collection(db, "events"),
                {
                    ...eventData,
                    createdAt: serverTimestamp()
                }
            );

        }


        formMessage.textContent =
            "Event saved successfully!";


        await loadEvents();


        setTimeout(() => {

            closeEventForm();

        }, 700);


    } catch (error) {

        console.error(error);

        formMessage.textContent =
            "There was a problem saving the event.";

    }

});


// ================================
// EDIT EVENT
// ================================

// ================================
// EDIT EVENT
// ================================

async function editEvent(id) {

    try {

        const eventRef =
            doc(db, "events", id);

        const snapshot =
            await getDoc(eventRef);


        if (!snapshot.exists()) {

            alert("Event no longer exists.");

            await loadEvents();

            return;

        }


        const event = snapshot.data();


        eventId.value = id;

        eventTitle.value =
            event.title || "";

        eventDate.value =
            event.date || "";

        eventTime.value =
            event.time || "";

        eventLocation.value =
            event.location || "";

        eventAddress.value =
            event.address || "";

        eventDescription.value =
            event.description || "";

        eventButtonText.value =
            event.buttonText || "";

        eventButtonLink.value =
            event.buttonLink || "";

        eventFeatured.checked =
            event.featured === true;


        formTitle.textContent =
            "Edit Event";

        formMessage.textContent = "";

        eventFormSection.classList.remove(
            "hidden"
        );


        window.scrollTo({
            top: eventFormSection.offsetTop - 20,
            behavior: "smooth"
        });


    } catch (error) {

        console.error("EDIT EVENT ERROR:", error);

        alert("Unable to load this event.");

    }

}


// ================================
// DELETE EVENT
// ================================

async function deleteEvent(id) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this event?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "events", id)
        );

        await loadEvents();

    } catch (error) {

        console.error(error);

        alert(
            "Unable to delete the event."
        );

    }

}


// ================================
// FORMAT DATE
// ================================

function formatDate(dateString) {

    if (!dateString) {
        return "";
    }


    const date =
        new Date(`${dateString}T12:00:00`);


    if (Number.isNaN(date.getTime())) {
        return dateString;
    }


    return date.toLocaleDateString(
        "en-US",
        {
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );

}


// ================================
// ESCAPE HTML
// ================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value ?? "";

    return div.innerHTML;

}