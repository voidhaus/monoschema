import { namespace } from "@voidhaus/rpc";
import { getBlockTypes } from "./getBlockTypes";
import { createBlockType } from "./createBlockType";

export const blockTypes = namespace({
  getBlockTypes,
  createBlockType,
})