import RollPrompt from "../dialog/roll-dialog.mjs";
import T6PCNotesSheet from "./t6-pc-notes-sheet.mjs";

export default class T6PCSheet extends ActorSheet {
    selectedTraits = [];

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-pc-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 540;

        return options;
    }

    /** @type T6Actor */
    get actor() {
        return super.actor;
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find("input.activate-trait").click(this._activateTraitClicked.bind(this));
        html.find(".t6.trait").contextmenu(this._traitContextMenu.bind(this));
        html.find(".t6.trait").click(this._traitClicked.bind(this));
        html.find(".t6.trait-x2").click(this._traitx2Clicked.bind(this));
        html.find(".roll-dice").click(this._rollDiceClicked.bind(this));
        html.find(".add-button").click(this._addTraitClicked.bind(this));
        html.find(".reset-button").click(this._resetSelectedClicked.bind(this));
        html.find("#open-notes").click(this._openNotesClicked.bind(this));
    }

    async _openNotesClicked(e) {
        new T6PCNotesSheet(this.actor).render(true);
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
        const trait = this.actor.items.find(t => t.id === itemId)
        let uses = trait._system.uses;
        if (!checked) {
            this.selectedTraits = this.selectedTraits.filter(i => i !== itemId);
        } else {
            if (uses.max > 0 && uses.value == 0) {
                uses.value = uses.max;
                const messageData = {
                    user: game.user.id,
                    type: CONST.CHAT_MESSAGE_TYPES.IC,
                    content: `${this.actor.name} ${game.i18n.localize('T6.ChatMessage.Reloading')} ${trait.name} !`
                };
                ChatMessage.create(messageData)
            }
        }

        await this.actor.updateEmbeddedDocuments("Item", [{_id: itemId, system: {active: checked, uses}}]);
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
        RollPrompt.show(this.actor, selectedTraits, pool, () => {
            selectedTraits.forEach(t => t.use())
            this.render()
        });
    }

    async _traitx2Clicked(e) {
        e.preventDefault()
        const itemId = e.target.closest(".item").dataset.itemId;
        const selectedItemId = this.selectedTraits.find(i => i === itemId);

        let item = this.actor.items.find(i => i.id === itemId);
        if (item.isDestroyed || !item._system.active) return

        if (selectedItemId) {
            this.selectedTraits = this.selectedTraits.filter(i => i !== itemId);
        }
        this.selectedTraits.push(itemId, itemId)

        this.render();
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
        context.woundTooltips = this.actor.woundsTooltips;

        context.traitGroups = {}
        const types = game.settings.get('t6', 'traitTypes').split(',').map(e => e.trim())
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