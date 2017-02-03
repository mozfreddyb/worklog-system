function highlightElement(el) {
  if (!el.dataset.id) {
    let id = (Math.random() * 1e17).toString(36);
    el.dataset.id =id;
  }
  worker.postMessage({id: el.dataset.id, code: el.textContent});
}
function listArticles() {
  let links = f.contentDocument.querySelectorAll("a")
  links = Array.filter(links, (el) => el.href.endsWith(".md"));
  let urls = Array.map(links, (el) => el.href);
  nav = document.getElementById("nav");
  // revese order, newest first.
  for (var i=urls.length-1; i > -1; i--) {
    u = urls[i];
    let anchor = document.createElement("a");
    anchor.href = '#';
    anchor.dataset.url = u;
    // cut off after last slash,
    let filename = u.split("/").slice(-1)[0];
    anchor.title = filename;  // i.e. "YYY-MM-DD-foo-bar.md"
    // trim the preceeding datestamp (see above) for the text:
    anchor.textContent = filename.slice(11);
    anchor.addEventListener("click", requestArticle);
    nav.appendChild(anchor);
    nav.appendChild(document.createElement("br"));
  }
}

function requestArticle(ev) {
  var url = ev.target.dataset.url;
  location.hash = new URL(url).pathname;
  fetchArticle(url);
  ev.preventDefault();
  return false;
}
function fetchArticle(url) {
  fetch(url).then(resp => {
    return resp.text().then(text => {
      let article = document.getElementById("mainarticle");
      article.innerHTML = marked(text);
      let codeEls = article.querySelectorAll("code");
      for (var el of codeEls) {
        highlightElement(el);
      }
    });
  });
}

addEventListener('load', function() {
  // find articles through directory listing
  listArticles();
  // check location hash for state, do not accept non-relative paths
  if (location.hash.startsWith("#/articles/")) {
    fetchArticle(location.hash.slice(1));
  }
  // set up worker
  worker = new Worker('worker.js');
  worker.onmessage = function(event) {
    let result = event.data;
    try {
      let el = document.querySelector("[data-id=\""+result.id+"\"]");
      el.innerHTML = result.hl;
    } catch(e) {
      // race conditions whith someone navigating while still doing syntax hl
    }
  };
});

//foo.innerHTML=markdown.toHTML(foo.innerHTML)
