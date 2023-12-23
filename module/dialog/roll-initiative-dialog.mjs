import RollPrompt from "./roll-dialog.mjs";

export default class RollInitiativeDialog extends Dialog {
    actor = null

    constructor(actor, onRoll) {
        const data = {
            title: game.i18n.localize("T6.UI.Confirm.Roll.Title"),
            buttons: {
                roll: {
                    icon: '<i class="fas fa-dice"></i>',
                    label: game.i18n.localize('T6.UI.Roll'),
                    callback: (e) => onRoll(this._selectedTraitsPool())
                }
            }
        }
        const options = {classes: ["dialog", "t6"]}
        super(data, options);

        this.actor = actor;
    }

    selectedTraits = []

    activateListeners(html) {
        super.activateListeners(html);

        html.find(".t6.trait").click(this._traitClicked.bind(this));
    }

    _selectedTraitsPool() {
        let pool = this.actor.type === "npc" ? this.actor.system.proficiency : 0;
        let selected = []
        for (const trait of this.actor.items) {
            if (!trait.isDestroyed && this.selectedTraits.includes(trait.id)) {
                pool += parseInt(trait.system.dice);
                selected.push(trait)
            }
        }
        return {
            size: pool,
            selectedTraits: selected
        }
    }


    async _traitClicked(e) {
        e.preventDefault()
        const itemId = e.target.closest(".item").dataset.itemId;
        const selectedItemId = this.selectedTraits.find(i => i === itemId);

        let item = this.actor.items.find(i => i.id === itemId);
        if (item.isDestroyed || !item.system.active) return

        if (selectedItemId) {
            this.selectedTraits = this.selectedTraits.filter(i => i !== itemId);
        } else {
            this.selectedTraits.push(itemId);
        }

        this.render();
    }

    async getData(options = {}) {
        const context = super.getData()

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

            if (item.system.active && item.system.linkedToWound) {
                item.linked = !item.isDestroyed;
                context.linkedWounds[item.system.linkedToWound] = true;
            } else {
                item.linked = false
            }
        }
        context.content = await renderTemplate("systems/t6/templates/dialog/roll-initiative-dialog.html", {traits: context.traits});

        return context;
    }
}