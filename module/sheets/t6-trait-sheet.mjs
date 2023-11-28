export default class T6TraitSheet extends ItemSheet {
    deleteEnabled = false
    render(force = false, options = {}) {
        this.deleteEnabled = options?.delete || false;
        return super.render(force, options);
    }

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-trait-sheet.html"
        options.classes = options.classes.concat(["t6"]);
        options.width = 470;
        options.height = 470;

        return options;
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".delete-button").click(this._deleteClicked.bind(this));
    }

    async _deleteClicked(e) {
        e.preventDefault()

        return Dialog.confirm({
            title: game.i18n.localize("T6.UI.Confirm.DeleteTrait.Title"),
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize("T6.UI.Confirm.DeleteTrait.Warning")}</p>`,
            yes: () => {
                this.item.delete();
            },
            options: {
                classes: ["dialog", "t6"]
            }
        });
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
        context.types = game.settings.get('t6', 'traitTypes').split(',').map(e => e.trim())
        context.deleteEnabled = this.deleteEnabled;
        return context;
    }
}