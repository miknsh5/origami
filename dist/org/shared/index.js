System.register(['./models/orgchart.model', './models/orgnode.model', './org.service'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters:[
            function (orgchart_model_1_1) {
                exportStar_1(orgchart_model_1_1);
            },
            function (orgnode_model_1_1) {
                exportStar_1(orgnode_model_1_1);
            },
            function (org_service_1_1) {
                exportStar_1(org_service_1_1);
            }],
        execute: function() {
        }
    }
});
//# sourceMappingURL=index.js.map