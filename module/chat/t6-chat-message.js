export default class T6ChatMessage extends ChatMessage {
    selectedTraits = [];
    async _renderRollContent(messageData) {
        const data = messageData.message;
        const renderRolls = async isPrivate => {
            let html = "";
            for (const r of this.rolls) {
                html += await this._roll_render(r, {isPrivate,template: "systems/t6/templates/chat/roll.html"});
            }
            return html;
        };

        // Suppress the "to:" whisper flavor for private rolls
        if (this.blind || this.whisper.length) messageData.isWhisper = false;
        this.selectedTraits = messageData.message.flags.selectedTraits;

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

        if (!roll._evaluated) await roll.evaluate({async: true});
        const chatData = {
            formula: isPrivate ? "???" : roll._formula,
            flavor: isPrivate ? null : flavor,
            user: game.user.id,
            selectedTraits: this.selectedTraits,
            total: isPrivate ? "?" : Math.round(roll.total * 100) / 100
        };

        chatData.parts = isPrivate ? [] : parts;

        return renderTemplate(template, chatData);
    }
}