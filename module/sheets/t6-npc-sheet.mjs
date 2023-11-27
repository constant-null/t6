import RollPrompt from "../dialog/roll-dialog.mjs";

export default class T6NPCSheet extends ActorSheet {
    selectedTraits = [];

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-npc-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 540;

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

        html.find("input.activate-trait").click(this._activateTraitClicked.bind(this));
        html.find(".t6.trait").contextmenu(this._traitContextMenu.bind(this));
        html.find(".t6.trait").click(this._traitClicked.bind(this));
        html.find(".roll.proficient").click(this._rollProfDiceClicked.bind(this));
        html.find(".roll.no-skill").click(this._rollNoProfDiceClicked.bind(this));
        html.find(".add-button").click(this._addTraitClicked.bind(this));
    }

    async _addTraitClicked(e) {
        e.preventDefault()

        const group = e.target.dataset.traitGroup;

        const newTrait = await this.actor.createEmbeddedDocuments('Item', [{
            name: game.i18n.localize("T6.Item.DefaultName"),
            type: "trait",
            system: {type: group}
        }])
        newTrait[0].sheet.render(true)
    }

    async _onSubmit(event, options) {
        if (this.actor.equippedArmor) {
            const formData = this._getSubmitData({});
            this.actor.updateEmbeddedDocuments("Item", [{
                _id: this.actor.equippedArmor._id,
                system: {armor: {received: formData["data.armor.received"]}}
            }])
        }
        return await super._onSubmit(event, options);

    }

    async _activateTraitClicked(e) {
        e.preventDefault()
        e.stopPropagation();

        const itemId = e.target.dataset.itemId;

        const checked = e.target.checked;
        if (!checked) {
            this.selectedTraits = this.selectedTraits.filter(i => i !== itemId);
        }

        await this.actor.updateEmbeddedDocuments("Item", [{_id: itemId, system: {active: checked}}]);
        this.render();
    }

    async _rollProfDiceClicked(e) {
        e.preventDefault()

        this._makeProficientRoll(this.actor._system.proficiency)
    }
    async _rollNoProfDiceClicked(e) {
        e.preventDefault()

        this._makeProficientRoll(0)
    }

    async _makeProficientRoll(proficiency) {
        let pool = proficiency;
        let selectedTraits = []
        for (const trait of this.actor.items) {
            if (!trait.isDestroyed && this.selectedTraits.includes(trait.id)) {
                pool += +trait._system.dice;
                selectedTraits.push(trait)
            }
        }
        if (pool === 0) return;

        RollPrompt.show(this.actor, selectedTraits, pool);
    }

    async _traitClicked(e) {
        e.preventDefault()
        const itemId = e.target.closest(".item").dataset.itemId;
        const selectedItemId = this.selectedTraits.find(i => i === itemId);

        let item = this.actor.items.find(i => i.id === itemId);
        if (item.isDestroyed || !item._system.active) return

        if (selectedItemId) {
            this.selectedTraits = this.selectedTraits.filter(i => i !== itemId);
        } else {
            this.selectedTraits.push(itemId);
        }

        this.render();
    }

    async _traitContextMenu(e) {
        e.preventDefault();
        const itemId = e.target.closest(".item").dataset.itemId;

        const item = this.actor.items.find(item => item.id === itemId);
        if (!item) {
            return;
        }

        item.sheet.render(true, {delete: true});
    }

    getData(options = {}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.data = this.actor._system;
        context.wounds = this.actor.wounds;
        context.armor = this.actor.armor;

        context.woundTooltips = {};

        // character wounds
        let wounds = Object.keys(context.wounds).reverse();
        for (let i = 0; i <= wounds.length - 1; i++) {
            context.woundTooltips[wounds[i]] = this.woundTooltips[i];
        }

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

            if (item._system.active && item._system.linkedToWound) {
                item.linked = !item.isDestroyed;
                context.linkedWounds[item._system.linkedToWound] = true;
            } else {
                item.linked = false
            }
        }

        return context
    }
}