import Socket from "../sockets/socket.mjs";

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

    async _preUpdate(data, options, user) {
        const removedWounds = this._system.wounds.received.filter(w => !data.system.wounds.received.includes(w));
        const receivedWounds = data.system.wounds.received.filter(w => !this._system.wounds.received.includes(w));
        receivedWounds.forEach(w => {
            this._showValueChangeText(game.i18n.localize(this.woundsTooltips[w]) + ` (${w})`, true)
        })
        removedWounds.forEach(w => {
            this._showValueChangeText(game.i18n.localize(this.woundsTooltips[w]) + ` (${w})`, false)
        })
        // this._markAsDefeated()

        return super._preUpdate(data, options, user)
    }

    _showValueChangeText(wound, received, stroke = 0x000000) {
        const tokens = this.isToken ? [this.token?.object] : this.getActiveTokens(true);
        T6Actor.showValueChangeText(tokens, wound, received, stroke);
        Socket.emit("tokensAttributeChange", { tokens: tokens.map(t => t.id), wound: wound, received: received, stroke: stroke });
    }

    static listenWoundChange() {
        Socket.on("tokensAttributeChange", data => {
            const tokens = data.tokens.map(id => canvas.tokens.get(id));
            T6Actor.showValueChangeText(tokens, data.wound, data.received, data.stroke);
        });
    }


    static showValueChangeText(tokens, wound, received, stroke = 0x000000) {
        for (let t of tokens) {
            canvas.interface.createScrollingText(t.center, wound, {
                icon: "icons/svg/aura.svg",
                anchor: CONST.TEXT_ANCHOR_POINTS.TOP,
                direction: received ? CONST.TEXT_ANCHOR_POINTS.TOP : CONST.TEXT_ANCHOR_POINTS.BOTTOM,
                fill: received ? "red" : "green",
                stroke: stroke,
                strokeThickness: 4,
                jitter: 0.25
            });
        }
    }

    get _system() {
        const v10 = game.release.generation >= 10;
        if (v10) {
            return this.system;
        } else {
            return this.data.data;
        }
    }

    get isDefeated() {
        return this._system.wounds.received[this._system.wounds.received.length-1] !== null
    }


    async _markAsDefeated() {
        const token = this.token;
        const status = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);
        if ( !status && !token.object ) return;
        const effect = token.actor && status ? status : CONFIG.controlIcons.defeated;
        if ( token.object ) {
            await token.object.toggleEffect(effect, {overlay: true, active: !this.isDefeated})
        } else {
            await token.toggleActiveEffect(effect, {overlay: true, active: !this.isDefeated});
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