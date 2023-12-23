export default class T6Item extends Item {
    async use() {
        const uses = this._getUses()

       uses.value > 0 && uses.value--
       await this.update({system:{uses}})
    }

    _getUses() {
        return this.system.uses || {value: 0, max: 0};
    }

    get isDestroyed() {
        const armor = this.system.armor;

        if (!armor.received) {
            armor.received = [];
        }
        for (const damage of armor.received) {
            if (armor.max == damage) return true; // == is by design!!!
        }

        if (this.system.damaged) {
            return true;
        }

        const uses = this._getUses()
        if (uses.max > 0 && uses.value == 0) { // == is by design!!!
            return true;
        }

        return false;
    }
}