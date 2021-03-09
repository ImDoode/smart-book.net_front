
/** Логика работы фильтров */
let sortBy = 'popular';
let searchQuery = '';
let filters = {
    flag: [],
}
let lang = '';

const $lastBooks = document.querySelector('.js-last-books-container');
const $allBooksTitle = document.querySelector('.js-all-books-title');
const $resetFilterButton = document.querySelector('.js-reset-filters');
const $resetAuthorButton = document.querySelector('.js-reset-authors');
const $resetAuthorsContainer = document.querySelector('.js-autor-filtered-container');
const $authorsFiltered = document.querySelector('.js-autor-filtered');
const $emptyMessage = document.querySelector('.js-empty-result');
const $sortButtonTitle = document.querySelector('.js-sort-button-title');

/** Сохранение параметров фильтров в УРЛ */
setFiltersToUrl = () => {
    const urlData = [];
    if (isAnyActiveFilters())
        urlData.push('filters='+JSON.stringify(filters));
    if (searchQuery)
        urlData.push('search='+searchQuery);
    if (sortBy)
        urlData.push('sort='+sortBy);
    if (lang)
        urlData.push('lang='+lang);
    const refresh = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlData.join('&');    
    window.history.pushState({ path: refresh }, '', refresh);
}

/** Загрузка параметров фильтров из УРЛ */
getFiltersFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);

    searchQuery = urlParams.get('search') || '';
    document.querySelector('.js-search').value = searchQuery;

    sortBy = urlParams.get('sort') || sortBy;
    document.querySelectorAll('.js-sort').forEach(item => {
        item.checked = sortBy === item.value;
    });
    lang = urlParams.get('lang');

    filters = JSON.parse(urlParams.get('filters')) || filters;
    for (let type in filters) {
        document.querySelectorAll(`.js-filter[data-type="${type}"]`).forEach(item => {
            item.classList.toggle('filter__item--active', filters[type].includes(item.dataset.value));
        })
    }
    
    $resetFilterButton.classList.toggle('hidden', !isAnyActiveFilters());
}

getBookChunk = (book) => {
    return `
    <a class="links__item" href="${book.link}">
        <img class="links__icon" src="static/icons/flags/${book.flag}.svg" alt="${book.flag}">
        <span class="links__name">${book.book_name}</span>
        ${book.growth > 0 ? `
        <span class="links__growth links__growth--${book.growthIcon}">${book.growth}</span>
        ` : ``}
    </a>
    `;
}

getAuthorChunk = (author) => {
    return `
    <a
        class="links__item js-filter js-author"
        href="#"
        data-value="${author.id}"
        data-type="author_id"
    >
        <span class="links__name">${author.name}</span>
    </a>
    `;
}

getBooksSortedByDate = (books) => {
    return books.sort(function(a,b){
        return new Date(b.publication_date) - new Date(a.publication_date);
    });
}

getBooksSortedByName = (books) => {
    return books.sort(function(a,b){
        if(a.book_name < b.book_name) { return -1; }
        if(a.book_name > b.book_name) { return 1; }
        return 0;
    });
}

getBooksSortedByDownloads = (books) => {
    return books.sort(function(a,b){
        return +b.downloads - +a.downloads;
    });
}

getBooksSortedBySize = (books) => {
    return books.sort(function(a,b){
        return b.size - a.size;
    });
}

getSortedBooks = (books, sortBy) => {
    switch (sortBy) {
        case 'publication_date': return getBooksSortedByDate(books)
        case 'name': return getBooksSortedByName(books)
        case 'popular': return getBooksSortedByDownloads(books)
        case 'size': return getBooksSortedBySize(books)
        default: return getBooksSortedByDownloads(books)
    }
} 

getFilteredBooks = (books, filterType, filterValues) => {
    return books.filter((book) => filterValues.map(item => item.toString()).includes((typeof book[filterType] !== 'undefined') && book[filterType].toString()) )
}

updateBookList = (selector, books) => {
    document.querySelector(selector).innerHTML = books.map(book => getBookChunk(book)).join(' ');
}

updateAuthorList = (selector, authors) => {
    document.querySelector(selector).innerHTML = authors.map(author => getAuthorChunk(author)).join(' ');
}

