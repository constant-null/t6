import RollInitiativeDialog from "../dialog/roll-initiative-dialog.mjs";

export default class T6Combatant extends Combatant {
    initiativeTraits = []
    async getInitiativeRoll(formula) {
        const pool = await this._getFormulaPromise()
        formula = `${pool.size}d6`
        this.initiativeTraits = pool.selectedTraits
        return super.getInitiativeRoll(formula)
    }

    _getFormulaPromise() {
        return new Promise(
            (resolve, reject) => {
                new RollInitiativeDialog(this.actor, resolve).render(true)
            });
    }
}