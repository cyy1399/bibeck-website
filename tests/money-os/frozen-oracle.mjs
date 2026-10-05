import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { frozenCommit, frozenFiles } from "./frozen-runtime-manifest.mjs";

/** Independent read-only oracle from the pinned git objects, never current wrappers. */
export async function loadFrozenOracle() {
  const root=fileURLToPath(new URL("../../",import.meta.url));
  const temp=mkdtempSync(path.join(os.tmpdir(),"bibeck-s01-frozen-"));
  const sources=new Map();
  try {
    const tree=execFileSync("git",["ls-tree","-r",frozenCommit,"docs/money-model/schemas","docs/money-model/registries","docs/money-model/reference"],{cwd:root,encoding:"utf8"});
    assert.deepEqual(tree.trim().split("\n").map(line=>{const [meta,p]=line.split("\t");return {path:p,blob:meta.split(" ")[2]};}),frozenFiles,"Pinned historical tree must not drift");
    const objects=execFileSync("git",["cat-file","--batch"],{cwd:root,input:frozenFiles.map(f=>f.blob).join("\n")+"\n",maxBuffer:4*1024*1024});
    let cursor=0;
    for (const file of frozenFiles) {
      const end=objects.indexOf(10,cursor); const [hash,type,length]=objects.subarray(cursor,end).toString("utf8").split(" ");
      assert.equal(hash,file.blob); assert.equal(type,"blob");
      const body=objects.subarray(end+1,end+1+Number(length)); cursor=end+2+Number(length);
      assert.equal(createHash("sha1").update(Buffer.from("blob "+body.length+"\0")).update(body).digest("hex"),file.blob);
      sources.set(file.path,body.toString("utf8"));
      const target=path.join(temp,file.path); mkdirSync(path.dirname(target),{recursive:true}); writeFileSync(target,body);
    }
    writeFileSync(path.join(temp,"package.json"),'{"type":"module"}');
    const load=name=>import(pathToFileURL(path.join(temp,"docs/money-model/reference/"+name+".ts")).href);
    const [normalizer,evaluator,validator]=await Promise.all([load("profile-normalizer"),load("reference-evaluator"),load("output-validator")]);
    return {normalizer,evaluator,validator,sources,cleanup:()=>rmSync(temp,{recursive:true,force:true})};
  } catch (error) {rmSync(temp,{recursive:true,force:true});throw error;}
}
