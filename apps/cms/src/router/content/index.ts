import { namespace } from "@voidhaus/rpc";
import { getContentByKey } from "./getContentByKey";
import { createContent } from "./createContent";

export const content = namespace({
  getContentByKey,
  createContent,
})