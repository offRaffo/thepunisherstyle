async function updateAgenda() {
    try {
        // Prima inviamo la richiesta per ottenere gli orari personalizzati
        const pc_address = 'https://barber-shop-iz21.onrender.com';
        const startDate = document.getElementById('start_close_day');
        const endDate = document.getElementById('end_close_day');
        let isListenerAdded = false;
        const modifyhourbutn = document.getElementById('modify_book_time')
        const modify_date = document.getElementById('modify_date')
        async function send_time(start_book, end_book, day) {
            const timeResponse = await fetch(pc_address + `/booking-time?start_book=${start_book}&end_book=${end_book}&day=${day}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            alert("orari modificati");
        }


        modify_date.addEventListener('click', function () {
            modify_date.classList.add('clicked');
            setTimeout(() => {
                modify_date.classList.remove('clicked');
            }, 200); // Rimuove la classe dopo l'animazione
            const startDate = document.getElementById('start_close_day').value; // Prendi il valore
            const endDate = document.getElementById('end_close_day').value; // Prendi il valore

            // Verifica se entrambe le date sono state selezionate
            if (startDate && endDate) {
                const requestData = {
                    start_date: startDate,
                    end_date: endDate
                };

                // Invia i dati al server
                fetch(pc_address + '/stop_days', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestData)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log('Risposta dal server:', data);
                    })
                    .catch(error => {
                        console.error('Errore durante la richiesta:', error);
                        alert('Errore durante l\'invio delle date.');
                    });
            } else {
                alert("compà l'hai e selezionari tutti i dui");
            }
        });

        modifyhourbutn.addEventListener('click', function () {
            modifyhourbutn.classList.add('clicked');
            setTimeout(() => {
                modifyhourbutn.classList.remove('clicked');
            }, 200); // Rimuove la classe dopo l'animazione
            const startBook = document.getElementById('start_book').value;
            const endBook = document.getElementById('end_book').value;
            const day = document.getElementById('calendar-hour-modifier').value;

            if (startBook && endBook) {
                send_time(startBook, endBook, day);
            } else {
                console.log('Inserisci entrambi gli orari.');
            }
        });

        const response = await fetch(pc_address + '/reservations');
        if (!response.ok) {
            throw new Error(`Errore nella chiamata al server: ${response.status}`);
        }

        const reservations = await response.json();
        const agendaContainer = document.querySelector('#agenda');
        if (!agendaContainer) {
            console.error('Elemento #agenda non trovato.');
            return;
        }

        agendaContainer.innerHTML = '';
        reservations.sort((a, b) => new Date(a.date) - new Date(b.date));

        let currentMonth = null;
        let monthList = null;

        reservations.forEach(reservation => {
            const { date, slot, name, id } = reservation;
            const dateObject = new Date(date);
            const monthName = dateObject.toLocaleString('default', { month: 'long', year: 'numeric' });

            if (monthName !== currentMonth) {
                currentMonth = monthName;

                const monthContainer = document.createElement('div');
                monthContainer.classList.add('month-container');

                const monthTitle = document.createElement('h2');
                monthTitle.textContent = currentMonth;
                monthContainer.appendChild(monthTitle);

                monthList = document.createElement('ul');
                monthList.classList.add('month-list');
                monthContainer.appendChild(monthList);

                agendaContainer.appendChild(monthContainer);
            }

            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', id);
            listItem.innerHTML = `
                <time datetime="${date}">${dateObject.getDate()}</time>
                ${slot} - ${name}
            `;

            monthList.appendChild(listItem);
        });

        const agendaItems = agendaContainer.querySelectorAll('li');
        agendaItems.forEach((listItem) => {
            const cancelBookIcon = document.createElement('img');
            cancelBookIcon.src = 'icons8-cancel.svg';
            cancelBookIcon.width = 16;
            cancelBookIcon.height = 16;
            cancelBookIcon.alt = 'Cancel Icon';
            cancelBookIcon.id = 'cancel-book-icon';

            listItem.appendChild(cancelBookIcon);

            cancelBookIcon.addEventListener('click', async function () {
                const id = listItem.getAttribute('data-id');
                if (!id) {
                    console.error('ID della prenotazione mancante.');
                    return;
                }

                try {
                    const deleteResponse = await fetch(pc_address + `/reservations/${id}`, {
                        method: 'DELETE',
                    });

                    if (!deleteResponse.ok) {
                        throw new Error(`Errore nella rimozione della prenotazione: ${deleteResponse.status}`);
                    }

                    const result = await deleteResponse.json();
                    console.log('Risposta del server:', result);

                    listItem.remove();
                    alert('Prenotazione rimossa con successo.');
                } catch (error) {
                    console.error('Errore durante la rimozione della prenotazione:', error);
                    alert('Impossibile rimuovere la prenotazione. Riprova.');
                }
            });

            listItem.addEventListener('mouseenter', () => {
                cancelBookIcon.style.opacity = '1';
            });

            listItem.addEventListener('mouseleave', () => {
                cancelBookIcon.style.opacity = '0';
            });
        });
    } catch (error) {
        console.error('Errore durante l\'aggiornamento dell\'agenda:', error);
    }
}

// Carica l'agenda una sola volta al caricamento della pagina
document.addEventListener('DOMContentLoaded', function () {
    updateAgenda();
});
