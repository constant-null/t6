export default class T6Actor extends Actor {
    get _system() {
        const v10 = game.release.generation >= 10;
        if (v10) {
            return this.system;
        } else {
            return this.data.data;
        }
    }

    prepareDerivedData() {
        super.prepareDerivedData();


        const wounds = this._system.wounds;
        if (this.type === "pc") {
            wounds.max = 10;
        }
        this.wounds = this._prepareWounds(wounds)
        this.armor = this._equipArmor()
    }

    _prepareWounds(wounds) {
        let maxWounds = wounds.max;
        let receivedWounds = wounds.received;
        const prepWounds = {};


        for (let i = 2; i <= maxWounds; i += 2) {
            prepWounds[i] = false;
        }

        for (const wound of receivedWounds) {
            if (wound == null) continue;
            prepWounds[wound] = true
        }

        return prepWounds
    }

    _equipArmor() {
        this.equippedArmor = null;
        for (const trait of this.items) {
            if (!trait._system.active || trait._system.armor.max <= 0) {
                continue;
            }

            if (!this.equippedArmor || this.equippedArmor.max < trait._system.armor.max) {
                this.equippedArmor = trait._system.armor;
                this.equippedArmor._id = trait._id;
            }
        }

        if (!this.equippedArmor) {
            return null;
        }

        return this._prepareWounds(this.equippedArmor)
    }
}