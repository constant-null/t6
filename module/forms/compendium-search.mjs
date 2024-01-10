export default class CompendiumSearch extends FormApplication {
    activateListeners(html) {
        html.find("#search").change(this._onSearchClicked.bind(this))
        return super.activateListeners(html);
    }

    _onSearchClicked(e) {

    }

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.id = "compendium-search-form"
        options.template = "systems/t6/templates/forms/compendium-search.html";
        options.width = 700;
        options.height = 500;
        options.classes = options.classes ? options.classes.concat(["dialog", "t6"]) : ["dialog", "t6"];
        options.resizable = true;

        return options;
    }

    async _updateObject(event, formData) {
    }

    _findItems() {

    }

    getData() {
        const data = super.getData()

        data.packs = game.packs.reduce((obj, pack) => {
            return {...obj, [pack.metadata.id]: pack.metadata.label}
        }, {})
        data.folders = [];
        data.items = this._findItems();

        return data
    }
}