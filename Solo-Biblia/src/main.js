let dataLibros;
let firstLoad = true;
const $home = document.querySelector('.home');
const $list = document.querySelector('.list');
const $capList = document.querySelector('.caps__list');
const $btnNext = document.getElementById('nextBtn');
const $btnPrev = document.getElementById('prevBtn');
const $currentCap = document.getElementById('currentCap');
let title = document.querySelector('.title');
let currentBook;
let currentBookKey;
let currentChapter = 0;
let nextChapter;
const $sidebar = document.querySelector('.sidebar-menu');
const $overlay = document.querySelector('.overlay');
const $btnMenu = document.querySelector('.menu-btn');
const bookCap = document.getElementById('bookCap');

const searchBook = (book) => {
  return fetch(`src/assets/biblia/${book}.json`)
    .then(r => r.json())
    .then(data => data)
    .catch(err => err)
}


const randomVerse = async () => {
  const randomBook = Math.floor(Math.random() * 66);
  const bookRaw = dataLibros[randomBook];
  const book = await searchBook(`${bookRaw.key}`);
  const bookCaps = book.length - 1;
  const randomCap = Math.floor(Math.random() * bookCaps);
  const capVerse = book[randomCap].length - 1;
  const randomVerso = book[randomCap][capVerse];
  showRandomVerse({
    name: bookRaw['shortTitle'],
    capNumber: randomCap + 1,
    verseNumber: capVerse + 1,
    verse: randomVerso
  })
}


const showRandomVerse = ({ name, capNumber, verseNumber, verse }) => {
  const verseText = document.querySelector('.verse__text');
  const verseCite = document.querySelector('.verse__cite');

  verseText.textContent = verse;
  verseCite.textContent = `${name} ${capNumber}:${verseNumber}`
}



const hideList = () => {
  $sidebar.classList.add('-translate-x-full');
  $overlay.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
}

const openMenu = () => {
  $sidebar.classList.remove('-translate-x-full');
  $overlay.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');

  const $searchBookInput = document.getElementById('searchBookInput');
  if ($searchBookInput) {
    $searchBookInput.value = '';
    $list.querySelectorAll('.menu-item').forEach(item => item.style.display = '');
    setTimeout(() => $searchBookInput.focus(), 300);
  }
}

window.closeMenu = hideList;

const hideCaps = () => {
  if (firstLoad) $home.remove();
  if ($capList.childElementCount > 0) $capList.innerHTML = "";
}

const scrollElement = () => {
  const $target = document.querySelector('.btn-primary');
  if ($target) {
    const scrollX = $target.getBoundingClientRect().left - $currentCap.getBoundingClientRect().left;
    $currentCap.scrollTo({
      left: scrollX,
      behavior: 'smooth'
    })
  }
}

const showAllCaps = () => {
  const totalCaps = currentBook.length;
  $currentCap.innerHTML = '';
  for (let cap = 1; cap <= totalCaps; cap++) {
    const span = document.createElement('SPAN');
    span.classList.add('btn', 'btn-sm', 'btn-ghost')
    span.textContent = `${cap}`;
    let keyCap = cap - 1;
    span.setAttribute('data-key-cap', keyCap);
    if (cap === currentChapter + 1) {
      span.classList.add('btn-primary');
      span.classList.remove('btn-ghost');
    }
    $currentCap.appendChild(span);
  }
}

const agregateBooks = () => {
  fetch('src/assets/biblia/_index.json')
    .then(r => r.json())
    .then(dataRaw => {
      dataLibros = dataRaw;
      randomVerse()
      const fragment = document.createDocumentFragment();
      let currentTestament = "";

      for (const data of dataRaw) {
        if (data.testament !== currentTestament) {
          currentTestament = data.testament;
          const header = document.createElement('LI');
          // Usamos clases de daisyUI/Tailwind para dar estilo de subtítulo
          header.classList.add('menu-title', 'text-xs', 'font-bold', 'text-base-content/50', 'uppercase', 'tracking-widest', 'mt-4', 'mb-1', 'pl-4');
          header.textContent = currentTestament === "A.T." ? "Antiguo Testamento" : "Nuevo Testamento";
          // Aseguramos que el buscador no lo oculte si no queremos, o podemos ponerle una clase custom
          header.classList.add('testament-header');
          fragment.appendChild(header);
        }

        const li = document.createElement('LI');
        li.classList.add('menu-item');
        li.textContent = data.shortTitle;
        li.setAttribute('data-key', data.key)
        fragment.appendChild(li);
      }

      $list.appendChild(fragment);
    })

}



