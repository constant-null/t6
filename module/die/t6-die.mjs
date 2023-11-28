export default class T6Die extends Die {
    constructor(termData = {}) {
        Die.MODIFIERS['t'] = 't6countSuccess';
        super(termData);
    }

    t6countSuccess(modifier) {
        const rgx = /(?:t)([2-6]*)/i;
        const match = modifier.match(rgx);
        if ( !match ) return false;
        let [dc] = match.slice(1);
        if (!dc) dc = 5;

        this.countSuccess(`cs>=${dc}`)
    }
}