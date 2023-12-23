import T6ItemModel from "../models/t6-item-model.mjs";
import TraitTypeTemplates from "./trait-type-templates.mjs";

export default class TraitTypesConfig extends FormApplication {
    constructor(object={}, options={}) {
        super(object, options);
        this.settings = T6ItemModel.propertiesList()
    }
    activateListeners(html) {
        html.find("select#template").change(this._onTemplateChanged.bind(this))
        html.find("#template-add").click(this._onTemplateAdd.bind(this))
        html.find(".template-delete").click(this._onTemplateDelete.bind(this))
        return super.activateListeners(html);
    }

    _onTemplateChanged(e) {
        e.preventDefault();
        this.selectedConfig = TraitTypeTemplates.templates[e.target.value];
        this.render();
    }

    _onTemplateAdd(e) {
        e.preventDefault();
        const formData = this._getSubmitData(new FormData(e.target.closest('form')));

        this.selectedConfig = this._formToConfig(formData)
        this.selectedConfig[""] = T6ItemModel.defaultPropertiesConfig();
        this.render()
    }

    _onTemplateDelete(e) {
        e.preventDefault();
        const deleteName = e.target.dataset.name;
        const formData = this._getSubmitData(new FormData(e.target.closest('form')));
        this.selectedConfig = this._formToConfig(formData)
        delete this.selectedConfig[deleteName];
        this.render()
    }

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.id = "trait-types-config"
        options.template = "systems/t6/templates/forms/trait-types-config.html";
        options.width = 700;
        options.height = 500;
        return options;
    }

    async _updateObject(event, formData) {
        const config = this._formToConfig(formData)

        game.settings.set('t6', 'traitConfigData', config)
    }

    _formToConfig(formData) {
        const config = {}

        formData['name'].forEach((name, index) => {
            config[name] = {};
            this.settings.forEach(setting => {
                config[name][setting] = formData[setting][index]
            })
        })

        return config;
    }

    getData() {
        const data = super.getData()

        data.traits = this.selectedConfig || game.settings.get('t6', 'traitConfigData');
        data.settings = this.settings;
        data.templates = Object.keys(TraitTypeTemplates.templates);
        this.selectedConfig = null;

        return data
    }
}