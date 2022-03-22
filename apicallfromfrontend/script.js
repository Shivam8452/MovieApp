const BASE_URL = 'http://localhost:4001/movies';
const API_URL = BASE_URL + '?page=1';
const searchURL = 'http://localhost:4001/moviesfilter'




const main = document.getElementById('main');
const form =  document.getElementById('form');
const search = document.getElementById('search');
const tagsEl = document.getElementById('tags');

const prev = document.getElementById('prev')
const next = document.getElementById('next')
const current = document.getElementById('current')

var currentPage;
var nextPage;
var prevPage;
var lastUrl = '';
var totalPages;



getMovies(API_URL);

function getMovies(url) {
  lastUrl = url;
    fetch(url).then(res => res.json()).then(data => {
        console.log(data)
        if(data.data.length !== 0){
            showMovies(data.data);
            currentPage = data.page;
            nextPage = data.next.page;
            prevPage = data.previous.page;
            totalPages = data.total_pages;

            current.innerText = currentPage;

            if(currentPage <= 1){
              prev.classList.add('disabled');
              next.classList.remove('disabled')
            }else if(currentPage>= totalPages){
              prev.classList.remove('disabled');
              next.classList.add('disabled')
            }else{
              prev.classList.remove('disabled');
              next.classList.remove('disabled')
            }

            
        }else{
            main.innerHTML= `<h1 class="no-results">No Results Found</h1>`
        }
       
    })

}


function showMovies(data) {
    main.innerHTML = '';

    data.forEach(movie => {
        const {title,  genres, description, id} = movie;
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie');
        movieEl.innerHTML = `
             <img src="https://ui-avatars.com/api/?name=${title}" alt="${title}">
            <div class="movie-info">
                <h3>${title}</h3>
                <span>${genres}</span>
            </div>
            <div class="overview">
                <h3>Overview</h3>
                ${description}
                <br/> 
                <button class="know-more" id="${id}">Know More</button>
            </div>
        
        `

        main.appendChild(movieEl);

        document.getElementById(id).addEventListener('click', () => {          
           openNav(movie)
        })
    })
}


const overlayContent = document.getElementById('overlay-content')
let popup = document.querySelector(".overlay-content")
function openNav(movie){
  let id = movie.id
  console.log(id)
  
  let content = `<div class="popcard">
  <div class="image">
  <img src="https://ui-avatars.com/api/?name=${movie.title}" alt="${movie.title}">
  </div>
  <div class="content">
  <h4>${movie.title}</h4>
  <p>${movie.description}</p>
  <p>${movie.genres}</p>
  </div>
  
</div>`
overlayContent.innerHTML = content
popup.style.display = "Block"

}
window.addEventListener("click", closePop);

function closePop(e){
  if(e.target == popup) {
  popup.style.display = "none";
}
}

prev.addEventListener('click', () => {
    pageCall(prevPage);
  
})

next.addEventListener('click', () => {
  
    pageCall(nextPage);
})

function pageCall(page){
  let urlSplit = lastUrl.split('?');
  let queryParams = urlSplit[1].split('&');
  let key = queryParams[queryParams.length -1].split('=');
  if(key[0] != 'page'){
    let url = BASE_URL + '&page='+page
    getMovies(url);
  }else{
    key[1] = page.toString();
    let a = key.join('=');
    queryParams[queryParams.length -1] = a;
    let b = queryParams.join('&');
    let url = urlSplit[0] +'?'+ b
    getMovies(url);
  }

}

let searchInput = document.getElementById("search");
      Rx.Observable.fromEvent(searchInput, 'input')
        .pluck('target', 'value')
        .filter(searchTerm => searchTerm.length > 3)
        .debounceTime(250)
        .distinctUntilChanged()
        .switchMap(searchKey => Rx.Observable.ajax(`http://localhost:4001/moviesfilter?title=${searchKey}`)
          .map(resp => ({
              "status" : resp["status"] == 200,
              "details" : resp["status"] == 200 ? resp["response"] : [],
              "result_hash": Date.now()
            })
          )
        )
        .filter(resp => resp.status !== false)
        .distinctUntilChanged((a, b) => a.result_hash === b.result_hash)
        .subscribe(resp => showMovies(resp.details));