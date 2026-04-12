import mongoose from "mongoose";
import { pazzaPostSchema, pazzaFolderSchema } from "./schema.js";

const PazzaPostModel = mongoose.model("PazzaPostModel", pazzaPostSchema);
const PazzaFolderModel = mongoose.model("PazzaFolderModel", pazzaFolderSchema);

export {
  PazzaPostModel,
  PazzaFolderModel
};