const watchChapter = (cap) => {
  $currentCap.querySelectorAll('span').forEach(span => {
    span.classList.remove('btn-primary');
    span.classList.add('btn-ghost');
  });

  const $activeSpan = $currentCap.querySelector(`span[data-key-cap="${cap}"]`);
  if ($activeSpan) {
    $activeSpan.classList.remove('btn-ghost');
    $activeSpan.classList.add('btn-primary');
  }

  scrollElement()
  const fragment = document.createDocumentFragment();
  let nVerse = 1;
  const storageKey = `highlight-${currentBookKey}-${cap}`;
  const highlightedVerses = JSON.parse(sessionStorage.getItem(storageKey) || '[]');

  for (const verse of currentBook[cap]) {
    const p = document.createElement('P');
    p.classList.add('text-lg', 'mb-4', 'leading-relaxed', 'font-reading');
    p.innerHTML = `<span class="font-bold text-primary font-sans">${nVerse}.</span> ${verse}`;
    p.setAttribute('data-verse-index', nVerse);
    if (highlightedVerses.includes(nVerse)) {
      p.classList.add('verse-highlighted');
    }
    fragment.appendChild(p);
    nVerse++;
  }
  hideCaps();

  $capList.innerHTML = '';
  $capList.appendChild(fragment);

  // Inyectar controles fuera del contenedor de flex para no romper el layout
  renderDynamicNav(cap);

  // Mostrar el botón de volver a capítulos
  const $btnBackToCaps = document.getElementById('btnBackToCaps');
  if ($btnBackToCaps) $btnBackToCaps.classList.remove('hidden');

  const $btnReturnToReading = document.getElementById('btnReturnToReading');
  if ($btnReturnToReading) $btnReturnToReading.classList.add('hidden');
}

