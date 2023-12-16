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

    Handlebars.registerHelper("sub", (v, s) => {
        return +v - s;
    });

    Handlebars.registerHelper("max", (v1, v2) => {
        if (v1 >= v2) {
            return v1
        }
        return v2
    });

    Handlebars.registerHelper("add", (v, s) => {
        return +v + +s;
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

    Handlebars.registerHelper("fontSize", (text) => {
        let size = "x-large";
        if (!text) return ;

        if  (text.length > 16) size = "large"
        if (text.length > 18) size = "larger"
        if (text.length > 19) size = "medium"
        if (text.length > 21) size = "revert"
        if (text.length > 23) size = "small"
        return `style="font-size:${size}"`
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
