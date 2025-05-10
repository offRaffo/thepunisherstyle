document.addEventListener('DOMContentLoaded', function () {
    updateAgenda();
});

async function updateAgenda() {
    try {
        const pc_address = 'https://barber-shop-iz21.onrender.com';
        const agendaContainer = document.getElementById('agenda');
        if (!agendaContainer) return;

        // Pulisci contenuto esistente
        agendaContainer.innerHTML = '';

        // Configurazione pulsanti
        const modifyhourbutn = document.getElementById('form-orario');
        const modify_date_form = document.getElementById('form-data');

        // Evento modifica orari
        modifyhourbutn.addEventListener('submit', async function (e) {
            e.preventDefault();
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 200);

            const startBook = document.getElementById('start_book').value;
            const endBook = document.getElementById('end_book').value;
            const day = document.getElementById('calendar-hour-modifier').value;

            if (startBook && endBook && day) {
                await fetch(`${pc_address}/booking-time`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start_book: startBook, end_book: endBook, day })
                });
                alert("Orari modificati");
            } else {
                alert("Inserisci tutti i campi.");
            }
        });

        // Evento modifica date chiusura
        modify_date_form.addEventListener('submit', async function (e) {
            e.preventDefault();
            this.classList.add('clicked');
            setTimeout(() => this.classList.remove('clicked'), 200);

            const startDate = document.getElementById('start_close_day').value;
            const endDate = document.getElementById('end_close_day').value;

            if (startDate && endDate) {
                await fetch(`${pc_address}/stop_days`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ start_date: startDate, end_date: endDate })
                });
                alert("Date di chiusura aggiornate");
            } else {
                alert("Seleziona entrambe le date.");
            }
        });

        // Recupero prenotazioni
        const response = await fetch(`${pc_address}/reservations`);
        if (!response.ok) throw new Error(`Errore server: ${response.status}`);

        const reservations = await response.json();

        // 🔥 FILTRO: rimuovi prenotazioni passate
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Rimuove ore, minuti, secondi e millisecondi
        const futureReservations = reservations.filter(r => {
            const resDate = new Date(`${r.date}T00:00:00`);  // Aggiungiamo T00:00:00 per standardizzare la data
            return resDate >= today; // Rimuove le prenotazioni passate
        });

        // 🔥 Ordina le prenotazioni in ordine cronologico (data + orario)
        function formatTime(time) {
            // Aggiunge uno zero iniziale se necessario
            const [hours, minutes] = time.split(':');
            const formattedHours = hours.padStart(2, '0');
            const formattedMinutes = minutes.padStart(2, '0');
            return `${formattedHours}:${formattedMinutes}`;
        }

        // 🔥 Ordina le prenotazioni in ordine cronologico (data + orario)
        futureReservations.sort((a, b) => {
            const formattedSlotA = formatTime(a.slot);
            const formattedSlotB = formatTime(b.slot);
            const dateA = new Date(`${a.date}T${formattedSlotA}`);
            const dateB = new Date(`${b.date}T${formattedSlotB}`);

            return dateA - dateB; // Ordina per data e orario
        });

        // Log per verificare l'ordinamento
        futureReservations.forEach(res => {
            const formattedSlot = formatTime(res.slot);
            const dateObj = new Date(`${res.date}T${formattedSlot}`);
        });


        let currentMonth = '';
        let monthContainer, monthList, dayList, currentDay = '';

        futureReservations.forEach(res => {
            const dateObj = new Date(res.date);
            const monthName = dateObj.toLocaleString('it-IT', { month: 'long', year: 'numeric' });
            const formattedDate = dateObj.toLocaleDateString('it-IT', { weekday: 'long', day: '2-digit', month: 'long' });

            if (monthName !== currentMonth) {
                currentMonth = monthName;
                monthContainer = document.createElement('div');
                monthContainer.className = 'month-container';

                const title = document.createElement('h2');
                title.textContent = currentMonth;
                monthContainer.appendChild(title);

                monthList = document.createElement('div');
                monthList.className = 'month-list';
                monthContainer.appendChild(monthList);

                agendaContainer.appendChild(monthContainer);
            }

            if (res.date !== currentDay) {
                currentDay = res.date;
                const separator = document.createElement('div');
                separator.className = 'day-separator';
                separator.innerHTML = `<h3>${formattedDate}</h3>`;
                monthList.appendChild(separator);

                dayList = document.createElement('ul');
                dayList.className = 'day-list';
                monthList.appendChild(dayList);
            }

            const item = document.createElement('li');
            item.setAttribute('data-id', res.id);
            item.innerHTML = `<time>${res.slot}</time><br>${res.name}`;

            // Aggiunta icona di cancellazione
            const cancelIcon = document.createElement('img');
            cancelIcon.src = 'images/icons8-cancel.svg';
            cancelIcon.width = 16;
            cancelIcon.height = 16;
            cancelIcon.alt = 'Cancella';
            cancelIcon.id = 'cancel-book-icon';

            cancelIcon.addEventListener('click', async () => {
                const id = item.getAttribute('data-id');
                const deleteRes = await fetch(`${pc_address}/reservations/${id}`, { method: 'DELETE' });
                if (deleteRes.ok) {
                    item.remove();
                    alert("Prenotazione rimossa");
                }
            });

            item.appendChild(cancelIcon);
            dayList.appendChild(item);

            // Gestione dell'animazione dell'icona
            item.addEventListener('mouseenter', () => {
                cancelIcon.style.opacity = '1';
            });

            item.addEventListener('mouseleave', () => {
                cancelIcon.style.opacity = '0';
            });
        });

    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'agenda:', error);
        alert('Si è verificato un errore nel caricamento delle prenotazioni.');
    }
}
