export default class T6NPCSheet extends ActorSheet {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/t6/templates/sheets/t6-npc-sheet.html",
            height: 600,
            width: 600,
        })
    }

    activateListeners(html) {
        super.activateListeners(html)

        html.find(".clickable.approach").click(this._approachClicked.bind(this));
    }
}