/** Главная функция по отрисовке основного списка книг с учётом всех фильтров, сортировки и поиска */
setAllFiltersAndRenderBooks = () => {
    setFiltersToUrl();
    // Фильтруем по поисковому запросу
    let processedBooks = data.books.filter(item => item.book_name.toLowerCase().indexOf(searchQuery.toLowerCase().trim()) > -1);
    // Фильтруем по фильтрам
    for (let type in filters) {
        if (!!filters[type].length)
            processedBooks = getFilteredBooks(processedBooks, type, filters[type]);
    }
    // Сортируем
    processedBooks = getSortedBooks(processedBooks, sortBy);
    // Обновляем
    updateBookList('.js-all-books', processedBooks);
    $allBooksTitle.textContent = searchQuery ? `Поиск (${sortTitles[sortBy].pageTitle.toLowerCase()})` : sortTitles[sortBy].pageTitle;
    $sortButtonTitle.textContent = sortTitles[sortBy].buttonLabel;
    $lastBooks.classList.toggle('hidden', (processedBooks.length < data.books.length) || sortBy !== 'popular');
    $emptyMessage.classList.toggle('hidden', processedBooks.length > 0);
    document.querySelector('[data-toggle-id="js-filter-buttons"]').classList.toggle('active', isAnyActiveFilters());
    document.querySelector('[data-toggle-id="js-modal-filter"]').classList.toggle('active', isAnyActiveFilters());
    isAnyActiveFilters() && document.getElementById('js-filter-buttons').classList.remove('hidden');
};


searchHandle = () => {
    searchQuery = document.querySelector('.js-search').value;
    setAllFiltersAndRenderBooks();
}


/** Логика работы поиска */
document.querySelector('.js-search').addEventListener('search', searchHandle);
document.querySelector('.js-search').addEventListener('keyup', searchHandle);



/** Логика работы сортировки */
document.querySelectorAll('.js-sort').forEach(item => {
    item.addEventListener('click', () => {
        if (!item.checked) return;
        sortBy = item.value;
        document.getElementById('js-sort-list').classList.toggle('hidden');
        setAllFiltersAndRenderBooks();
    })
});

/** Логика добавления-удаления фильтров */
addFilterListener = (container) => {
    container.querySelectorAll('.js-filter').forEach(item => {
        item.addEventListener('click', () => {
            const removeItemFromArray = (arr, value) => {
                let i = 0;
                while (i < arr.length) {
                    if (arr[i] === value) {
                        arr.splice(i, 1);
                    } else {
                        ++i;
                    }
                }
                return arr;
            }
            item.classList.toggle('filter__item--active');
            if (!filters[item.dataset.type]) {
                filters[item.dataset.type] = [];
            }
            if (item.classList.contains('filter__item--active')) {
                filters[item.dataset.type].push(item.dataset.value);
            } else {
                removeItemFromArray(filters[item.dataset.type], item.dataset.value);
            }
            setAllFiltersAndRenderBooks();
            $resetFilterButton.classList.toggle('hidden', !isAnyActiveFilters());
            if (filters['author_id'] && filters['author_id'].length > 0) {
                $resetAuthorsContainer.classList.remove('hidden');
                $authorsFiltered.innerHTML = filters['author_id'].map(authorId => `<p>${data.authors.find((author) => author.id == authorId).name}</p>`).join(' ');
            } else {
                $resetAuthorsContainer.classList.add('hidden');
            }
            //debugger;
        })
    });
};
addFilterListener(document);


isAnyActiveFilters = () => {
    let activeFilters = 0;
    for (let type in filters) {
        activeFilters += filters[type].length;
    }
    return !!activeFilters;
}

/** Логика работы кнопки сброса фильтров */
$resetFilterButton.addEventListener('click', () => {
    for (let type in filters) {
        filters[type] = [];
    }
    document.querySelectorAll('.js-filter').forEach(item => {
        item.classList.remove('filter__item--active');
    });
    
    $resetFilterButton.classList.toggle('hidden', !isAnyActiveFilters());
    setAllFiltersAndRenderBooks();
});

$resetAuthorButton.addEventListener('click', () => {
    filters['author_id'] = [];
    $resetAuthorsContainer.classList.add('hidden');
    $resetFilterButton.classList.toggle('hidden', !isAnyActiveFilters());
    setAllFiltersAndRenderBooks();
});

// Инициализируем дефолтное отображение книг
updateBookList('.js-last-books', getFilteredBooks(data.books, 'new', [true]));
updateAuthorList('.js-authors', data.authors);
addFilterListener(document.querySelector('.js-authors'));
document.querySelectorAll('.js-author').forEach(item => {
    item.addEventListener('click', () => {
        changePage('#books-page');
    })
});
getFiltersFromUrl();
setAllFiltersAndRenderBooks();

