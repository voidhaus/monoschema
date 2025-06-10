import { Plugin } from "@voidhaus/monoschema";
import { BuildingBlockKeyObject, BuildingBlockObject, CheckContentBlockExistsFn, ContentKeyObject, ContentObject, PropertyObject, PropertyTypeObject } from "./pluginTypes";

export type ConfigureCmsPluginOptions = {
  checkContentBlockExists?: CheckContentBlockExistsFn;
}

export const configureCmsPlugin = (
  opts?: ConfigureCmsPluginOptions
) => {
  if (opts?.checkContentBlockExists) {
    Object.assign(ContentKeyObject, {
      contentKeyExists: opts.checkContentBlockExists,
    })
  }

  const cmsPlugin: Plugin = {
    name: "CMS Plugin",
    description: "A plugin for CMS",
    version: "1.0.0",
    types: [
      PropertyTypeObject,
      PropertyObject,
      BuildingBlockKeyObject,
      BuildingBlockObject,
      ContentKeyObject,
      ContentObject,
    ],
  };

  return cmsPlugin
}
