import { NamespaceWrapper } from "@voidhaus/rpc";
import { GetContentByKeyProcedure } from "./getContentByKey";
import { CreateContentProcedure } from "./createContent";

export * from "./getContentByKey";
export * from "./createContent";

export type ContentNamespace = NamespaceWrapper<{
  getContentByKey: GetContentByKeyProcedure;
  createContent: CreateContentProcedure;
}>
