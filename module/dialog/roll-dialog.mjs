export default class RollPrompt extends Dialog {
    static async show(actor, selectedTraits, pool, rollCallback) {
        await new Dialog({
                title: game.i18n.localize("T6.UI.Confirm.Roll.Title"),
                content: `<div class="t6 box">
<div class="flex row">
<span class="t6 label">` + game.i18n.localize('T6.UI.Confirm.Roll.Modifier') + `</span>
<input id="modifier" class="t6 small-input" type="number" value="0">
</div></div>
<h4>${game.i18n.localize("T6.UI.Confirm.Roll.DifficultyPrompt")}</h4>`,
                buttons: {
                    easy: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Easy'),
                        callback: (e) => {
                            const input = e[0].querySelector("input#modifier");
                            const modifier = +input.value;
                            if (modifier !== 0) {
                                selectedTraits.push({
                                    name: game.i18n.localize('T6.UI.Confirm.Roll.Modifier'),
                                    system: {dice: modifier}
                                })
                            }
                            rollCallback()
                            this._makeRoll(actor,pool + modifier, 4, selectedTraits)
                        }
                    },
                    normal: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Normal'),
                        callback: (e) => {
                            const input = e[0].querySelector("input#modifier");
                            const modifier = +input.value;
                            if (modifier !== 0) {
                                selectedTraits.push({
                                    name: game.i18n.localize('T6.UI.Confirm.Roll.Modifier'),
                                    system: {dice: modifier}
                                })
                            }
                            rollCallback()
                            this._makeRoll(actor,pool + modifier, 5, selectedTraits)
                        }
                    },
                    hard: {
                        icon: '<i class="fas fa-dice"></i>',
                        label: game.i18n.localize('T6.UI.Confirm.Roll.Hard'),
                        callback: (e) => {
                            const input = e[0].querySelector("input#modifier");
                            const modifier = +input.value;
                            if (modifier !== 0) {
                                selectedTraits.push({
                                    name: game.i18n.localize('T6.UI.Confirm.Roll.Modifier'),
                                    system: {dice: modifier}
                                })
                            }
                            rollCallback()
                            this._makeRoll(actor,pool + modifier, 6, selectedTraits)
                        }
                    }
                }
            }, {classes: ["dialog", "t6"]}
        ).render(true);
    }

    static  _getOppositeRoll() {
        const checked = ui.chat.element.find(".roll-against:checked");
        if (!checked) {
            return undefined;
        }
        const messageId = checked.attr("data-message-id")

        const message = ui.chat.collection.find(m => m.id === messageId)
        if (message && message.rolls) {
            return {
                roll: message.rolls[0].total,
                totalDamage: message.flags.selectedTraits.reduce((totalDamage, trait) => {
                    return totalDamage + (trait.system?.damage || 0)
                }, 0)
            }
        }
        return undefined;
    }

    static async _makeRoll(actor, pool, dc, selectedTraits) {
        let r = await new Roll(pool + "d6cs>=" + dc).evaluate({async: true});
        await r.toMessage({
            actor: actor,
            flags: {selectedTraits: selectedTraits, oppositeRoll: this._getOppositeRoll()},
            speaker: ChatMessage.getSpeaker({actor: actor})
        });
    }
}