const path = require("path");
const fs = require("fs");
const glob = require("glob");
const prettier = require("prettier");

const dir = path.resolve(__dirname, process.argv[2]);

glob(`${dir}/**/*.graphql`, (error, files) => {
  console.log(`Processing ${files.length} .graphql files`);

  for (const file of files) {
    const oldFileName = file.split("/").at(-1);
    const newFileName = oldFileName.replace("graphql", "js");
    const className = oldFileName.replace(".graphql", "");

    const oldContents = fs.readFileSync(file).toString();
    const lines = oldContents.split("\n");

    const imports = lines
      .filter((line) => line.includes("#import"))
      .map((line) => {
        const importSegments = line
          .replace(/#import "([^"]+)"/gi, "$1")
          .split("/");
        const name = importSegments.pop().replace(".graphql", "");
        const path = importSegments.concat([name]).join("/");
        return { name, path };
      });

    const headImports = imports
      .map(({ name, path }) => `import ${name} from "${path}";`)
      .join("\n");

    const gqlImports = imports.map(({ name }) => `\${${name}}`).join("\n");

    const rawGql = lines
      .filter((line) => line && !line.includes("#import"))
      .map((line) => `  ${line}`)
      .join("\n");

    const newContents = prettier.format(
      `
        import gql from "graphql-tag";
        ${headImports}

        const ${className} = gql\`
          ${gqlImports}

          ${rawGql}
        \`;

        export default ${className};
      `,
      { parser: "babel" }
    );

    console.log(`  ${file.replace(dir, "")}`);
    fs.writeFileSync(file.replace(oldFileName, newFileName), newContents);
    fs.unlinkSync(file);
  }
});

glob(`${dir}/**/*.{js,jsx,ts,tsx}`, (error, files) => {
  console.log(`Processing ${files.length} .{js,jsx,ts,tsx} files`);

  for (const file of files) {
    const contents = fs.readFileSync(file).toString();

    if (!contents.includes(".graphql")) {
      continue;
    }

    const lines = contents.split("\n").map((line) => {
      return line.replace(".graphql", "");
    });

    console.log(`  ${file.replace(dir, "")}`);
    fs.writeFileSync(file, lines.join("\n"));
  }
});
