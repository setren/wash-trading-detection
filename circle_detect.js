const { readdirSync, readFileSync } = require("fs");
const Deque = require("double-ended-queue");
const DATA_DIR = "./nft_data";

// for ERC 721
function detect_cycle(edges) {
  let graph = {}; // account to a list of next accounts
  let transact_time = {}; // {account address: time}, erase when backtrack
  let cycle_occurence = {}; // the number of times in cycles for an address
  let visited = [];

  // sort edges in increasing order
  edges.sort((a, b) => a["time"] - b["time"]);

  for (const edge of edges) {
    if (!graph[edge["from"]]) {
      graph[`${edge["from"]}`] = new Deque();
    }
    graph[edge["from"]]?.push({
      to: edge["to"],
      time: edge["time"],
      id: edge["id"], // transaction id
    });
  }

  function dfs(address) {
    if (visited.includes(address)) {
      return false;
    }
    visited.push(address);
    while (graph[address] && graph[address].length) {
      const d = graph[address].shift();
      if (!dfs(d["to"])) {
        if (!cycle_occurence[address]) {
          cycle_occurence[address] = 0;
        }
        cycle_occurence[address] += 1;
      }
    }
    return true;
  }

  // the start node is the node with smallest time
  const start_address = edges[0]["from"];
  dfs(start_address);
  return cycle_occurence;
}

function main() {
  const files = readdirSync(DATA_DIR);
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    const contents = readFileSync(`${DATA_DIR}/${file}`, "utf-8")
      .replaceAll("False", "false")
      .replaceAll("True", "true")
      .replaceAll(`'`, `"`);
    const edges = contents
      .split(/\r?\n/)
      .filter((element) => {
        return element !== "";
      })
      .map((item) => JSON.parse(item));
    console.log(edges[0]["asset"]["tokenId"], detect_cycle(edges));
  }
}

main();
