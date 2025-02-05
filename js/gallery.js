// Get modal and image elements
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = document.getElementById("close");

// Get all images in the gallery
const images = document.querySelectorAll(".gallery-image");

// Funzione per ottenere le coordinate del click/tocco
function getTouchPosition(event) {
    let x, y;

    if (event.touches) {
        // Se è un tocco su mobile
        x = event.touches[0].clientX;
        y = event.touches[0].clientY;
    } else {
        // Se è un click su desktop
        x = event.clientX;
        y = event.clientY;
    }

    return { x, y };
}

// Funzione per mostrare la modale con animazione dalla posizione del click/tocco
function showModal(event) {
    let { x, y } = getTouchPosition(event);

    // Posiziona la modale inizialmente dove è stato toccato/cliccato
    modal.style.left = `${x}px`;
    modal.style.top = `${y}px`;
    modal.style.transform = "scale(0)"; // Inizia da scala 0

    modal.style.display = "flex"; // Mostra la modale

    // Forza il reflow per garantire che l'animazione parta dalla posizione iniziale
    void modal.offsetWidth;

    // Attiva l'animazione per portarla al centro
    modal.style.transition = "transform 0.5s ease-out, left 0.5s ease-out, top 0.5s ease-out";
    modal.style.left = "50%";
    modal.style.top = "50%";
    modal.style.transform = "translate(-50%, -50%) scale(1)"; 

    modalImg.src = event.target.src; // Imposta l'immagine selezionata
}

// Aggiunge l'evento sia per il click che per il tocco
images.forEach(img => {
    img.addEventListener("click", showModal);
    img.addEventListener("touchstart", showModal);
});

// Chiudi la modale con animazione zoomOut
closeBtn.addEventListener("click", function () {
    modal.style.transition = "transform 0.5s ease-in, opacity 0.5s ease-in";
    modal.style.transform = "translate(-50%, -50%) scale(0)";
    modal.style.opacity = "0";

    setTimeout(() => {
        modal.style.display = "none"; // Nasconde la modale dopo l'animazione
        modal.style.opacity = "1";
    }, 500); // Deve coincidere con la durata dell'animazione CSS (0.5s)
});

// Close modal when clicking outside the image
modal.addEventListener("click", function (e) {
    if (e.target === modal) {
        modal.style.display = "none"; // Hide modal
    }
});
