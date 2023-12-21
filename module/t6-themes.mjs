export default class T6Themes {
    static styles = {
        punk: "systems/t6/styles/t6-punk.css",
        hell: "systems/t6/styles/t6-hell.css",
    }
    static get options() {
        const objectMap = (obj) =>
            Object.fromEntries(
                Object.entries(obj).map(
                    ([k, v], i) => [k, `T6.Themes.${k}`]
                )
            )

        return objectMap(this.styles)
    }
    static injectStyle() {
        const theme = game.settings.get("t6", "theme")
        const head = document.querySelector('head');

        const link = document.createElement("link");
        link.href = this.styles[theme];
        link.type = "text/css";
        link.rel = "stylesheet";

        head.appendChild(link)
    }
}