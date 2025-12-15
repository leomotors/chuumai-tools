import { render } from "./commands/render";
import { yaml } from "./commands/yaml";

const command = process.argv[2];

switch (command) {
  case "render": {
    render()
      .then(() => {
        console.log("✅ Render successful");
        process.exit(0);
      })
      .catch((err) => {
        console.error("❌ Render failed:", err);
        process.exit(1);
      });
    break;
  }
  case "yaml": {
    yaml()
      .then(() => {
        console.log("✅ YAML fill successful");
        process.exit(0);
      })
      .catch((err) => {
        console.error("❌ YAML fill failed:", err);
        process.exit(1);
      });
    break;
  }
  default: {
    console.log("Unknown Command");
    process.exit(1);
  }
}
