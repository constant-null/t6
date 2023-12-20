export default class T6Themes {
    static injectStyle() {
        const head = document.querySelector('head');

        const link = document.createElement("link");
        link.href = "systems/t6/styles/t6-punk.css";
        link.type = "text/css";
        link.rel = "stylesheet";

        // let doc = document.documentElement;
        // doc.style.setProperty('--mouse-x', e.clientX + "px");

        head.appendChild(link)
    }
}