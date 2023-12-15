import Socket from "../sockets/socket.mjs";

export default class T6Actor extends Actor {
    static async create(data, options) {
        if (!(data instanceof T6Actor)) {
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
        }

        await super.create(data, options)
    }

    async _preUpdate(data, options, user) {
        if (data.system?.wounds) {
            const removedWounds = this._system.wounds?.received?.filter(w => !!w && !data.system.wounds.received?.includes(w)) || [];
            const receivedWounds = data.system.wounds.received?.filter(w => !!w && !this._system.wounds.received?.includes(w)) || [];
            const traumasEnabled = game.settings.get('t6', 'traumas')
            receivedWounds.forEach(w => {
                this._showValueChangeText(game.i18n.localize(this.woundsTooltips[w]) + ` (${w})`, true)
                if (traumasEnabled && (this.woundsTooltips[w] === CONFIG.T6.Wound.Mortal || this.woundsTooltips[w] === CONFIG.T6.Wound.Severe)) {
                    this._rollTrauma()
                }
            })
            removedWounds.forEach(w => {
                this._showValueChangeText(game.i18n.localize(this.woundsTooltips[w]) + ` (${w})`, false)
            })
        }

        return super._preUpdate(data, options, user)
    }

    async _rollTrauma() {
        const roll = new Roll("1d6cs>1")
        roll.toMessage({flavor: game.i18n.localize("T6.ChatMessage.Flavors.TraumaRoll")})
        const result = roll.terms[0].results[0].result;
        if (result === 1) {
            const tableId = game.settings.get('t6', 'traumasTable')
            const traumaTable = game.tables.get(tableId);
            const result = (await traumaTable.draw()).results[0];
            let trauma;
            if (result.type === CONST.TABLE_RESULT_TYPES.COMPENDIUM) {
                const pack = game.packs.get(result.documentCollection);
                trauma = await pack.getDocument(result.documentId)
            } else if (result.type === CONST.TABLE_RESULT_TYPES.DOCUMENT) {
                trauma = await game.items.get(result.documentId)
            } else {
                return;
            }
            await this.createEmbeddedDocuments('Item', [trauma])
        }
    }

    _onUpdate(data, options, userId) {
        super._onUpdate(data, options, userId);
        this._markAsDefeated()
    }

    _showValueChangeText(wound, received, stroke = 0x000000) {
        const tokens = this.isToken ? [this.token?.object] : this.getActiveTokens(true);
        T6Actor.showValueChangeText(tokens, wound, received, stroke);
        Socket.emit("tokensAttributeChange", {
            tokens: tokens.map(t => t.id),
            wound: wound,
            received: received,
            stroke: stroke
        });
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
        for (const wound of this._system.wounds?.received || []) {
            if (wound == this._system.wounds.max) return true
        }
        return false
    }

    async _markAsDefeated() {
        const token = this.token || this.getActiveTokens(true, true)[0] || null;
        if (!token) return;
        const effect = CONFIG.statusEffects.find(e => e.id === CONFIG.specialStatusEffects.DEFEATED);
        let defeated = this.isDefeated;
        await token.toggleActiveEffect(effect, {overlay: true, active: defeated});
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
            this.woundsTooltips[rWounds[i]] = CONFIG.T6.WoundNames[i];
        }

        this.armor = this._equipArmor()

        this.system.woundsBar = {
            value: this.wounds[wounds.max] ? 0 : wounds.max / 2 - Object.values(this.wounds).filter(w => w).length,
            max: wounds.max / 2
        }
    }

    async dealDamage(dmg) {
        if (this.isDefeated) return;
        let wounds = this.system.wounds.received.filter(w => !!w);
        dmg = Math.ceil(dmg / 2) * 2;
        while (wounds.includes(`${dmg}`)) dmg += 2;
        wounds.push(`${dmg}`)
        await this.update({system: {wounds: {received: wounds}}})

        await game.tables.get("7L87EuWElKmwg6KS").draw()
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

            if (!this.equippedArmor || this.equippedArmor._system.armor.max < trait._system.armor.max) {
                this.equippedArmor = trait;
            }
        }

        if (!this.equippedArmor) {
            return null;
        }

        return this._prepareWounds(this.equippedArmor._system.armor)
    }
}