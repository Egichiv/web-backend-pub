document.addEventListener("DOMContentLoaded", () => {
    const preloader = document.getElementById("preloader");
    const commentsList = document.getElementById("comments-list");

    preloader.style.display = "block";

    const startId = Math.floor(Math.random() * (490)) + 1;

    fetch(`https://jsonplaceholder.typicode.com/comments?_start=${startId}&_limit=10`)
        .then((response) => {
            if (!response.ok) {
                throw new Error("хаха ашибка");
            }
            return response.json();
        })
        .then((comments) => {
            preloader.style.display = "none";

            comments.forEach((comment) => {
                const li = document.createElement("li");
                li.innerHTML =
        `
          <p class="comment-author">${comment.name}</p>
          <p class="comment-email">${comment.email}</p>
          <p class="comment-body">${comment.body}</p>
        `;
                commentsList.appendChild(li);
            });
        })
        .catch((error) => {
            preloader.style.display = "none";
            commentsList.innerHTML = `<p style="color: red;">⚠ >:( ЧТО-ТО ПОШЛО НЕ ПО ПЛАНУ: ${error.message}</p>`;
        });
});