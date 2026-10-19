
const API_URL = "https://ghibliapi.dev/films";

// Elementos de la página
const movieList = document.getElementById("movie-list");
const movieCount = document.getElementById("movie-count");
const statusMessage = document.getElementById("status-message");
const searchInput = document.getElementById("search-input");
const directorFilter = document.getElementById("director-filter");
const emptyState = document.getElementById("empty-state");
const errorState = document.getElementById("error-state");
const retryButton = document.getElementById("retry-button");

const movieDialog = document.getElementById("movie-dialog");
const closeDialogButton = document.getElementById("close-dialog");

// Datos recibidos de la API
let movies = [];

// Obtener las películas de Studio Ghibli
async function loadMovies() {
    movieList.replaceChildren();
    emptyState.hidden = true;
    errorState.hidden = true;

    statusMessage.hidden = false;
    statusMessage.textContent = "Cargando películas desde la API...";
    movieCount.textContent = "Cargando...";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("No se pudieron obtener las películas.");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("La respuesta de la API no tiene el formato esperado.");
        }

        movies = data;

        populateDirectors();
        renderMovies(movies);

        statusMessage.textContent =
            "Explora las películas y descubre sus historias.";
    } catch (error) {
        console.error("Error al consultar la API:", error);

        movies = [];
        movieCount.textContent = "Sin datos";
        statusMessage.hidden = true;
        errorState.hidden = false;
    }
}

// Crear las opciones del filtro de directores
function populateDirectors() {
    const selectedDirector = directorFilter.value;

    directorFilter.replaceChildren();

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Todos los directores";
    directorFilter.appendChild(defaultOption);

    const directors = [...new Set(
        movies.map(movie => movie.director).filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));

    directors.forEach(director => {
        const option = document.createElement("option");
        option.value = director;
        option.textContent = director;
        directorFilter.appendChild(option);
    });

    // Conservar la selección si todavía existe
    if (directors.includes(selectedDirector)) {
        directorFilter.value = selectedDirector;
    }
}

// Mostrar las tarjetas de las películas
function renderMovies(list) {
    movieList.replaceChildren();

    movieCount.textContent =
        `${list.length} ${list.length === 1 ? "película" : "películas"}`;

    emptyState.hidden = list.length !== 0;

    list.forEach(movie => {
        const card = document.createElement("article");
        card.className = "movie-card";

        // Área de la imagen
        const poster = document.createElement("div");
        poster.className = "poster";

        if (movie.image) {
            const image = document.createElement("img");
            image.src = movie.image;
            image.alt = `Imagen de ${movie.title || "la película"}`;
            image.loading = "lazy";

            image.addEventListener("error", () => {
                const fallback = document.createElement("span");
                fallback.textContent = "✿";
                fallback.setAttribute("aria-label", "Imagen no disponible");
                poster.replaceChildren(fallback);
            }, { once: true });

            poster.appendChild(image);
        } else {
            const fallback = document.createElement("span");
            fallback.textContent = "✿";
            fallback.setAttribute("aria-label", "Imagen no disponible");
            poster.appendChild(fallback);
        }

        // Información de la película
        const info = document.createElement("div");
        info.className = "movie-info";

        const year = document.createElement("p");
        year.className = "movie-year";
        year.textContent = movie.release_date
            ? `ESTRENO · ${movie.release_date}`
            : "Año no disponible";

        const title = document.createElement("h3");
        title.textContent = movie.title || "Título no disponible";

        const director = document.createElement("p");
        director.className = "movie-director";
        director.textContent = `Director: ${movie.director || "No disponible"}`;

        const description = document.createElement("p");
        description.className = "movie-description";
        description.textContent =
            movie.description || "No hay una sinopsis disponible.";

        const detailsButton = document.createElement("button");
        detailsButton.className = "details-button";
        detailsButton.type = "button";
        detailsButton.textContent = "Ver detalles →";
        detailsButton.addEventListener("click", () => {
            showMovieDetails(movie);
        });

        info.append(year, title, director, description, detailsButton);
        card.append(poster, info);
        movieList.appendChild(card);
    });
}

// Filtrar por título y director
function filterMovies() {
    const searchTerm = searchInput.value.trim().toLocaleLowerCase();
    const selectedDirector = directorFilter.value;

    const filteredMovies = movies.filter(movie => {
        const title = (movie.title || "").toLocaleLowerCase();
        const originalTitle =
            (movie.original_title || "").toLocaleLowerCase();

        const matchesSearch =
            title.includes(searchTerm) ||
            originalTitle.includes(searchTerm);

        const matchesDirector =
            !selectedDirector || movie.director === selectedDirector;

        return matchesSearch && matchesDirector;
    });

    renderMovies(filteredMovies);

    statusMessage.textContent =
        `Se muestran ${filteredMovies.length} de ${movies.length} películas.`;
}

// Mostrar los detalles en una ventana
function showMovieDetails(movie) {
    document.getElementById("dialog-title").textContent =
        movie.title || "Título no disponible";

    document.getElementById("dialog-original-title").textContent =
        movie.original_title_romanised || movie.original_title || "";

    document.getElementById("dialog-year").textContent =
        movie.release_date ? `Año: ${movie.release_date}` : "Año no disponible";

    document.getElementById("dialog-duration").textContent =
        movie.running_time
            ? `Duración: ${movie.running_time} min`
            : "Duración no disponible";

    document.getElementById("dialog-score").textContent =
        movie.rt_score
            ? `Puntuación: ${movie.rt_score}/100`
            : "Puntuación no disponible";

    document.getElementById("dialog-description").textContent =
        movie.description || "Sinopsis no disponible.";

    document.getElementById("dialog-director").textContent =
        movie.director || "No disponible";

    document.getElementById("dialog-producer").textContent =
        movie.producer || "No disponible";

    if (!movieDialog.open) {
        movieDialog.showModal();
    }
}

// Eventos de búsqueda y filtros
searchInput.addEventListener("input", filterMovies);
directorFilter.addEventListener("change", filterMovies);

retryButton.addEventListener("click", loadMovies);

closeDialogButton.addEventListener("click", () => {
    movieDialog.close();
});

// Cerrar al hacer clic fuera de la ventana
movieDialog.addEventListener("click", event => {
    if (event.target === movieDialog) {
        movieDialog.close();
    }
});

// Iniciar la aplicación
loadMovies();
