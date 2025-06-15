import { NamespaceWrapper } from "@voidhaus/rpc";
import { GetBlockTypesProcedure } from "./getBlockTypes";
import { CreateBlockTypeProcedure } from "./createBlockType";

export * from "./getBlockTypes";
export * from "./createBlockType";

export type BlockTypesNamespace = NamespaceWrapper<{
  getBlockTypes: GetBlockTypesProcedure;
  createBlockType: CreateBlockTypeProcedure;
}>
