import { NamespaceWrapper } from "@voidhaus/rpc";
import { GetContentByKeyProcedure } from "./getContentByKey";

export * from "./getContentByKey";

export type ContentNamespace = NamespaceWrapper<{
  getContentByKey: GetContentByKeyProcedure;
}>
