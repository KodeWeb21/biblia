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
const $overlayMenu = document.querySelector('.appContainer__left');
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
    $list.classList.add('list-hidden');
    $overlayMenu.classList.remove('overlay-active');
}

const hideCapsBook = () =>{
    $currentCap.textContent = "";
}

const hideCaps = () =>{
    if(firstLoad) $home.remove();
    if($capList.childElementCount > 0) $capList.innerHTML = "";
}

const scrollElement = () =>{
    const $target = document.querySelector('.select-cap');
    const scrollX = $target.getBoundingClientRect().left - $currentCap.getBoundingClientRect().left;
    $currentCap.scrollTo({
        left: scrollX,
        behavior: 'smooth'
    })
}

const selectNewCap = () =>{
    $elSelected = [...$currentCap.children].filter(el=>el.classList.contains('select-cap'))[0].classList.remove('select-cap')
}

const showAllCaps = () =>{
    const totalCaps = currentBook.length;
    const fragment = document.createDocumentFragment();
    for(let cap = 1; cap <= totalCaps; cap++){
        const span = document.createElement('SPAN');
        span.classList.add('itemsNav')
        span.textContent = `capitulo ${cap}`;
        let keyCap = cap - 1;
        span.setAttribute('data-key-cap', keyCap);
        if(cap === currentChapter+1){
            span.classList.add('select-cap');
            console.log(span.getBoundingClientRect().left);
        }
        hideCapsBook();
        fragment.appendChild(span);
    }
    $currentCap.appendChild(fragment)
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
            li.textContent = data.shortTitle;
            li.setAttribute('data-key',data.key)
            fragment.appendChild(li);
        }
    
        $list.appendChild(fragment);
    })
    
}



const watchChapter = (cap) =>{
    // $currentCap.textContent = "Capitulo "+ parseInt(currentChapter + 1)
    showAllCaps()
    scrollElement()
    const fragment = document.createDocumentFragment();
    let nVerse = 1;
    for(const verse of currentBook[cap]){
        const p = document.createElement('P');
        p.classList.add('text');
        p.innerHTML = `<span class="bold">${nVerse}.</span> ${verse}`;
        fragment.appendChild(p);
        nVerse++;
    }
    hideCaps();
    
    $capList.appendChild(fragment);
}

const showBookCaps = (book) =>{
    const totalCaps = book.length;
    const fragment = document.createDocumentFragment();
    for(let i = 0; i < totalCaps; i++){
        const li = document.createElement('LI');
        li.classList.add("caps__items");
        li.setAttribute('data-key-cap',i);
        li.textContent  = i + 1;
        fragment.append(li);
    }
    $capList.appendChild(fragment);
}

const listenClickCaps = (event,element) => {
    // const target = e.target;
    // if(target.matches('li')||target.matches('li>*')){
    //     const cap = target.getAttribute('data-key-cap');
    //     currentChapter = parseInt(cap);
    //     watchChapter(cap);
    // }

    const target = event.target;
    if(target.matches(`${element}`)||target.matches(`${element}>*`)){
        const cap = target.getAttribute('data-key-cap');
        currentChapter = parseInt(cap);
        watchChapter(cap);
    }
}

$overlayMenu.addEventListener('click',e=>{
    hideList();
})

const readBooks = async (book)  =>{
     const bookForRead = await searchBook(book);
     currentBook = bookForRead;
     showBookCaps(bookForRead)
}

agregateBooks();

$list.addEventListener('click',async (e)=>{
    const target = e.target;
    hideList();
    if(target.matches('li') || target.matches('li > *')){
        hideCapsBook();
        const keyBook = target.getAttribute('data-key');
        title.textContent = target.textContent;
        hideList();
        hideCaps();
        readBooks(keyBook);
        return;
    }
    console.log(target)
   

})

$capList.addEventListener('click',e=>{
    listenClickCaps(e,'li');
})


$btnMenu.addEventListener('click',()=>{
    $list.classList.toggle('list-hidden');
    $overlayMenu.classList.toggle('overlay-active');
})

$currentCap.addEventListener('click',(e)=>{
    listenClickCaps(e,'span');
    scrollElement();
})