export default class T6Themes {
    static injectStyle() {
        const head = document.querySelector('head');

        const link = document.createElement("link");
        link.href = "systems/t6/styles/t6-hell.css";
        link.type = "text/css";
        link.rel = "stylesheet";

        head.appendChild(link)
    }
}