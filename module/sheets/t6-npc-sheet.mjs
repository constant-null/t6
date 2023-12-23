import T6BaseSheet from "./t6-base-sheet.mjs";

export default class T6NPCSheet extends T6BaseSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-npc-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 560;
        options.height = 500;

        return options;
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".roll.proficient").click(this._rollProfDiceClicked.bind(this));
        html.find(".roll.no-skill").click(this._rollNoProfDiceClicked.bind(this));
    }

    async _rollProfDiceClicked(e) {
        e.preventDefault()

        this._rollDice(this.actor.system.proficiency)
    }

    async _rollNoProfDiceClicked(e) {
        e.preventDefault()

        this._rollDice(0)
    }

    getData(options = {}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.data = this.actor.system;
        context.wounds = this.actor.wounds;
        context.armor = this.actor.armor;
        context.woundTooltips = this.actor.woundsTooltips;

        context.linkedWounds = {};
        context.traitsSelected = false;
        context.traits = this.actor.items;
        for (const item of this.actor.items) {
            if (this.selectedTraits.find(i => i === item.id)) {
                if (!item.isDestroyed) {
                    context.traitsSelected = true;
                } else {
                    this.selectedTraits = this.selectedTraits.filter(i => i !== item.id);
                }
                item.selected = true;
            } else {
                item.selected = false;
            }

            let linkedToWound = item.system.linkedToWound;
            if (item.system.active && linkedToWound) {
                item.linked = !item.isDestroyed;
                if (linkedToWound > this.actor.system.wounds.max) {
                    linkedToWound = this.actor.system.wounds.max;
                }
                context.linkedWounds[linkedToWound] = true;
            } else {
                item.linked = false
            }
        }

        return context
    }
}