const renderDynamicNav = (cap) => {
  let dynamicNav = document.getElementById('dynamic-nav-container');
  if (!dynamicNav) {
    dynamicNav = document.createElement('div');
    dynamicNav.id = 'dynamic-nav-container';
    dynamicNav.className = 'flex justify-between mt-8 mb-4 border-t border-base-300 pt-4';

    const btnP = document.createElement('button');
    btnP.id = 'dynamic-prev';
    btnP.className = 'btn btn-outline btn-neutral'; // Neutral evita la colisión en document.querySelector('.btn-primary')
    btnP.innerHTML = '&laquo; Anterior';

    const btnN = document.createElement('button');
    btnN.id = 'dynamic-next';
    btnN.className = 'btn bg-white text-primary';
    btnN.innerHTML = 'Siguiente &raquo;';

    dynamicNav.appendChild(btnP);
    dynamicNav.appendChild(btnN);

    const $containerText = document.querySelector('.containerText');
    $containerText.appendChild(dynamicNav);
  }

  const prev = document.getElementById('dynamic-prev');
  const next = document.getElementById('dynamic-next');

  const newPrev = prev.cloneNode(true);
  const newNext = next.cloneNode(true);

  newPrev.disabled = parseInt(cap) === 0;
  newNext.disabled = parseInt(cap) >= currentBook.length - 1;
  if (parseInt(cap) >= currentBook.length - 1) {
    newNext.classList.remove('text-primary');
    newNext.disabled = true;
  } else {
    newNext.disabled = false;
    newNext.classList.add('text-primary');
  }

  newPrev.addEventListener('click', () => {
    if (currentChapter > 0) {
      currentChapter--;
      bookCap.textContent = "Capitulo " + (currentChapter + 1);
      watchChapter(currentChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  newNext.addEventListener('click', () => {
    if (currentChapter < currentBook.length - 1) {
      currentChapter++;
      bookCap.textContent = "Capitulo " + (currentChapter + 1);
      watchChapter(currentChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  dynamicNav.replaceChild(newPrev, prev);
  dynamicNav.replaceChild(newNext, next);
}

const showBookCaps = (book) => {
  const totalCaps = book.length;
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < totalCaps; i++) {
    const li = document.createElement('LI');
    li.classList.add("btn", "btn-square", "p-[25px]");
    li.setAttribute('data-key-cap', i);
    li.textContent = i + 1;
    fragment.appendChild(li);
  }
  $capList.appendChild(fragment);
}

const listenClickCaps = (event, element) => {
  const target = event.target;
  const closestElement = target.closest(element);
  if (closestElement) {
    const cap = closestElement.getAttribute('data-key-cap');
    currentChapter = parseInt(cap);
    watchChapter(cap);
  }
}



const readBooks = async (book) => {
  currentBookKey = book;
  const bookForRead = await searchBook(book);
  currentBook = bookForRead;
  showBookCaps(bookForRead);
  const nav = document.getElementById('dynamic-nav-container');
  if (nav) nav.remove();

  const $btnReturnToReading = document.getElementById('btnReturnToReading');
  if ($btnReturnToReading) $btnReturnToReading.classList.add('hidden');
}

agregateBooks();

const resetBookCap = () => {
  bookCap.textContent = "";
  const $btnBackToCaps = document.getElementById('btnBackToCaps');
  if ($btnBackToCaps) $btnBackToCaps.classList.add('hidden');
}

const $btnBackToCaps = document.getElementById('btnBackToCaps');
const $btnReturnToReading = document.getElementById('btnReturnToReading');

if ($btnBackToCaps) {
  $btnBackToCaps.addEventListener('click', () => {
    if (currentBook) {
      $capList.innerHTML = '';
      showBookCaps(currentBook);
      $currentCap.innerHTML = '';

      const nav = document.getElementById('dynamic-nav-container');
      if (nav) nav.remove();

      resetBookCap();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if ($btnReturnToReading) $btnReturnToReading.classList.remove('hidden');
    }
  });
}

if ($btnReturnToReading) {
  $btnReturnToReading.addEventListener('click', () => {
    if (currentBook && currentChapter !== undefined) {
      bookCap.textContent = "Capitulo " + (currentChapter + 1);
      watchChapter(currentChapter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });
}

$list.addEventListener('click', async (e) => {
  const target = e.target;
  if (target.matches('.menu-item') || target.matches('.menu-item > *')) {
    const keyBook = target.getAttribute('data-key');
    title.textContent = target.textContent;
    resetBookCap();
    hideList();
    hideCaps();
    $currentCap.innerHTML = '';
    readBooks(keyBook);
    return;
  }
})

$capList.addEventListener('click', e => {
  const target = e.target;
  const pElement = target.closest('p');
  
  // Si se hizo clic en un versículo (párrafo)
  if (pElement && $capList.contains(pElement)) {
    pElement.classList.toggle('verse-highlighted');

    const verseIndex = parseInt(pElement.getAttribute('data-verse-index'));
    const storageKey = `highlight-${currentBookKey}-${currentChapter}`;
    let highlightedVerses = JSON.parse(sessionStorage.getItem(storageKey) || '[]');

    if (pElement.classList.contains('verse-highlighted')) {
      if (!highlightedVerses.includes(verseIndex)) {
        highlightedVerses.push(verseIndex);
      }
    } else {
      highlightedVerses = highlightedVerses.filter(v => v !== verseIndex);
    }
    sessionStorage.setItem(storageKey, JSON.stringify(highlightedVerses));

    // Para no seguir y desencadenar clics de capítulos
    return;
  }

  listenClickCaps(e, 'li');
  bookCap.textContent = "Capitulo " + (currentChapter + 1);
})

$btnMenu.addEventListener('click', () => {
  openMenu();
})

$currentCap.addEventListener('click', (e) => {
  const target = e.target;
  const closestElement = target.closest('span');
  if (closestElement) {
    const cap = closestElement.getAttribute('data-key-cap');
    currentChapter = parseInt(cap);
    watchChapter(cap);
  }
})

const removeAccents = (str) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const $searchBookInput = document.getElementById('searchBookInput');
if ($searchBookInput) {
  $searchBookInput.addEventListener('input', (e) => {
    const searchTerm = removeAccents(e.target.value.toLowerCase());
    const items = $list.querySelectorAll('.menu-item');
    items.forEach(item => {
      const itemName = removeAccents(item.textContent.toLowerCase());
      if (itemName.includes(searchTerm)) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  });
}