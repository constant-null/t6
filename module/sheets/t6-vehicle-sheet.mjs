import T6BaseSheet from "./t6-base-sheet.mjs";

export default class T6VehicleSheet extends T6BaseSheet {
    static get defaultOptions() {
        const options = super.defaultOptions;

        options.template = "systems/t6/templates/sheets/t6-vehicle-sheet.html";
        options.classes = options.classes.concat(["t6"]);
        options.width = 540;
        options.height = 500;

        return options;
    }

    async _traitClicked(e) {
        await super._traitClicked(e);
        this._rerenderPCSheet()
    }

    _rerenderPCSheet() {
        for (const id in ui.windows) {
            if (ui.windows[id].actor.type === "pc" && ui.windows[id].actor.isOwner) {
                ui.windows[id].render();
            }
        }
    }

    // basically onOpen hook
    async _render(force, options) {
        await super._render(force, options);
        if (options.focus) this._rerenderPCSheet();
    }

    // basically onClose hook
    async close(options) {
        await super.close(options);
        this._rerenderPCSheet();
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