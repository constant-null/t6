export default class T6PCSheet extends ActorSheet {
    selectedItems = [];

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

        html.find(".t6.trait").contextmenu(this._traitContextMenu.bind(this));
        html.find(".t6.trait").click(this._traitClicked.bind(this));
        html.find(".roll-dice").click(this._rollDiceClicked.bind(this));
        html.find(".activate-trait").click(this._activateTraitClicked.bind(this));
    }

    async _activateTraitClicked(e) {
        e.preventDefault()
        e.stopPropagation();

        const itemId = e.target.dataset.itemId;
        const checked = e.target.checked;

        await this.actor.updateEmbeddedDocuments("Item", [{_id:itemId, system:{active:checked}}]);
    }

    async _rollDiceClicked(e) {
        e.preventDefault()

        let pool = 0;
        for (const trait of this.actor.items) {
            if (this.selectedItems.includes(trait.id)) {
                pool += +trait._system.dice;
            }
        }

        new Dialog({
                title: game.i18n.localize("T6.UI.Confirm.Roll.Title"),
                content: `<h4>${game.i18n.localize("T6.UI.Confirm.Roll.DifficultyPrompt")}</h4>`,
                buttons: {
                    easy: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Easy'),
                        callback: () => this._makeRoll(pool, 4)
                    },
                    normal: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Normal'),
                        callback: () => this._makeRoll(pool, 5)
                    },
                    hard: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Hard'),
                        callback: () => this._makeRoll(pool, 6)
                    }
                }
            }, {classes: ["dialog", "t6"]}
        ).render(true);
    }

    async _makeRoll(pool, dc) {
        let r = await new Roll(pool + "d6cs>=" + dc).evaluate({async: true});
        await r.toMessage({
            // flavor: heroMessage,
            speaker: ChatMessage.getSpeaker({actor: this.actor})
        });
    }

    async _traitClicked(e) {
        e.preventDefault()
        const itemId = e.target.dataset.itemId;
        const selectedItem = this.selectedItems.find(i => i === itemId);
        if (selectedItem) {
            this.selectedItems = this.selectedItems.filter(i => i !== itemId);
        } else {
            this.selectedItems.push(itemId);
        }

        this.render();
    }

    async _traitContextMenu(e) {
        e.preventDefault();
        const itemId = e.target.dataset.itemId;

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

        context.woundTooltips = {};

        let wounds = Object.keys(context.wounds).reverse();
        for (let i = 0; i <= wounds.length - 1; i++) {
            context.woundTooltips[wounds[i]] = this.woundTooltips[i];
        }
        context.armor = {}

        context.traitGroups = {}

        const types = game.settings.get('t6', 'traitTypes')
        let otherTraitsGroup = game.i18n.localize('T6.Sheet.OtherTraits');

        for (const type of types) {
            context.traitGroups[type] = []
        }

        context.traitsSelected = false;
        for (const item of this.actor.items) {
            let t = item._system.type;
            if (this.selectedItems.find(i => i === item.id)) {
                context.traitsSelected = true;
                item.selected = true;
            } else {
                item.selected = false;
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