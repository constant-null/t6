export default class T6PCSheet extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-pc-sheet.html";
        options.classes = options.classes.concat(["t6"]);

        return options;
    }

    woundTooltips = [
        "T6.Tooltip.Wound.Mortal",
        "T6.Tooltip.Wound.Severe",
        "T6.Tooltip.Wound.Serious",
        "T6.Tooltip.Wound.Mild",
        "T6.Tooltip.Wound.Light",
    ]

    /** @type T6Actor */
    get actor() {
        return super.actor;
    }

    activateListeners(html) {
        super.activateListeners(html)

        // html.find(".clickable.approach").click(this._approachClicked.bind(this));
    }



    getData(options = {}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.data = this.actor._system;
        context.wounds = this.actor.wounds;

        context.woundTooltips = {};

        let wounds = Object.keys(context.wounds).reverse();
        for (let i = 0; i <= wounds.length-1; i++) {
            context.woundTooltips[wounds[i]] = this.woundTooltips[i];
        }


        return context
    }
}