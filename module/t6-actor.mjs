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

        let maxWounds = this._system.wounds.max;
        let receivedWounds = this._system.wounds.received;
        this.wounds = {};

        if (this.type === "pc") {
            maxWounds = 10;
        }
        for (let i = 2; i <= maxWounds; i += 2) {
            this.wounds[i] = false;
        }

        for (const wound of receivedWounds) {
            if (wound == null) continue;
            this.wounds[wound] = true
        }
    }
}