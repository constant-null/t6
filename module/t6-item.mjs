export default class T6Item extends Item {
    get _system() {
        const v10 = game.release.generation >= 10;
        if (v10) {
            return this.system;
        } else {
            return this.data.data;
        }
    }

    async use() {
        const uses = this._getUses()

       uses.value > 0 && uses.value--
       await this.update({uses})
    }

    _getUses() {
        return this._system.uses || {value: 0, max: 0};
    }

    get isDestroyed() {
        const armor = this._system.armor;

        if (!armor.received) {
            armor.received = [];
        }
        for (const damage of armor.received) {
            if (armor.max == damage) return true; // == is by design!!!
        }

        if (this.actor && this._system.linkedToWound) {
            let receivedWounds = this.actor._system.wounds.received;
            for (const receivedWound of receivedWounds) {
                if (this._system.linkedToWound == receivedWound) return true;
            }
        }

        const uses = this._getUses()
        if (uses.max > 0 && uses.value == 0) {
            return true;
        }

        return false;
    }
}