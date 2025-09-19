(function () {
    window.addEventListener("load", () => {
        const loadTime = (performance.now() / 1000).toFixed(3);
        const footer = document.querySelector("footer");
        if (footer) {
            footer.innerHTML = `Page load time is <strong>${loadTime}</strong> seconds.`;
        }
    });
})();

document.addEventListener("DOMContentLoaded", () => {
    const menuItems = document.querySelectorAll(".head__navigation__button");

    menuItems.forEach((item) => {
        item.addEventListener("mouseenter", () => {
            item.style.color = "brown";
        });

        item.addEventListener("mouseleave", () => {
            item.style.color = "";
        });
    });

    const currentPath = window.location.pathname;
    menuItems.forEach((item) => {
        if (item.getAttribute("href") === currentPath.split("/").pop()) {
            item.classList.add("active");
        }
    });

    $('.slider').slick({
        infinite: true,        // Бесконечный прокрут
        slidesToShow: 3,       // Кол-во отображаемых слайдов
        slidesToScroll: 1,     // Кол-во прокручиваемых за раз
        centerMode: true,      // Центрирование активного слайда
        arrows: true,          // Включение стрелок
        dots: true,            // Включение индикаторов
        autoplay: true,        // Автопрокрутка
        autoplaySpeed: 4000,   // Время автопрокрутки
    });
});