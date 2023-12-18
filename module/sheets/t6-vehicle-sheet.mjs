export default class T6VehicleSheet extends ActorSheet {
    _selectedTraits = [];

    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-vehicle-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 540;
        options.height = 500;

        return options;
    }

    get selectedTraits() {
        return this._selectedTraits;
    }

    set selectedTraits(value) {
        this._selectedTraits = value;
    }

    static get VehicleTraits() {
        const vehicleSheet = Object.values(ui.windows).find(w => w instanceof T6VehicleSheet && w.selectedTraits.length);
        return vehicleSheet?.selectedTraits || [];
    }

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

    async _woundRightClick(e) {
        const checked = e.target.checked = !e.target.checked;
        const wound =  e.target.value;

        const linkedItems = this.actor.items.filter(
            i => i._system.linkedToWound == wound || (this.actor._system.wounds.max == wound && i._system.linkedToWound > this.actor._system.wounds.max)
        )
        linkedItems.forEach(i => i._system.damaged = checked)
        this.actor.updateEmbeddedDocuments("Item", linkedItems.map(i => {
            return {_id: i.id, system: i._system};
        }))
        this.submit()
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

    getData(options = {}) {
        const context = super.getData(options);
        context.actor = this.actor;
        context.data = this.actor._system;
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

            let linkedToWound = item._system.linkedToWound;
            if (item._system.active && linkedToWound) {
                item.linked = !item.isDestroyed;
                if (linkedToWound > this.actor._system.wounds.max) {
                    linkedToWound = this.actor._system.wounds.max;
                }
                context.linkedWounds[linkedToWound] = true;
            } else {
                item.linked = false
            }
        }

        return context
    }
}