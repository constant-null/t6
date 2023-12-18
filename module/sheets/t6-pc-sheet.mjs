import T6PCNotesSheet from "./t6-pc-notes-sheet.mjs";
import T6BaseSheet from "./t6-base-sheet.mjs";

export default class T6PCSheet extends T6BaseSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-pc-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 545;

        return options;
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".roll-dice").click(this._rollDiceClicked.bind(this));
        html.find(".reset-button").click(this._resetSelectedClicked.bind(this));
        html.find("#open-notes").click(this._openNotesClicked.bind(this));
    }

    async _openNotesClicked(e) {
        new T6PCNotesSheet(this.actor).render(true);
    }

    async _resetSelectedClicked(e) {
        e.preventDefault()
        const vehicleTraits = this._getVehicleTraits();
        if (vehicleTraits.sheet) vehicleTraits.sheet.selectedTraits = [];
        this.selectedTraits = [];
        this.render(true);
    }

    async _rollDiceClicked(e) {
        e.preventDefault()

        this._rollDice(0)
    }

    getData(options = {}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.data = this.actor._system;
        context.wounds = this.actor.wounds;
        context.armor = this.actor.armor;
        context.woundTooltips = this.actor.woundsTooltips;

        context.traitGroups = {}
        const types = game.settings.get('t6', 'traitTypes').split(',').map(e => e.trim())
        let otherTraitsGroup = game.i18n.localize('T6.Sheet.OtherTraits');

        for (const type of types) {
            context.traitGroups[type] = []
        }

        const vehicle = this._getVehicleTraits()
        context.linkedWounds = {}
        context.traitsSelected = false;
        context.traitsSelectedAmount = vehicle.pool;
        for (const item of this.actor.items) {
            let t = item._system.type;
            if (this.selectedTraits.find(i => i === item.id)) {
                if (!item.isDestroyed) {
                    context.traitsSelected = true;
                } else {
                    this.selectedTraits = this.selectedTraits.filter(i => i !== item.id);
                }
                item.selected = true;
                context.traitsSelectedAmount += item._system.dice;
            } else {
                item.selected = false;
            }

            if (item._system.active && item._system.linkedToWound) {
                item.linked = !item.isDestroyed;
                context.linkedWounds[item._system.linkedToWound] = true;
            } else {
                item.linked = false
            }

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