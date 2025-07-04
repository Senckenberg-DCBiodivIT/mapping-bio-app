exports.beforeSchemaValidationWithId = beforeSchemaValidationWithId;
exports.afterCreateOrUpdate = afterCreateOrUpdate;
exports.afterDelete = afterDelete;
exports.generateId = generateId;
exports.isGenerateIdLoopable = true;

exports.methods = {};
exports.methods.getAsROCrate = getAsROCrate;
exports.methods.getAsROCrate.allowGet = true;

const cordra = require("cordra");

const HDL_CONFIG_FILE_NAME = "hdlConfig.json";
const HDL_PFX_FILE_NAME = "hdladminkey.pfx";
let HDL_CONFIG = null;
let client = null;

const CONTEXT_URL =
  "https://raw.githubusercontent.com/mapping-commons/sssom/0.15.0/src/sssom_schema/context/sssom_schema.context.jsonld";
const BASE_URL = "https://mapping.bio/api";
const API_BASE_URL = BASE_URL + "/objects/";


function beforeSchemaValidationWithId(object, context) {
  object.content["@context"] = CONTEXT_URL;
  const iri = API_BASE_URL + object.id;
  object.content["@id"] = iri;
  object.content.mapping_set_id = iri;
  object.content["@type"] = "MappingSet";
  const mappings = object.content.mappings;
  if (Array.isArray(mappings)) {
    for (let i = 0; i < mappings.length; i++) {
      mappings[i]["@type"] = "Mapping";
    }
  }
  return object;
}


function getAsROCrate(object, context) {
  const datasetUrl = "https://hdl.handle.net/" + object.id;
  const roCrateMetaUrl =
    BASE_URL + "/call?objectId=" + object.id + "&method=getAsROCrate";
  const rocrate = {
    "@context": ["https://w3id.org/ro/crate/1.1/context", CONTEXT_URL],
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": roCrateMetaUrl,
        conformsTo: { "@id": "https://w3id.org/ro/crate/1.2-DRAFT" },
        about: { "@id": datasetUrl },
      },
      {
        "@id": datasetUrl,
        "@type": "Dataset",
        conformsTo: { "@id": "https://w3id.org/sssom/core#SSSOM" },
        hasPart: [object.content],
        license: { "@id": object.content.license },
      },
    ],
  };
  const creator_ids = object.content.creator_id;
  const creator_labels = object.content.creator_label;
  if (Array.isArray(creator_ids)) {
    for (let i = 0; i < creator_ids.length; i++) {
      const creator_id = creator_ids[i];

      const creator = {
        "@id": creator_id,
        "@type": "Person",
      };
      if (Array.isArray(creator_labels) && creator_labels[i]) {
        creator.name = creator_labels[i];
      }
      rocrate["@graph"].push(creator);
      rocrate["@graph"][1].author = { "@id": creator_id };
    }
  } else if (Array.isArray(creator_labels)) {
    for (let i = 0; i < creator_labels.length; i++) {
      // TODO: this is technically not RO-Crate conform, should generate blank node
      const creator = {
        "@type": "Person",
        name: creator_labels[i],
      };
      rocrate["@graph"][1].author = creator;
    }
  }
  if (object.content.mapping_set_title) {
    rocrate["@graph"][1].name = object.content.mapping_set_title;
  }
  if (object.content.mapping_date) {
    rocrate["@graph"][1].dateCreated = object.content.mapping_date;
  }
  return rocrate;
}
