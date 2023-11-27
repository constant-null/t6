export default class T6PCSheet extends ActorSheet {
    selectedTraits = [];

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-pc-sheet.html";
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
        html.find(".roll-dice").click(this._rollDiceClicked.bind(this));
        html.find(".add-button").click(this._addTraitClicked.bind(this));
        html.find(".reset-button").click(this._resetSelectedClicked.bind(this));
    }

    async _resetSelectedClicked(e) {
        e.preventDefault()

        this.selectedTraits = [];
        this.render(true);
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

    async _rollDiceClicked(e) {
        e.preventDefault()

        let pool = 0;
        let selectedTraits = []
        for (const trait of this.actor.items) {
            if (!trait.isDestroyed && this.selectedTraits.includes(trait.id)) {
                pool += +trait._system.dice;
                selectedTraits.push(trait)
            }
        }

        if (pool === 0) return;

        new Dialog({
                title: game.i18n.localize("T6.UI.Confirm.Roll.Title"),
                content: `<div class="t6 box">
<div class="flex row">
<span class="t6 label">`+game.i18n.localize('T6.UI.Confirm.Roll.Modifier')+`</span>
<input id="modifier" class="t6 small-input" type="number" value="0">
</div></div>
<h4>${game.i18n.localize("T6.UI.Confirm.Roll.DifficultyPrompt")}</h4>`,
                buttons: {
                    easy: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Easy'),
                        callback: (e) => {
                            const input = e[0].querySelector("input#modifier");
                            const modifier = input.value;
                            selectedTraits.push({name: game.i18n.localize('T6.UI.Confirm.Roll.Modifier'), system:{dice: +modifier}})
                            this._makeRoll(pool+ +modifier, 4, selectedTraits)
                        }
                    },
                    normal: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Normal'),
                        callback: (e) => {
                            const input = e[0].querySelector("input#modifier");
                            const modifier = input.value;
                            selectedTraits.push({name: game.i18n.localize('T6.UI.Confirm.Roll.Modifier'), system:{dice: +modifier}})
                            this._makeRoll(pool+ +modifier, 4, selectedTraits)
                        }
                    },
                    hard: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Hard'),
                        callback: (e) => {
                            const input = e[0].querySelector("input#modifier");
                            const modifier = input.value;
                            selectedTraits.push({name: game.i18n.localize('T6.UI.Confirm.Roll.Modifier'), system:{dice: +modifier}})
                            this._makeRoll(pool+ +modifier, 4, selectedTraits)
                        }
                    }
                }
            }, {classes: ["dialog", "t6"]}
        ).render(true);
    }

    async _makeRoll(pool, dc, selectedTraits) {
        let r = await new Roll(pool + "d6cs>=" + dc).evaluate({async: true});
        await r.toMessage({
            flags: {selectedTraits: selectedTraits},
            speaker: ChatMessage.getSpeaker({actor: this.actor})
        });
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

        context.traitGroups = {}
        const types = game.settings.get('t6', 'traitTypes')
        let otherTraitsGroup = game.i18n.localize('T6.Sheet.OtherTraits');

        for (const type of types) {
            context.traitGroups[type] = []
        }

        context.linkedWounds = {}
        context.traitsSelected = false;
        context.traitsSelectedAmount = 0
        for (const item of this.actor.items) {
            let t = item._system.type;
            if (this.selectedTraits.find(i => i === item.id)) {
                if (!item.isDestroyed) {
                    context.traitsSelected = true;
                } else {
                    this.selectedTraits = this.selectedTraits.filter(i => i !== item.id);
                }
                item.selected = true;
                context.traitsSelectedAmount++
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