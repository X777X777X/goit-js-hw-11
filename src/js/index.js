import Notiflix from 'notiflix';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchImages } from './fatchimages';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

let query = '';
let page = 1;
let simpleLightbox;
const perPage = 40;

searchForm.addEventListener('submit', onSearchForm);

function renderGallery(images) {
  if (!gallery) {
    return;
  }

  const markup = images
    .map(image => {
      const {
        id,
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      } = image;
      return `
        <a class="gallery__link" href="${largeImageURL}">
          <div class="gallery-item" id="${id}">
            <img class="gallery-item__img" src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
              <p class="info-item"><b>Likes</b>${likes}</p>
              <p class="info-item"><b>Views</b>${views}</p>
              <p class="info-item"><b>Comments</b>${comments}</p>
              <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
          </div>
        </a>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);

  // Экономная загрузка

  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function onSearchForm(e) {
  e.preventDefault();
  page = 1;
    query = e.currentTarget.elements.searchQuery.value.trim();
    gallery.innerHTML = '';

    if (query === '') {
        Notiflix.Notify.failure(
          'The search string cannot be empty. Please specify your search query.',
        );
        return;
    }

    fetchImages(query, page, perPage).then(data => {
        if (data.totallHits === 0) {
            Notiflix.Notify.failure('We are sorry, but you have reached the end of search results.',);
        } else {
            renderGallery(data.hits);
            simpleLightbox = new SimpleLightbox('.gallery a').refresh();
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }
    }).catch(error => console.log(error)).finally(() => {
        searchForm.reset();
    });
}

function onLoadMore() {
    page += 1;
    simpleLightbox.destroy();

    fetchImages(query, page, perPage).then(data => {
        renderGallery(data.hits);
        simpleLightbox = new SimpleLightbox('.gallery a').refresh();

        const totalPages = Math.ceil(data.totalHits / perPage);

        if (page > totalPages) {
            Notiflix.Notify.failure(
                "We're sorry, but you've reached the end of search results.",
            );
        }
    }).catch(error => console.log(error));
}

function checkIfEndOfPage() {
  return (
    window.innerHeight + window.pageYOffset >=
    document.documentElement.scrollHeight
  );
}

// Когда дошел до конца страницы

function showLoadMorePage() {
    if (checkIfEndOfPage()) {
      onLoadMore();
    }
}

window.addEventListener('scroll', showLoadMorePage);

// Кнопка вверх

arrowTop.onclick = function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.addEventListener('scroll', function () {
    arrowTop.hidden = scrollY < this.document.documentElement.clientHeight;
});