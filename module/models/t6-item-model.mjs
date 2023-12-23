export default class T6ItemModel extends foundry.abstract.DataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            type: new fields.StringField({nullable:false}),
            description: new fields.HTMLField({nullable:false}),
            dice: new fields.NumberField({initial: 0, nullable:false}),
            damage: new fields.NumberField({initial: 0, nullable:false}),
            damaged: new fields.BooleanField({nullable:false}),
            armor: new fields.SchemaField({
                max: new fields.NumberField({initial: 0, nullable:false}),
                received: new fields.ArrayField(new fields.NumberField()),
                protection: new fields.NumberField({initial: 0, nullable:false}),
            }),
            linkedToWound: new fields.NumberField({initial: 0,nullable:false}),
            active: new fields.BooleanField({nullable:false}),
            uses: new fields.SchemaField({
                value: new fields.NumberField({initial: 0,nullable:false}),
                max: new fields.NumberField({initial: 0,nullable:false})
            })
        }
    }

    static defaultPropertiesConfig() {
        const fieldList = this.propertiesList()
        return fieldList.reduce((fields, i) => {
            return {...fields, [i]: true}
        }, {})
    }

    static propertiesList() {
        return Object.keys(T6ItemModel.defineSchema()).filter(i => !['type', 'description', 'damaged', 'active'].includes(i))
    }

    static migrateData() {
        // Omitted for brevity.
    }
}