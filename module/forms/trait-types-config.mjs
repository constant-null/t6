export default class TraitTypesConfig extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/forms/trait-types-config.html";
        // options.classes = options.classes.concat(["t6"]);

        return options;
    }

    getData() {
        let data = super.getData()
        data.traits = game.settings.get('t6', 'traitTypes');

        return data
    }

    _updateObject(event, formData) {
        // const data = expandObject(formData);
        game.settings.set('t6', 'traitTypes', ['Personal', "History", "Equipment", "Cyberware", "Troubles"]);
    }
}