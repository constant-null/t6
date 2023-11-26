export default class T6PCSheet extends ActorSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-pc-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 530;

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

        html.find(".t6.trait").contextmenu(this._traitClicked.bind(this));
    }

    async _traitClicked(e) {
        e.preventDefault();
        const itemId = e.target.dataset.itemId;

        const item = this.actor.items.find(item => item.id === itemId);
        if (!item) {
            return;
        }

        item.sheet.render(true, {delete: true});
    }

    draggedTraitId = null

    async _onDragStart(event) {
        this.draggedTraitId = event.target.dataset.itemId;
        return super._onDragStart(event);
    }

    async _onDrop(event) {
        event.preventDefault();
        const targetGroup = event.target.dataset.traitGroup;
        // this.draggedTraitId = this.actor.items.find(i => i.id === this.draggedTraitId);
        if (targetGroup) {
            // draggedTrait
        }
        return await super._onDrop(event);
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
        context.armor = {}

        context.traitGroups = {}

        const types = game.settings.get('t6', 'traitTypes')
        let otherTraitsGroup = game.i18n.localize('T6.Sheet.OtherTraits');

        for (const type of types) {
            context.traitGroups[type] = []
        }

        for (const item of this.actor.items) {
            let t = item._system.type;
            if (t in context.traitGroups) {
                context.traitGroups[t].push(item)
            } else {
                if (!(otherTraitsGroup in context.traitGroups)) {
                    context.traitGroups[otherTraitsGroup] = []
                }
                context.traitGroups[otherTraitsGroup].push(item)
            }
        }

        return context
    }
}