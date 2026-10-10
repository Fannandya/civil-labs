import { readFile } from "node:fs/promises";
import { extname, resolve as resolvePath } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const sourceRoot = fileURLToPath(new URL("../src/", import.meta.url));

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    let target = resolvePath(sourceRoot, specifier.slice(2));
    if (!extname(target)) target += ".ts";
    return { url: pathToFileURL(target).href, shortCircuit: true };
  }
  if (specifier.startsWith(".") && !extname(specifier) && context.parentURL?.endsWith(".ts")) {
    return nextResolve(`${specifier}.ts`, context);
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.endsWith(".ts")) {
    return nextLoad(url, context);
  }

  const source = await readFile(fileURLToPath(url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: fileURLToPath(url),
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return { format: "module", source: outputText, shortCircuit: true };
}
