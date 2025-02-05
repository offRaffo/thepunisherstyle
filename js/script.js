document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded event fired');  // Log per verificare che il listener venga eseguito
    const container = document.querySelector('.booking');
    const toast = document.getElementById('toast');
    let slotflag = false;
    let time = '';
    const button = document.getElementById('book-appointment');
    const dateInput = document.getElementById('appointment-date');
    const timeSlotsDiv = document.getElementById('time-slots');
    const slotsList = document.getElementById('slots-list');
    const today = new Date()
    const pc_address = 'https://barber-shop-iz21.onrender.com';
    const tomorrow = new Date(today); // Crea una nuova data basata su 'today'
    tomorrow.setDate(today.getDate() + 1); // Incrementa di 1 giorno

    // Ottieni la data in formato YYYY-MM-DD
    const tomorrowString = tomorrow.toISOString().split('T')[0];

    // Imposta l'attributo 'min'
    dateInput.setAttribute('min', tomorrowString);
    //dateInput.setAttribute('min', today+1);

    let selectedDate = null;
    let availableSlots = [];
    let start_date = "";
    let end_date = "";

    // Supponiamo che start_date e end_date siano già definiti nel tuo contesto
    // Esegui la richiesta per inviare questi dati al server
    fetch(pc_address + '/update_calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })
        .then(response => response.json())  // Converte la risposta JSON
        .then(data => {
            console.log('Dati ricevuti dal server:', data);

            // Verifica che i dati ricevuti contengano le chiavi start_date e end_date
            if (data.start_date && data.end_date) {
                // Aggiorna le variabili start_date e end_date con i valori ricevuti dal server
                start_date = data.start_date;
                end_date = data.end_date;
            } else {
                console.error('Dati non validi ricevuti dal server:', data);
            }
        })
        .catch(error => {
            console.error('Errore durante la richiesta:', error);
        });

    function formatDate(dateString) {
        const options = { month: 'long', day: 'numeric' };  // Anno rimosso
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', options);
    }



    dateInput.addEventListener('change', async function () {

        console.log("Updated Start date:", start_date);
        console.log("Updated End date:", end_date);
        selectedDate = dateInput.value;
        console.log("inizio:", start_date, "End date:", end_date);

        // Verifica se la data selezionata è compresa tra start_date e end_date
        if (selectedDate >= start_date && selectedDate <= end_date) {
            dateInput.value = '';  // Reset della data
            // Formatto le date
            let formattedStartDate = formatDate(start_date);
            let formattedEndDate = formatDate(end_date);

            // Mostro l'alert con le date formattate
            if (start_date == end_date) {
                alert(`Ci dispiace, il ${formattedStartDate} siamo in pausa`); location.reload();  // Ricarica la pagina

            }
            else {
                alert(`Ci dispiace, siamo in pausa dal ${formattedStartDate} al ${formattedEndDate}`); location.reload();  // Ricarica la pagina
            }
            return;
        }
        // Recupera gli orari disponibili dal server
        try {
            const response = await fetch(pc_address + `/slots?date=${selectedDate}`);//localhost

            const data = await response.json();
            console.log('Fetch response data:', selectedDate);  // Log per verificare i dati ricevuti

            if (data.success) {
                availableSlots = data.slots;
                console.log(`Available slots: ${availableSlots}`);
                displayTimeSlots();
            } else {
                alert(data.message);  // Mostra eventuali errori come "Tutto esaurito"
            }
        } catch (error) {
            console.error('Error fetching slots:', error);
        }
    });
    function watchForHover() {
        let lastTouchTime = 0;  // Per ignorare eventi emulati di mousemove
      
        function enableHover() {
          if (new Date() - lastTouchTime < 500) return;  // Ignora eventi emulati
          document.body.classList.add('hasHover');
        }
      
        function disableHover() {
          document.body.classList.remove('hasHover');
        }
      
        function updateLastTouchTime() {
          lastTouchTime = new Date();
        }
      
        document.addEventListener('touchstart', updateLastTouchTime, true);
        document.addEventListener('touchstart', disableHover, true);
        document.addEventListener('mousemove', enableHover, true);
      
        enableHover();  // Abilita hover se il mouse è in movimento
      }
      
      watchForHover();  // Avvia la funzione
      

    function displayTimeSlots() {
        slotsList.innerHTML = '';  // Pulisci la lista ogni volta che cambia la data
    
        availableSlots.forEach((slot, index) => {
            
            const li = document.createElement('li');
            li.textContent = slot;
    
            let touchCount = 0;  // Contatore dei tocchi per ogni <li>
            let touchStartTime = 0;  // Memorizza il tempo di inizio del tocco
            let isTouching = false;  // Flag per il tocco in corso
    
            // Gestisci l'evento onClick (tocco breve)
            li.onclick = () => {
                if (isTouching) return; // Se è un tocco lungo, evita la selezione
                selectSlot(slot);  // Se il tocco è breve, seleziona lo slot
            };
    
            // Gestisci l'evento onTouchStart
            li.ontouchstart = (event) => {
                touchStartTime = Date.now();  // Registra l'inizio del tocco
                isTouching = true;  // Imposta il flag del tocco
            };
    
            // Gestisci l'evento onTouchEnd
            li.ontouchend = (event) => {
                const touchDuration = Date.now() - touchStartTime;  // Calcola la durata del tocco
                isTouching = false;  // Reset del flag dopo che il tocco è finito
    
                // Se il tocco dura meno di 300ms, è considerato un "tap"
                if (touchDuration < 300) {
                    touchCount++;
    
                    // Se è il secondo tocco, seleziona lo slot
                    if (touchCount === 2) {
                        selectSlot(slot);  // Se il tocco è breve e consecutivo, esegui la selezione
                        touchCount = 0;  // Reset del contatore
                    }
    
                    // Reset del contatore se non arriva al secondo tocco entro un intervallo di 500ms
                    setTimeout(() => {
                        touchCount = 0;
                    }, 500);  // Timeout di 500ms per il secondo tocco
                }
            };
    
            // Dopo un breve ritardo, rendi l'elemento visibile
            setTimeout(() => {
                li.classList.add('visible');
            }, index * 100);  // Ritardo progressivo tra gli orari
            slotsList.appendChild(li);
        });
    
        timeSlotsDiv.classList.remove('hidden');
        console.log('Time slots displayed');
    }
    
    
    function showtoastmsg(msg) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast.classList.add('visible');
        document.getElementById('toast-message').textContent = msg;
        toast.classList.remove('hidden');
        slotflag = false;
        setTimeout(() => {
            toast.classList.add('hidden');
            toast.classList.remove('visible');
        }, 4000);
    }


    function selectSlot(slot) {
        // Rimuove la classe "selected" da tutti gli slot
        const allSlots = document.querySelectorAll('#slots-list li');
        allSlots.forEach(slotElement => slotElement.classList.remove('selected'));

        // Aggiunge la classe "selected" allo slot cliccato
        const selectedSlotElement = Array.from(allSlots).find(el => el.textContent === slot);
        if (selectedSlotElement) {
            selectedSlotElement.classList.add('selected');
            slotflag = true;
        }
        setTimeout(() => {
            button.disabled = false;
        }, 1000);
        button.onclick = () => bookAppointment(slot);
        time=slot;
        console.log(`Selected slot: ${slot},time: ${time}`);
    }


    async function bookAppointment(slot) {
        // Esempio d'uso
        const name = document.getElementById('name').value.trim();  // Aggiungi il nome della persona
        if (!name) {
            showtoastmsg('inserisci il tuo nome');

            return;
        }
        // Invia i dati della prenotazione al server
        try {
            const response = await fetch(pc_address + '/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ date: selectedDate, slot, name })
            });

            const result = await response.json();

            if (response.ok) {
                slotsList.classList.add('fade-up');
                slotsList.style.display = 'none'; // Nasconde l'elemento dopo l'animazione
                document.getElementById("book-h1").style.display = "none";
                document.getElementById("label-name").style.display = "none";
                document.getElementById("label-date").style.display = "none";
                document.getElementById("name").style.display = "none";
                dateInput.style.display = "none";
                document.getElementById('confirmation').classList.remove('hidden');
                document.getElementById('confirmation-message').textContent = `Prenotazione confermata per il ${selectedDate} alle ${slot}.`;
                timeSlotsDiv.classList.add('hidden');
            } else {
                alert(result.message || "Errore nella prenotazione.");
            }

        } catch (error) {
            console.error('Error booking appointment:', error);
        }
    }
    document.getElementById('book-appointment').addEventListener('click', function () {
        if (slotflag == false) {
            showtoastmsg('seleziona una data');
            return;
        }        // Mostra il toast con il messaggio di conferma
        // Supponiamo che selectedDate sia "2025-02-09" (YYYY-MM-DD)
        let parts = selectedDate.split('-');  // Divide la stringa in ["2025", "02", "09"]
        let formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;  // Riordina in GG-MM-YYYY
        let nome = document.getElementById('name').value.trim();
        console.log("nome: ",nome);
        showtoastmsg(`abbiamo ricevuto la tua prenotazione ci vediamo il ${formattedDate} alle ${time} a presto ${nome}`);
    });

});