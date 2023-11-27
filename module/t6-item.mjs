export default class T6Item extends Item {
    get _system() {
        const v10 = game.release.generation >= 10;
        if (v10) {
            return this.system;
        } else {
            return this.data.data;
        }
    }

    get isDestroyed() {
        const armor = this._system.armor;

        if (!armor.received) {
            return false;
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

        return false;
    }
}