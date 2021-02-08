"use strict";
function secret(string) {
    return [...string]
        .map((l, i) => {
        return l.toUpperCase() + l.toLowerCase().repeat(i);
    })
        .join("-");
}
document.body.append(secret("test"));
//# sourceMappingURL=secret.js.map