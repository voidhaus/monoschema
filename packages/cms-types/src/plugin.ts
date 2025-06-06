import { Plugin } from "@voidhaus/monoschema";
import { PropertyObject } from "./property";
import { BuildingBlockObject } from "./buildingBlock";
import { ContentKeyObject } from "./contentKey";
import { ContentObject } from "./content";

export const CmsPlugin: Plugin = {
  name: "CMS Plugin",
  description: "A plugin for CMS",
  version: "1.0.0",
  types: [
    PropertyObject, 
    BuildingBlockObject,
    ContentKeyObject,
    ContentObject,
  ],
};
