import RollPrompt from "../dialog/roll-dialog.mjs";

export default class T6BaseSheet extends ActorSheet {
    selectedTraits = [];

    /** @type T6Actor */
    get actor() {
        return super.actor;
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find("input.activate-trait").click(this._activateTraitClicked.bind(this));
        html.find(".wound.checkbox").contextmenu(this._woundRightClick.bind(this))
        html.find(".t6.trait").contextmenu(this._traitContextMenu.bind(this));
        html.find(".t6.trait").click(this._traitClicked.bind(this));
        html.find(".add-button").click(this._addTraitClicked.bind(this));
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

        item.sheet.render(true);
    }

    async _woundRightClick(e) {
        const checked = e.target.checked = !e.target.checked;
        const wound = e.target.value;

        const linkedItems = this.actor.items.filter(
            i => i._system.linkedToWound == wound || (this.actor._system.wounds.max == wound && i._system.linkedToWound > this.actor._system.wounds.max)
        )
        linkedItems.forEach(i => i._system.damaged = checked)
        this.actor.updateEmbeddedDocuments("Item", linkedItems.map(i => {
            return {_id: i.id, system: i._system};
        }))
        this.submit()
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

    _getVehicleTraits() {
        const vehicleSheet = Object.values(ui.windows).find(w => w.actor.type === "vehicle" && w.selectedTraits.length);
        const traits = vehicleSheet?.selectedTraits.map(ti => {
            const vehicleTrait = vehicleSheet.actor.items.find(i => i.id === ti);
            vehicleTrait.setFlag('t6', 'vehicle', vehicleSheet.actor);
            return vehicleTrait;
        }) || [];
        const pool = traits.reduce((dice, trait) => {
            return dice + trait._system.dice
        }, 0);
        return {sheet: vehicleSheet, pool, traits}
    }


    async _rollDice(defaultPool) {
        let pool = defaultPool;
        let selectedTraits = [];
        for (const trait of this.actor.items) {
            if (!trait.isDestroyed && this.selectedTraits.includes(trait.id)) {
                pool += parseInt(trait._system.dice);
                selectedTraits.push(trait)
            }
        }
        const vehicleTraits = this._getVehicleTraits()
        pool += vehicleTraits.pool;
        if (pool === 0) return;
        selectedTraits.push(...vehicleTraits.traits);

        await RollPrompt.show(this.actor, selectedTraits, pool, () => {
            selectedTraits.forEach(t => t.use())
            this.render()
        });
    }
}