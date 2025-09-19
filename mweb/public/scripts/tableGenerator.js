document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('tableForm');
    const tableContainer = document.getElementById('tableContainer');

    loadSavedConfig();

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const config = {
            includeAuthor: event.target.authorColumn.checked,
            includeYear: event.target.yearColumn.checked,
            includeRating: event.target.ratingColumn.checked,
            rowsCount: event.target.rows.value
        };

        saveConfig(config);
        generateTable(config);

        resetForm(event);
    });

    function generateTable(config) {
        tableContainer.innerHTML = '';

        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');

        const headerRow = document.createElement('tr');
        const quoteHeader = document.createElement('th');
        quoteHeader.textContent = 'Цитата';
        headerRow.appendChild(quoteHeader);

        if (config.includeAuthor) {
            const authorHeader = document.createElement('th');
            authorHeader.textContent = 'Автор';
            headerRow.appendChild(authorHeader);
        }
        if (config.includeYear) {
            const yearHeader = document.createElement('th');
            yearHeader.textContent = 'Год';
            headerRow.appendChild(yearHeader);
        }
        if (config.includeRating) {
            const ratingHeader = document.createElement('th');
            ratingHeader.textContent = 'Оценка';
            headerRow.appendChild(ratingHeader);
        }
        thead.appendChild(headerRow);
        table.appendChild(thead);

        for (let i = 0; i < config.rowsCount; i++) {
            const row = document.createElement('tr');
            const quoteCell = document.createElement('td');
            quoteCell.textContent = `Цитата ${i + 1}`;
            row.appendChild(quoteCell);

            if (config.includeAuthor) {
                const authorCell = document.createElement('td');
                authorCell.textContent = `Автор ${i + 1}`;
                row.appendChild(authorCell);
            }
            if (config.includeYear) {
                const yearCell = document.createElement('td');
                yearCell.textContent = `1984`;
                row.appendChild(yearCell);
            }
            if (config.includeRating) {
                const ratingCell = document.createElement('td');
                ratingCell.textContent = `/10`;
                row.appendChild(ratingCell);
            }
            tbody.appendChild(row);
        }
        table.appendChild(tbody);
        tableContainer.appendChild(table);
    }

    function saveConfig(config) {
        localStorage.setItem('tableConfig', JSON.stringify(config));
    }

    function loadSavedConfig() {
        const savedConfig = localStorage.getItem('tableConfig');
        let config = {
            includeAuthor: false,
            includeYear: false,
            includeRating: false,
            rowsCount: 10
        };

        if (savedConfig) {
            config = JSON.parse(savedConfig);
            generateTable(config);
        }

        saveConfig(config);
    }

    function resetForm(event) {
        event.target.authorColumn.checked = false;
        event.target.yearColumn.checked = false;
        event.target.ratingColumn.checked = false;
        event.target.rows.value = '';
    }
});