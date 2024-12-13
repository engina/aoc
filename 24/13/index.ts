import { Day } from "../../main";
import { run } from "./13";

export default {
  name: "Claw Contraption",
  year: 24,
  day: 13,
  parts: [
    {
      runner: (input: string) => {
        return run(input);
      },
      expected: "",
    },
    {
      runner: (input: string) => {
        return "";
      },
      expected: "",
    },
  ],
} as Day;
