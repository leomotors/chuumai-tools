import { render } from "./commands/render";

const command = process.argv[2];

if (command === "render") {
  render()
    .then(() => {
      console.log("✅ Render successful");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Render failed:", err);
      process.exit(1);
    });
} else {
  console.log("Unknown Command");
}
