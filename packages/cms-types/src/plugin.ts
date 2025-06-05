import { Plugin } from "@voidhaus/monoschema";
import { PropertyObject } from "./property";
import { BuildingBlockObject } from "./buildingBlock";

export const CmsPlugin: Plugin = {
  name: "CMS Plugin",
  description: "A plugin for CMS",
  version: "1.0.0",
  types: [PropertyObject, BuildingBlockObject],
};
