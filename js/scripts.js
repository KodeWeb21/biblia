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
let currentChapter = 0;
let nextChapter; 
const $sidebar = document.querySelector('.sidebar-menu');
const $overlay = document.querySelector('.overlay');
const $btnMenu = document.querySelector('.menu-btn');

const searchBook = (book) =>{
    return fetch(`/biblia/${book}.json`)
    .then(r=>r.json())
    .then(data=>data)
    .catch(err=>err)
}


const randomVerse = async () =>{
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


const showRandomVerse = ({name, capNumber, verseNumber, verse}) =>{
    const verseText = document.querySelector('.verse__text');
    const verseCite = document.querySelector('.verse__cite');

    verseText.textContent = verse;
    verseCite.textContent = `${name} ${capNumber}:${verseNumber}`
}



const hideList = () =>{
    $sidebar.classList.add('-translate-x-full');
    $overlay.classList.add('hidden');
}

const openMenu = () =>{
    $sidebar.classList.remove('-translate-x-full');
    $overlay.classList.remove('hidden');
}

window.closeMenu = hideList;

const hideCaps = () =>{
    if(firstLoad) $home.remove();
    if($capList.childElementCount > 0) $capList.innerHTML = "";
}

const scrollElement = () =>{
    const $target = document.querySelector('.btn-primary');
    if($target){
        const scrollX = $target.getBoundingClientRect().left - $currentCap.getBoundingClientRect().left;
        $currentCap.scrollTo({
            left: scrollX,
            behavior: 'smooth'
        })
    }
}

const showAllCaps = () =>{
    const totalCaps = currentBook.length;
    $currentCap.innerHTML = '';
    for(let cap = 1; cap <= totalCaps; cap++){
        const span = document.createElement('SPAN');
        span.classList.add('btn', 'btn-sm', 'btn-ghost')
        span.textContent = `${cap}`;
        let keyCap = cap - 1;
        span.setAttribute('data-key-cap', keyCap);
        if(cap === currentChapter+1){
            span.classList.add('btn-primary');
            span.classList.remove('btn-ghost');
        }
        $currentCap.appendChild(span);
    }
}

const agregateBooks = () =>{
    fetch('/biblia/_index.json')
    .then(r=>r.json())
    .then(dataRaw=>{
        dataLibros = dataRaw;
        randomVerse()
        const fragment = document.createDocumentFragment();
        for(const data of dataRaw ){
            const li = document.createElement('LI');
            li.classList.add('menu-item');
            li.textContent = data.shortTitle;
            li.setAttribute('data-key',data.key)
            fragment.appendChild(li);
        }
    
        $list.appendChild(fragment);
    })
    
}



const watchChapter = (cap) =>{
    $currentCap.querySelectorAll('span').forEach(span => {
        span.classList.remove('btn-primary');
        span.classList.add('btn-ghost');
    });
    
    const $activeSpan = $currentCap.querySelector(`span[data-key-cap="${cap}"]`);
    if($activeSpan){
        $activeSpan.classList.remove('btn-ghost');
        $activeSpan.classList.add('btn-primary');
    }
    
    scrollElement()
    const fragment = document.createDocumentFragment();
    let nVerse = 1;
    for(const verse of currentBook[cap]){
        const p = document.createElement('P');
        p.classList.add('text-lg', 'mb-4', 'leading-relaxed');
        p.innerHTML = `<span class="font-bold text-primary">${nVerse}.</span> ${verse}`;
        fragment.appendChild(p);
        nVerse++;
    }
    hideCaps();
    
    $capList.innerHTML = '';
    $capList.appendChild(fragment);
}

const showBookCaps = (book) =>{
    const totalCaps = book.length;
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < totalCaps; i++){
        const li = document.createElement('LI');
        li.classList.add("btn", "btn-outline", "btn-square");
        li.setAttribute('data-key-cap',i);
        li.textContent  = i + 1;
        fragment.appendChild(li);
    }
    $capList.appendChild(fragment);
}

const listenClickCaps = (event,element) => {
    const target = event.target;
    const closestElement = target.closest(element);
    if(closestElement){
        const cap = closestElement.getAttribute('data-key-cap');
        currentChapter = parseInt(cap);
        watchChapter(cap);
    }
}



const readBooks = async (book)  =>{
     const bookForRead = await searchBook(book);
     currentBook = bookForRead;
     showBookCaps(bookForRead)
}

agregateBooks();

$list.addEventListener('click',async (e)=>{
    const target = e.target;
    if(target.matches('.menu-item') || target.matches('.menu-item > *')){
        const keyBook = target.getAttribute('data-key');
        title.textContent = target.textContent;
        hideList();
        hideCaps();
        $currentCap.innerHTML = '';
        readBooks(keyBook);
        return;
    }
})

$capList.addEventListener('click',e=>{
    listenClickCaps(e,'li');
})

$btnMenu.addEventListener('click',()=>{
    openMenu();
})

$currentCap.addEventListener('click',(e)=>{
    const target = e.target;
    const closestElement = target.closest('span');
    if(closestElement){
        const cap = closestElement.getAttribute('data-key-cap');
        currentChapter = parseInt(cap);
        watchChapter(cap);
    }
})