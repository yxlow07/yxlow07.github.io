document.addEventListener("DOMContentLoaded", function () {
    const currentOrigin = window.location.origin;

    document.querySelectorAll("a[href]").forEach(function (link) {
        const href = link.getAttribute("href");

        // Ignore anchor, mailto, tel, javascript, or relative links
        if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("javascript:") ||
            href.startsWith("/") ||
            href.startsWith(currentOrigin)
        ) {
            return;
        }

        // If it's not internal, treat as external
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
    });
});
  