#!/usr/bin/env node

import chalk from "chalk";
import { execSync } from "child_process";

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: "inherit" });
  } catch (e) {
    console.error(`Failed to execute ${command}`, e);
    return false;
  }
  return true;
};

const repoName = process.argv[2];
if (!repoName) {
  console.error("Please provide a repository name as the second argument");
  process.exit(-1);
}

const gitCheckoutCommand = `git clone --depth 1 https://github.com/asharibali/create-edu-dapp ${repoName}`;
const installFrontendDepsCommand = `cd ${repoName} && cd frontend && npm install`;
const installBackendDepsCommand = `cd ${repoName} && cd backend && npm install`;

console.log(`Cloning the repository with name ${repoName}`);
const checkedOut = runCommand(gitCheckoutCommand);
if (!checkedOut) {
  console.error(`Failed to clone repository ${repoName}`);
  process.exit(-1);
}

console.log(`Installing frontend dependencies for ${repoName}`);
const installedFrontendDeps = runCommand(installFrontendDepsCommand);
if (!installedFrontendDeps) {
  console.error(`Failed to install frontend dependencies for ${repoName}`);
  process.exit(-1);
}

console.log(`Installing backend dependencies for ${repoName}`);
const installedBackendDeps = runCommand(installBackendDepsCommand);
if (!installedBackendDeps) {
  console.error(`Failed to install backend dependencies for ${repoName}`);
  process.exit(-1);
}

console.log(chalk.yellow("\n-----------------------"));
console.log(chalk.green(`\nSuccess! 🎉`));
console.log("\nFollow the installation guide in README.md");

console.log(chalk.cyan("\nTo set up the backend, run the following commands:"));
console.log(chalk.cyan(`cd ${repoName} && cd backend`));
console.log(
  chalk.yellow(
    "\n⚠️ Please create a .env file in the backend directory and paste your Metamask private key:"
  )
);
console.log(chalk.cyan("ACCOUNT_PRIVATE_KEY="), "<YOUR_KEY>");
console.log(chalk.cyan("\t npx hardhat compile"));
console.log(chalk.cyan("\t npx hardhat test"));
console.log(
  chalk.cyan("\t npx hardhat run scripts/deploy.js --network opencampus")
);
console.log(
  chalk.cyan(
    "\t npx hardhat verify --network opencampus <deployed-contract-address>"
  )
);

console.log(
  chalk.cyan(
    "\nTo start the frontend development server, run the following commands:"
  )
);
console.log(chalk.cyan(`cd ${repoName} && cd frontend`));
console.log(chalk.cyan("npm run dev"));

console.log("\nHappy Building on Open Campus L3 chain!");
console.log(chalk.yellow("\n-----------------------"));
