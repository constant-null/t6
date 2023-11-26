export default class T6TraitSheet extends ItemSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-trait-sheet.html"
        options.classes = options.classes.concat(["t6"]);
        options.width = 470;
        options.height = 470;

        return options;
    }

    /**
     * @returns {T6Item}
     */
    get item() {
        return super.item;
    }

    getData(options = {}) {
        const context = super.getData(options);
        context.item = this.item;
        context.data = this.item._system;
        context.types = game.settings.get('t6', 'traitTypes')

        return context;
    }
}