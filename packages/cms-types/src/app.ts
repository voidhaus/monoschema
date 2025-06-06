import { NamespaceWrapper } from "@voidhaus/rpc";
import { BlockTypesNamespace } from "./blockTypes";
import { ContentNamespace } from "./content";

export type CmsApp = NamespaceWrapper<{
  blockTypes: BlockTypesNamespace;
  content: ContentNamespace;
}>