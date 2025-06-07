import { Plugin } from "@voidhaus/monoschema";
import { BuildingBlockObject, ContentKeyObject, ContentObject, PropertyObject } from "./pluginTypes";

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
