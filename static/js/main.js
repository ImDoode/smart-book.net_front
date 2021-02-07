/** Корректное отображение css анимации */
document.body.classList.remove('js-stop-transition');

/** Тогглер для переключения отображения скрытых элементов по айди */
document.querySelectorAll('.js-id-toggler').forEach(item => {
    item.addEventListener('click', event => {
        item.classList.toggle('toggled');
        document.getElementById(item.dataset.toggleId).classList.toggle('hidden');
    })
});

/** Тогглер для переключения отображения скрытых элементов в контейнере */
document.querySelectorAll('.js-toggle').forEach(item => {
    item.querySelector('.js-toggle-button').addEventListener('click', event => {
        item.classList.toggle('active');
        item.querySelector('.js-toggle-content').classList.toggle('hidden');
    })
    if(!item.classList.contains('active'))
        item.querySelector('.js-toggle-content').classList.add('hidden');
});


/** Функция для скрытия элементов при клике рядом с ними */
function hideOnClickOutside(element) {
    const outsideClickListener = event => {
        const deltaX = event.offsetX - lastMouseDownX
        const deltaY = event.offsetY - lastMouseDownY
        const distSq = (deltaX * deltaX) + (deltaY * deltaY)
        const isDrag = distSq > 3
        const isDragException = isDrag && !lastMouseDownWasOutside

        if (!element.contains(event.target) && isVisible(element) && !isDragException && !element.classList.contains('hidden') && !(event.currentTarget && event.currentTarget.classList.contains('js-id-toggler'))) { // or use: event.target.closest(selector) === null
            element.classList.add('hidden');
        }
    }
    let lastMouseDownX = 0;
    let lastMouseDownY = 0;
    let lastMouseDownWasOutside = false;

    const mouseDownListener = (event) => {
        lastMouseDownX = event.offsetX
        lastMouseDownY = event.offsetY
        lastMouseDownWasOutside = !element.contains(event.target) && !event.target.classList.contains('js-id-toggler');
    }
    document.addEventListener('mousedown', mouseDownListener);

    const removeClickListener = () => {
        document.removeEventListener('click', outsideClickListener)
    }

    document.addEventListener('click', outsideClickListener)
}

const isVisible = elem => !!elem && !!( elem.offsetWidth || elem.offsetHeight || elem.getClientRects().length ) // source (2018-03-11): https://github.com/jquery/jquery/blob/master/src/css/hiddenVisibleSelectors.js

/** Тогглер для переключения отображения скрытых элементов */
document.querySelectorAll('.js-hide-click-outside').forEach(item => {
    setTimeout(() => { hideOnClickOutside(item); }, 0);
});



/** Переключение страниц */
document.querySelectorAll('.js-change-tab').forEach(item => {
    item.addEventListener('click', event => {
        document.querySelectorAll('.js-change-tab').forEach(item => {
            item.classList.remove('nav__item--active');
        });
        item.classList.add('nav__item--active');
        changePage(item.dataset.tabSelector);
    })
});

changePage = (selector) => {
    document.querySelectorAll('.js-tab').forEach(item => {
        item.classList.add('hidden');
    });
    document.querySelector(selector).classList.remove('hidden');
}