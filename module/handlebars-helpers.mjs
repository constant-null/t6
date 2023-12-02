export default function registerHandlebarsHelpers() {
    Handlebars.registerHelper("signedValue", (value) => {
        return value > 0 ? "+" + value : value;
    });

    Handlebars.registerHelper("get", (object, field) => {
        return object[field];
    });

    Handlebars.registerHelper("gt", (v1, v2) => {
        return v1 > v2;
    });

    Handlebars.registerHelper("ge", (v1, v2) => {
        return v1 >= v2;
    });

    Handlebars.registerHelper("lt", (v1, v2) => {
        return v1 < v2;
    });

    Handlebars.registerHelper("le", (v1, v2) => {
        return v1 <= v2;
    });

    Handlebars.registerHelper("eq", (v1, v2) => {
        return v1 === v2;
    });

    Handlebars.registerHelper("mul", (v1, v2) => {
        return v1 * v2;
    });

    Handlebars.registerHelper("abs", (v) => {
        return Math.abs(v);
    });

    Handlebars.registerHelper("signedInt", (v) => {
        if (parseInt(v) >= 0) {
            return "+"+v;
        }
        return v
    });

    Handlebars.registerHelper("contains", (list, el) => {
        if (!list) return false;
        return list.includes(el);
    });

    Handlebars.registerHelper("lastElement", (list) => {
        if (!list) return false;

        if (Array.isArray(list)) {
            return list[list.length-1];
        } else {
            return list[Object.keys(list)[Object.keys(list).length - 1]]
        }
    });

}
