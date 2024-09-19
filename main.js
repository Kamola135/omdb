let changeThemeBtn = document.querySelector(".themeChange");
let body = document.querySelector("body");

if (changeThemeBtn) {
    changeThemeBtn.addEventListener("click", changeTheme);
}

if (localStorage.getItem("theme") === "dark") {
    if (changeThemeBtn) {
        changeThemeBtn.classList.add("darkTheme");
    }
    body.classList.add("dark");
}

function changeTheme() {
    if (localStorage.getItem("theme") === "dark") {
        if (changeThemeBtn) {
            changeThemeBtn.classList.toggle("darkTheme");
        }
        body.classList.toggle("dark");
        localStorage.setItem("theme", "white");
    } else {
        if (changeThemeBtn) {
            changeThemeBtn.classList.toggle("darkTheme");
        }
        body.classList.toggle("dark");
        localStorage.setItem("theme", "dark");
    }
}

let searchBtn = document.querySelector(".search button");

if (searchBtn) {
    searchBtn.addEventListener("click", searchMovie);
}

let loader = document.querySelector('.loader');

document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchMovie();
    }
});

async function searchMovie() {
    loader.style.display = "block";

    let searchText = document.getElementById('dd').value;
    console.log(searchText);

    let response = await sendRequest("http://www.omdbapi.com/", "GET", {
        "apikey": "afaaaac8",
        "t": searchText
    });

    if (response.Response == "False") {
        loader.style.display = "none";
        alert(response.Error);
        console.log(response);
    } else {
        let main = document.querySelector(".main");
        main.style.display = "block";

        let movieTitle = document.querySelector('.movieTitle h2');
        movieTitle.innerHTML = response.Title;

        let movieImg = document.querySelector(".movieImg");
        if (response.Poster !== "N/A") {
            movieImg.style.backgroundImage = `url(${response.Poster})`;
        } else {
            movieImg.style.backgroundImage = '';
        }

        let detailsList = ["Language", "Actors", "Country", "Genre", "Released", "Runtime", "imdbRating"];
        let movieInfo = document.querySelector(".movieInfo");
        movieInfo.innerHTML = "";

        for (let i = 0; i < detailsList.length; i++) {
            let param = detailsList[i];
            let desc = `<div class="desc darckBg">
                <div class="title">${param}</div>
                <div class="value">${response[param]}</div>
            </div>`;
            movieInfo.innerHTML += desc;
        }

        loader.style.display = "none";
        await searchSimilarMovies(response.Title);
    }
}

async function sendRequest(url, method, data) {
    try {
        if (method == "POST") {
            let response = await fetch(url, {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            return await response.json();
        } else if (method == "GET") {
            url = url + "?" + new URLSearchParams(data);
            let response = await fetch(url, {
                method: "GET"
            });

            if (!response.ok) throw new Error("Network response was not ok");

            return await response.json();
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Ошибка запроса к API.");
    }
}

async function searchSimilarMovies(title) {
    let similarMovies = await sendRequest("http://www.omdbapi.com/", "GET", {
        "apikey": "afaaaac8",
        "s": title
    });

    if (similarMovies.Response == "False") {
        document.querySelector(".similarMovieTitle h2").style.display = "none";
        document.querySelector(".similarMovies").style.display = "none";
    } else {
        document.querySelector(".similarMovieTitle h2").innerHTML = `Похожих фильмов: ${similarMovies.totalResults}`;
        showSimilarMovies(similarMovies.Search);
        console.log(similarMovies);
    }
}

function showSimilarMovies(movies) {
    let similarMoviesContainer = document.querySelector(".similarMovies");
    let similarMoviesTitle = document.querySelector(".similarMovieTitle h2");
    similarMoviesContainer.innerHTML = "";

    movies.forEach((movie) => {
        const index = favs.findIndex(obj => obj.imdbID === movie.imdbID);
        let favCheck = index < 0 ? "" : "active";

        similarMoviesContainer.innerHTML += `<div class="similarMovieCard" style="background-image:url(${movie.Poster})">
        <div class="favStar ${favCheck}" data-title="${movie.Title}" data-poster="${movie.Poster}" data-ImdbID="${movie.imdbID}"></div>
        <div class="similarMovieText">${movie.Title}</div>
        </div>`;
    });

    similarMoviesContainer.style.display = "grid";
    similarMoviesTitle.style.display = "block";
    activateFavBtns();
}

function activateFavBtns() {
    document.querySelectorAll(".favStar").forEach(elem => {
        elem.addEventListener("click", addToFav);
    });
}

function addToFav(event) {
    let favBtn = event.target;

    let title = favBtn.getAttribute("data-title");
    let poster = favBtn.getAttribute("data-poster");
    let imdbID = favBtn.getAttribute("data-imdbID");

    const index = favs.findIndex(obj => obj.imdbID === imdbID);
    if (index < 0) {
        let fav = { title, poster, imdbID };
        favs.push(fav);
        localStorage.setItem("favs", JSON.stringify(favs));
        favBtn.classList.add('active');
    } else {
        favs.splice(index, 1);
        localStorage.setItem("favs", JSON.stringify(favs));
        favBtn.classList.remove('active');
    }
}

let favs = localStorage.getItem("favs");

if (!favs) {
    favs = [];
    localStorage.setItem("favs", JSON.stringify(favs));
} else {
    favs = JSON.parse(favs);
}

function showFavs() {
    let similarMoviesContainer = document.querySelector(".similarMovies");
    let similarMoviesTitle = document.querySelector(".similarMovieTitle h2");
    similarMoviesContainer.innerHTML = "";
    similarMoviesTitle.innerHTML = `Фильмы в избранном: ${favs.length}`;

    favs.forEach((movie) => {
        let favCheck = "active";
        similarMoviesContainer.innerHTML += `<div class="similarMovieCard" style="background-image:url(${movie.poster})">
        <div class="favStar ${favCheck}" data-title="${movie.title}" data-poster="${movie.poster}" data-ImdbID="${movie.imdbID}"></div>
        <div class="similarMovieText">${movie.title}</div>
        </div>`;
    });

    similarMoviesContainer.style.display = "grid";
    similarMoviesTitle.style.display = "block";
    activateFavBtns();
}
