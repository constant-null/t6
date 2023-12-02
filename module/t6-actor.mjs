export default class T6Actor extends Actor {
    static async create(data, options) {
        data.token = {
            actorLink: data.type !== "npc",
            disposition: data.type !== "npc" ? 1 : -1,
            vision: data.type !== "npc",
            displayBars: 50,
            bar1: {attribute: "woundsBar"},
        }

        if (data.type === "npc") {
            data.flags = {"core": {"sheetClass": "t6.T6NPCSheet"}};
        }

        await super.create(data, options)
    }

    _preUpdate(data, options, user) {
        data.system.wounds
        this._system.wounds

        const newWounds = this._system.wounds.received.filter(w => !data.system.wounds.received.includes(w));
     }

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
        this.woundsTooltips = {}
        const rWounds = Object.keys(this.wounds).reverse();
        for (let i = 0; i <= rWounds.length - 1; i++) {
            this.woundsTooltips[rWounds[i]] = CONFIG.T6.woundNames[i];
        }

        this.armor = this._equipArmor()

        this.system.woundsBar = {
            value: this.wounds[wounds.max] ? 0 : wounds.max/2-Object.values(this.wounds).filter(w => w).length,
            max: wounds.max/2
        }
    }

    _prepareWounds(wounds) {
        let maxWounds = wounds.max;
        let receivedWounds = wounds.received || [];
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
                this.equippedArmor.name = trait.name;
            }
        }

        if (!this.equippedArmor) {
            return null;
        }

        return this._prepareWounds(this.equippedArmor)
    }
}