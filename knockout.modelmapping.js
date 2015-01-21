(function (factory) {
    if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
        return factory(require("knockout"), exports);
    } else if (typeof define === "function" && define["amd"]) {
        return define(["knockout", "exports"], factory);
    } else {
        return factory(ko, ko.modelmapping = {});
    }
})(function (ko, exports) {
    
    var convertData, customMapping, setDefaults, mapField;
    
    convertData = function (data, modelMap, mapping, defaults) {
        var propertyName;
        
        if (typeof data === "string") {
            data = jQuery.parseJSON(data);
        }
        
        if (data instanceof Array) {
            var modelArray = new Array();

            for (var i = 0; i < data.length; i++) {
                var modelInstance = new modelMap();
                var dataItem = data[i];

                for (propertyName in modelInstance) {
                    if (propertyName in dataItem) {
                        mapField(propertyName, dataItem, modelInstance);
                    }
                }

                if (mapping != null) {
                    customMapping(dataItem, modelInstance, mapping);
                }

                if (defaults != null) {
                    setDefaults(modelInstance, defaults);
                }

                if (dataItem != null && dataItem != "") {
                    modelArray.push(modelInstance);
                }
            }

            return modelArray;
        }
        else if (data != null) {
            var singleModelInstance = new modelMap();
            
            for (propertyName in singleModelInstance) {
                if (propertyName in data) {
                    mapField(propertyName, data, singleModelInstance);
                }
            }
        
            if (mapping != null) {
                customMapping(data, singleModelInstance, mapping);
            }
        
            if (defaults != null) {
                setDefaults(singleModelInstance, defaults);
            }

            return singleModelInstance;
        }
    };
    
    customMapping = function (data, modelMap, mapping) {
        var mappingProp, results;
        results = [];
        for (mappingProp in mapping) {
            if (mapping[mappingProp] in data) {
                if (ko.isObservable(modelMap[mappingProp])) {
                    results.push(modelMap[mappingProp](data[mapping[mappingProp]]));
                } else {
                    results.push(modelMap[mappingProp] = data[mapping[mappingProp]]);
                }
            } else {
                results.push(void 0);
            }
        }
        return results;
    };
    
    setDefaults = function (modelMap, defaults) {
        var defaultProp, results;
        results = [];
        for (defaultProp in defaults) {
            if (defaultProp in modelMap) {
                if (ko.isObservable(modelMap[defaultProp])) {
                    results.push(modelMap[defaultProp](defaults[defaultProp]));
                } else {
                    results.push(modelMap[defaultProp] = defaults[defaultProp]);
                }
            } else {
                results.push(void 0);
            }
        }
        return results;
    };

    mapField = function (propertyName, data, modelMap) {
        // if is observable
        if (ko.isObservable(modelMap[propertyName]) && modelMap[propertyName].indexOf === undefined) {
            modelMap[propertyName](data[propertyName]);
        }
        else if (ko.isObservable(modelMap[propertyName]) && modelMap[propertyName].indexOf !== undefined) {
            if (modelMap[propertyName] != undefined && modelMap[propertyName].model != null) {
                var array;

                if (typeof data[propertyName] == 'function') {
                    array = data[propertyName]();
                } else {
                    array = data[propertyName];
                }

                var propArray = new Array();
                
                if (array != null && array != "") {
                    for (var dataField in array) {
                        if (dataField != "indexOf") {
                            var propModel = ko.modelmapping.mapToModel(array[dataField], modelMap[propertyName].model);
                            propArray.push(propModel);
                        }
                    }
                    modelMap[propertyName](propArray);
                }
            } else {
                modelMap[propertyName](data[propertyName]);
            }
        }
        else {
            modelMap[propertyName] = data[propertyName];
        }
    };

    return exports.mapToModel = function (data, modelMap, mapping, defaults) {
        if (data != null) {
            return convertData(data, modelMap, mapping, defaults);
        }
        
        return null;
    };
});

// New observable model array
ko.observableModelArray = function (initialValues, model) {
    if (initialValues == null || initialValues.length == 0) {
        // Zero-parameter constructor initializes to empty array
        initialValues = [];
    }
    if ((initialValues !== null) && (initialValues !== undefined) && !('length' in initialValues))
        throw new Error("The argument passed when initializing an observable array must be an array, or null, or undefined.");

    var result = ko.observable(initialValues);
    ko.utils.extend(result, ko.observableArray['fn']);
    result.model = model;
    
    return result;
}
