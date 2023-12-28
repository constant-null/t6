export default class T6ChatMessage extends ChatMessage {
    async getHTML() {
        const html = await super.getHTML();
        this.activateListeners(html);

        return html
    }

    activateListeners(html) {
        html.find('.roll-against').click(this._rollAgainstClicked.bind(this))
        html.find('.deal-damage').click(this._dealDamageClicked.bind(this))
    }

    _dealDamageClicked(e) {
        e.preventDefault()

        const targets = canvas.tokens.controlled;
        if (targets.length === 0) {
            this.speakerActor.dealDamage(this.finalDamage);
            return;
        }
        targets.forEach(t => {
            const targetActor = t.actor;

            targetActor.dealDamage(this.finalDamage);
        })
    }

    _rollAgainstClicked(e) {
        if (e.target.previous) {
            e.target.checked = false;
        }
        e.target.previous = e.target.checked;
    }

    selectedTraits = [];
    oppositeRoll = undefined;

    async _renderRollContent(messageData) {
        const data = messageData.message;
        const renderRolls = async isPrivate => {
            let html = "";
            for (const r of this.rolls) {
                html += await this._roll_render(r, {isPrivate, template: "systems/t6/templates/chat/roll.html"});
            }
            return html;
        };

        // Suppress the "to:" whisper flavor for private rolls
        if (this.blind || this.whisper.length) messageData.isWhisper = false;
        this.selectedTraits = messageData.message.flags.selectedTraits;
        this.oppositeRoll = messageData.message.flags.oppositeRoll;
        this.speakerActor = game.actors.get(this.speaker.actor)


        // Display standard Roll HTML content
        if (this.isContentVisible) {
            const el = document.createElement("div");
            el.innerHTML = data.content;  // Ensure the content does not already contain custom HTML
            if (!el.childElementCount && this.rolls.length) data.content = await this._renderRollHTML(false);
        }

        // Otherwise, show "rolled privately" messages for Roll content
        else {
            const name = this.user?.name ?? game.i18n.localize("CHAT.UnknownUser");
            data.flavor = game.i18n.format("CHAT.PrivateRollContent", {user: name});
            data.content = await renderRolls(true);
            messageData.alias = name;
        }
    }

    async _renderRollHTML(isPrivate) {
        let html = "";
        for (const roll of this.rolls) {
            html += await this._roll_render(roll, {isPrivate, template: "systems/t6/templates/chat/roll.html"});
        }
        return html;
    }

    async _roll_render(roll, {flavor, template, isPrivate = false} = {}) {
        const parts = roll.dice.map(d => d.getTooltipData());

        const totalDamage = this.selectedTraits?.reduce((damage, trait) => {
            return damage + (trait.system?.damage || 0)
        }, 0)
        this.selectedTraits?.forEach(t => {
            const vehicle = t.flags?.t6?.vehicle;
            if (vehicle) {
                t.name = `(${vehicle.name}) ${t.name}`
            }
        })
        if (!roll._evaluated) await roll.evaluate({async: true});
        const [complication, ones] = this._checkForComplications(roll);
        const chatData = {
            formula: isPrivate ? "???" : roll._formula,
            flavor: isPrivate ? null : flavor,
            user: game.user.id,
            selectedTraits: this.selectedTraits,
            totalDamage: totalDamage,
            armor: this.speakerActor?.equippedArmor,
            total: isPrivate ? "?" : (roll._formula === "1d6cs>1" ? roll.terms[0].results[0].result : Math.round(roll.total * 100) / 100),
            complication: complication,
            ones: ones
        };

        if (this.oppositeRoll !== undefined) {
            chatData.opposite = true;
            chatData.oppositeRoll = this.oppositeRoll.roll;
            chatData.oppositeRollDamage = this.oppositeRoll.totalDamage;
            chatData.oppositeRollResult = this.oppositeRoll.roll - roll.total;
            chatData.finalDamage = Math.max(chatData.oppositeRollResult + chatData.oppositeRollDamage - this.speakerActor.equippedArmor.system.armor.protection, 0);
            this.finalDamage = chatData.finalDamage;
        }

        chatData.parts = isPrivate ? [] : parts;

        return renderTemplate(template, chatData);
    }

    _checkForComplications(roll) {
        if (!game.settings.get("t6", "complications")) return false;

        const dice = roll.dice[0]
        const poolSize = dice.results.length;
        const ones = dice.results.reduce((ones, die) => {
            return die.result === 1 ? ones+1: ones
        }, 0)
        return [Math.ceil(poolSize/2) <= ones, ones]
    }
}